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
                let packet: any = {};
                try {
                    packet = JSON.parse(message);
                } catch (e) {
                    let response = new ErrorPacket("The packet is invalid or blank", 999, null);
                    connection.send(JSON.stringify(response.parse()));
                }

                if (!packet.type) {
                    let response = new ErrorPacket("Packet type was not supplied", 1000, null);
                    connection.send(JSON.stringify(response.parse()));
                } else if (!packet.channel) {
                    let response = new ErrorPacket("Channel was not supplied", 1001, null);
                    connection.send(JSON.stringify(response.parse()));
                } else if (packet.type !== "subscribe") {
                    let response = new ErrorPacket("Packet type is invalid", 1003, null);
                    connection.send(JSON.stringify(response.parse()));
                }

                let channelExists = database.channelExists(packet.channel);
                console.log(channelExists);

                if (!channelExists) {
                    let response = new ErrorPacket("Channel does not exist.", 1002, null)
                    connection.send(JSON.stringify(response.parse()));
                } else {
                    this.clients[connection] = packet.channel;

                    let response = new EventPacket("subscribed", packet.channel, null, null, null);
                    connection.send(JSON.stringify(response.parse()));
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
