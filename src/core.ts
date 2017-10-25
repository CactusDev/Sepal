
import { Injectable } from "@angular/core";

import { Logger } from "cactus-stl";
import { Socket } from "./socket";

@Injectable()
export class Core {

	constructor(private socket: Socket) {

	}

	public async start() {
		Logger.log("core", "Starting...");

		process.on("SIGTERM", this.stop);
		process.on("SIGINT", this.stop);

		await this.socket.listen();
	}

	private async stop() {
		Logger.log("core", "Shutting down...");

		await this.socket.end();

		process.exit(0);
	}
}
