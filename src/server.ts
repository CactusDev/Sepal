/// <reference path="../typings/ws/ws.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import { Database } from "./database/database";

let Websocket = require("ws");
let WebSocketServer = Websocket.Server;

export class Server {
    port: number;
    server: any;


    constructor(port?: number) {
        if (port) {
            this.port = port;
        }
    }

    listen() {
        let server = new WebSocketServer({ port: this.port });
        let database = new Database(server);
        this.server = server;

        database.watchCommands();

        server.on("connection", (connection: any) => {
            connection.on("message", (message: any) => {
                let packet = JSON.parse(message);
                if (!packet.type) {
                    connection.send("a");
                }
            });
        });
    }

     // FIXME: This is stupid to do
     broadcastToChannel(server: any, channel: string, data: Object) {
        server.clients.forEach((client: any) => client.send(JSON.stringify(data)));
    }
}
