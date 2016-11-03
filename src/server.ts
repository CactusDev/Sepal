/// <reference path="../typings/globals/ws/index.d.ts" />
/// <reference path="../typings/globals/node/index.d.ts" />

import { Database } from "./database/database";

import { ErrorPacket } from "./packet/error";
import { EventPacket } from "./packet/event";

let Websocket = require("ws");
let WebSocketServer = Websocket.Server;

export class Server {
    port: number;
    server: any;

    clients: Object[];

    constructor(port?: number) {
        this.clients = [{}];
        if (port) {
            this.port = port;
        }
    }

    listen() {
        let server = new WebSocketServer({ port: this.port });
        let database = new Database(this);
        this.server = server;

        database.watchCommands();

        server.on("connection", (connection: any) => {
            connection.on("message", (message: string) => {
                let packet = JSON.parse(message);
                if (!packet.type) {
                    let response = new ErrorPacket("Packet type was not supplied", 1000, null);
                    connection.send(JSON.stringify(response.parse()));
                }

                if (!packet.channel) {
                    let response = new ErrorPacket("Channel was not supplied", 1001, null);
                    connection.send(JSON.stringify(response.parse()));
                }

                // TODO: Check if the channel supplied is a valid channel

                this.clients[connection] = packet.channel;
            });
        });
    }

     broadcastToChannel(channel: string, action: string, event: string, data: Object) {
        // this.server.clients.forEach((client: any) => client.send(JSON.stringify(data)));
        this.server.clients.forEach((client: any) => {
            if (channel === this.clients[client]) {
                let response = new EventPacket(event, channel, action, data);
                client.send(JSON.stringify(response.parse()));
            }
        });
    }
}
