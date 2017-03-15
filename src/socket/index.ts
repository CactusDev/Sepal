
import { Server, IServerOptions } from "ws";
import Logger from "../logger";

/**
 * Create the main websocket that sends all the outgoing events,
 *
 * @export
 * @class SepalSocket
 */
export class SepalSocket {

    private socket: Server;

    /**
     * Creates an instance of SepalSocket.
     *
     * @memberOf SepalSocket
     */
    public constructor(private config: IConfig) {

    }

    /**
     * Create a new socket and listen on the port in the config
     *
     * @memberOf SepalSocket
     */
    public async create(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const options: IServerOptions = {
                port: this.config.socket.port
            };

            this.socket = new Server(options);

            this.socket.on("error", (error: Error) => {
                Logger.error(error);
            });

            this.socket.once("listening", () => {
                Logger.log(`Listening on port: ${options.port}`);
                resolve();
            });

            this.socket.on("connection", (connection) => {
                connection.on("message", (message: any) => {
                    console.log(message);
                });
            });
        });
    }
}
