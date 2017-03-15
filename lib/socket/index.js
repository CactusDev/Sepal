"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const logger_1 = require("../logger");
class SepalSocket {
    constructor(config) {
        this.config = config;
    }
    create() {
        const options = {
            port: this.config.socket.port
        };
        this.socket = ws_1.createServer(options);
        this.socket.on("error", (error) => {
            logger_1.default.error(error);
        });
        this.socket.on("connection", (connection) => {
            connection.on("message", (message) => {
                logger_1.default.log(typeof (message));
            });
        });
    }
}
exports.SepalSocket = SepalSocket;
