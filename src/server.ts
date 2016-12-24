import { RethinkDB } from "./rethinkdb";
import { Redis } from "./redis";

import { Repeat } from "./repeat";

import { Logger } from "./logging";

import { ErrorPacket } from "./packet/error";
import { EventPacket } from "./packet/event";
import { SuccessPacket } from "./packet/success";

import { IncomingEventPacket } from "./packet/incoming/event";
import { SubscribePacket } from "./packet/incoming/subscribe";

import { Server as WebSocketServer } from "ws";

interface IConnections {
    [channel: string]: [{
        connection: any;
        channel: string
    }];
}

export class Server {
    socket: WebSocketServer;
    rethinkdb: RethinkDB;
    repeat: Repeat;
    clients: IConnections = {};

    constructor(public redis: Redis, public config: IConfig) {
        // Create the Database models / listeners.
        this.rethinkdb = new RethinkDB(this.config, this);
        // Listen for changes sent from the RethinkDB server to broadcast to channels.
        this.rethinkdb.on("broadcast:channel", (data: IChannelEvent) => {
            this.broadcastToChannel(data.token, data.action, data.event, data.service, data.data);
        });

        this.repeat = new Repeat(this, this.rethinkdb);
    }

    listen() {
        this.rethinkdb.watchCommands();
        this.rethinkdb.watchQuotes();
        this.rethinkdb.watchRepeats();
        this.rethinkdb.watchConfig();

        Promise.resolve(this.rethinkdb.getAllReapeats()).then((data: any) => {
            Logger.log("Starting repeats...");
            data.forEach((repeat: any) => {
                this.repeat.addRepeat(repeat);
            });
        });

        this.socket = new WebSocketServer({ port: this.config.socket.port });
        // Listen for connections.
        this.socket.on("connection", (connection: any) => {
            connection.on("message", (message: string) => {
                let packet: any = {};

                try {
                    packet = JSON.parse(message);
                } catch (e) {
                    connection.send(new ErrorPacket("Packet is invalid or blank", 999, null).parse());
                    return;
                }

                if (!packet.type) {
                    connection.send(new ErrorPacket("Packet doesn't contain a type", 1000, null).parse());
                    return;
                }

                if (packet.type === "subscribe") {
                    let raw = new SubscribePacket(JSON.parse(message));
                    let error = raw.parse();
                    if (error != null) {
                        connection.send(new ErrorPacket(error, 1004, null).parse());
                        return;
                    } else {
                        connection.send(new SuccessPacket(`Subscribed to events in ${packet.channel}`, "subscribe").parse());
                        
                        if (this.clients[packet.channel] === (null || undefined)) {
                            this.clients[packet.channel] = [{ "connection": connection, "channel": packet.channel }];
                        } else {
                            this.clients[packet.channel].push({ "channel": packet.channel, "connection": connection });
                        }
                    }
                } else if (packet.type === "event") {
                    let raw = new IncomingEventPacket(JSON.parse(message));
                    let error = raw.parse();

                    if (error != null) {
                        connection.send(new ErrorPacket(error, 1004, null).parse());
                        return;
                    }
                } else {
                    connection.send(new ErrorPacket("Packet type is invalid", 1003, null).parse());
                    return;
                }
            });
        });
    }

    broadcastToChannel(channel: string, action: string, event: string, service: string, data: any) {
        Object.keys(this.clients).forEach((client: any) => {
            if (channel == this.clients[client][0]["channel"]) {
                let response = new EventPacket(event, channel, action, service, data);

                this.clients[client].forEach((conn: any) => {
                    try {
                        conn["connection"].send(JSON.stringify(response.parse()));
                    } catch(e) {
                        delete this.clients[client][conn]
                        return;
                    }
                });
            }
        });
    }
}
