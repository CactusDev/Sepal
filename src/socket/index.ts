
import { Config } from "../config";

import { Logger } from "cactus-stl";
import { Server, ServerOptions } from "ws";

import { tryJson } from "../util";

import { PacketJoinChannel, PacketLeaveChannel } from "./packet";

import * as WSErr from "ws-error";

export class Socket {

	private server: Server;

	constructor(private config: Config) {

	}

	public async listen() {
		const options: ServerOptions = {
			port: this.config.server.port
		};
		this.server = new Server(options);

		this.server.on("error", (error) => Logger.error("socket", error.message));

		this.server.once("listening", () => {
			console.log("Listening on port" + options.port);
		});

		this.server.on("connection", (socket) => {
			socket.on("message", (message: string) => {
				const json = tryJson(message);
				if (!json) {
					// Not json, bad data
					return socket.send(WSErr.invalidData("message not json").string());
				}
				// Make sure we have the basic information needed
				// to do something
				if (!json.type || !json.data) {
					return socket.send(WSErr.invalidData("packet has no useful information").string());
				}

				switch (json.type) {
				case "join":
					console.log("JOIN", json);
					return socket.send(WSErr.ok().string())
				case "leave":
					console.log("LEAVE", json);
					return socket.send(WSErr.ok().string())
				default:
					return socket.send(WSErr.invalidData("invalid packet type").string());
				}
			});
		});
	}

	public async end() {
		// Tell all clients
		this.server.clients.forEach(client => {
			client.send(WSErr.closing().string());
			client.close();
		});
		// Now we can close!
		this.server.close();
	}
}