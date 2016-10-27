/// <reference path="../typings/ws/ws.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import { Database } from "./database/database";

let Websocket = require("ws");
let WebSocketServer = Websocket.Server;

export class Server {
    port: number;
    server: any;

    database = new Database();

    constructor(port: number) {
        this.port = port;
    }

    listen() {
        let server = new WebSocketServer({ port: this.port });
        this.server = server;

        this.database.watchCommands();

        server.on("connection", (connection: any) => {
            connection.on("message", (message: any) => {
                let packet = JSON.parse(message);
                if (!packet.type) {
                    connection.send("a");
                }
            });
        });
    }
}
