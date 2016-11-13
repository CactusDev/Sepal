import { RethinkDB } from "./rethinkdb";
import { Redis } from "./redis";

import { Logger } from "./logging";

import { ErrorPacket } from "./packet/error";
import { EventPacket } from "./packet/event";
import { SuccessPacket } from "./packet/success";

import { IncomingEventPacket } from "./packet/incoming/event";
import { SubscribePacket } from "./packet/incoming/subscribe";

import { Server as WebSocketServer } from "ws";

interface IConnections {
    [channel: string]: {
        connection: any;
        channel: string;
    }[];
}

export class Server {
    socket: WebSocketServer;
    rethinkdb: RethinkDB;
    clients: IConnections = {};

    constructor(public redis: Redis, public config: IConfig) {
        // Create the Database models / listeners.
        this.rethinkdb = new RethinkDB(this.config);
        // Listen for changes sent from the RethinkDB server to broadcast to channels.
        this.rethinkdb.on("broadcast:channel", (data: IChannelEvent) => {
            this.broadcastToChannel(data.channel, data.action, data.event, data.service, data.data);
        });
    }

    listen() {
        this.rethinkdb.watchCommands();

        this.socket = new WebSocketServer({ port: this.config.socket.port });
        // Listen for connections.
        this.socket.on("connection", (connection: any) => {
            connection.on("message", (message: string) => {
                let packet: any = {};

                try {
                    packet = JSON.parse(message);
                } catch (e) {
                    connection.send(new ErrorPacket("Packet is invalid or blank", 999, null).parse());
                }

                if (!packet.type) {
                    connection.send(new ErrorPacket("Packet doesn't contain a type", 1000, null).parse());
                }


                if (packet.type === "subscribe") {
                    let raw = new SubscribePacket(JSON.parse(message));
                    let error = raw.parse();
                    if (error != null) {
                        connection.send(new ErrorPacket(error, 1004, null).parse());
                    } else {
                        connection.send(new SuccessPacket(`Subscribed to events in ${packet.channel}`, "subscribe").parse());
                    }
                } else if (packet.type === "event") {
                    let raw = new IncomingEventPacket(JSON.parse(message));
                    let error = raw.parse();
                    if (error != null) {
                        connection.send(new ErrorPacket(error, 1004, null).parse());
                    }
                } else {
                    connection.send(new ErrorPacket("Packet type is invalid", 1003, null).parse());
                }
            });
        });
    }

     broadcastToChannel(channel: string, action: string, event: string, service: string, data: any) {
        this.socket.clients.forEach((client: any) => {
            // if (channel === this.clients[channel]["channel"]) {
            let response = new EventPacket(event, channel, action, service, data);
            client.send(JSON.stringify(response.parse()));
            // }
        });
    }
}
