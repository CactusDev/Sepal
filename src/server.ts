
import * as express from "express"
import * as http from "http"
import * as WebSocket from "ws"

export class Server {

	private app: any
	private server: any
	private wss: any

	constructor(public host: string, public port: number) {
	}

	public async listen() {
		this.app = express()
		this.server = http.createServer(this.app)
		this.wss = new WebSocket.Server({ server: this.server })

		this.wss.on("connection", (ws: WebSocket) => {
			ws.on("message", (message: string) => {

			})
		})

		this.server.listen(`${this.host}:${this.port}`, () => console.log("Listening."))
	}
}
