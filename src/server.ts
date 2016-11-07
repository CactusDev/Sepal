import { Rethink } from "./rethink/rethink";
import { Redis } from "./redis";

import * as Logger from "./logging/logger";

import { ErrorPacket } from "./packet/error";
import { EventPacket } from "./packet/event";

import { IncomingEventPacket } from "./packet/incoming/event";
import { SubscribePacket } from "./packet/incoming/subscribe";

const Websocket = require("ws");
const WebSocketServer = Websocket.Server;

export class Server {
    server: this;
    clients: Object[];

    constructor(public redis: Redis, public port = 8080) {}

    listen() {
        let server = new WebSocketServer({ port: this.port });
        let rethink = new Rethink(this);

        this.server = server;

        rethink.watchCommands();

        server.on("connection", (connection: any) => {
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

     broadcastToChannel(channel: string, action: string, event: string, service: string, data: Object) {
        this.server.clients.forEach((client: any) => {
            if (channel === this.clients[client]) {
                let response = new EventPacket(event, channel, action, service, data);
                client.send(JSON.stringify(response.parse()));
            }
        });
    }
}
