import { RethinkDB } from "./rethinkdb";
import { Redis } from "./redis";

import { Logger } from "./logging";

import { ErrorPacket } from "./packet/error";
import { EventPacket } from "./packet/event";

import { IncomingEventPacket } from "./packet/incoming/event";
import { SubscribePacket } from "./packet/incoming/subscribe";

import { Server as WebSocketServer } from "ws";

export class Server {
    socket: WebSocketServer;
    rethinkdb: RethinkDB;
    clients: Object[];

    constructor(public redis: Redis, public config: IConfig) {
        // Create the Database models / listeners.
        this.rethinkdb = new RethinkDB(this.config);
        // Listen for changes sent from the RethinkDB server to broadcast to channels.
        this.rethinkdb.on("broadcast:channel", (data: IChannelEvent) => {
            this.broadcastToChannel(data.channel, data.action, data.event, data.service, data.data);
        });
    }

    listen() {
        this.socket = new WebSocketServer({ port: this.config.socket.port });
        // Listen for connections.
        this.socket.on("connection", (connection: any) => {
            connection.on("message", (message: string) => {
                let packet: any = {};

                if (this.clients[connection] != null || this.clients[connection] !== "") {
                    let packet = new IncomingEventPacket(JSON.parse(message));
                    let error = packet.parse();
                    if (error != null) {
                        connection.send(new ErrorPacket(error, 1004, null).parse());
                    }
                } else {
                    let packet = new SubscribePacket(JSON.parse(message));
                    let error = packet.parse();
                    if (error != null) {
                        connection.send(new ErrorPacket(error, 1004, null).parse());
                    }
                }
            });
        });
    }

     broadcastToChannel(channel: string, action: string, event: string, service: string, data: any) {
        this.socket.clients.forEach((client: any) => {
            if (channel === this.clients[client]) {
                let response = new EventPacket(event, channel, action, service, data);
                client.send(JSON.stringify(response.parse()));
            }
        });
    }
}
