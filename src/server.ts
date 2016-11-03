/// <reference path="../typings/globals/ws/index.d.ts" />
/// <reference path="../typings/globals/node/index.d.ts" />

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
        let database = new Database(this);
        this.server = server;

        database.watchCommands();

        server.on("connection", (connection: any) => {
            connection.on("message", (message: string) => {
                let packet = JSON.parse(message);
                if (!packet.type) {
                    connection.send("a");
                }
            });
        });
    }

     // FIXME: This is stupid to do
     broadcastToChannel(channel: string, data: Object) {
        this.server.clients.forEach((client: any) => client.send(JSON.stringify(data)));
    }
}
