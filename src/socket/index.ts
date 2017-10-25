
import { Config } from "../config";

import { Logger } from "cactus-stl";
import { Server, ServerOptions } from "ws";

import * as WSErr from "ws-error";

export class Socket {

	private socket: Server;

	constructor(private config: Config) {

	}

	public async listen() {
		const options: ServerOptions = {
			port: this.config.server.port
		};
		this.socket = new Server(options);

		this.socket.on("error", (error) => Logger.error("socket", error.message));

		this.socket.once("listening", () => {
			Logger.log(`Listening on port ${options.port}`);
		});

		this.socket.on("connection", (socket) => {
			socket.on("message", (message) => {
				
			});
		});
	}

	public async end() {
		Logger.log("Disconnecting all clients...");
		// Tell all clients
		this.socket.clients.forEach(client => {
			client.send(WSErr.closing().string());
			client.close();
		});
		Logger.log("Closing socket...");
		// Now we can close!
		this.socket.close();
	}
}