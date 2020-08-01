
import * as express from "express"

export class Server {

	private app: any
	private server: any

	constructor(public host: string, public port: number) {
	}

	public async listen() {
		this.app = express()
		this.app.use(express.json())
		this.app.use(express.urlencoded())

		this.app.listen(`${this.host}:${this.port}`, () => console.log("Sepal running."))
	}
}
