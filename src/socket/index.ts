
import { Server, IServerOptions } from "ws";
import Logger from "../logger";
import { PacketParser } from "../packets/packet";

import { JoinPacketParser, ErrorBuilder } from "../packets";

interface PacketParsers {
    [type: string]: PacketParser;
}

/**
 * Create the main websocket that sends all the outgoing events,
 *
 * @export
 * @class SepalSocket
 */
export class SepalSocket {

    /**
     * Websocket server
     * 
     * @private
     * @type {Server}
     * @memberOf SepalSocket
     */
    private socket: Server;

    /**
     * List of parsers with the packet type that they parse
     * 
     * @private
     * @type {PacketParsers}
     * @memberOf SepalSocket
     */
    private parsers: PacketParsers;

    private errorBuilder: ErrorBuilder;

    /**
     * Creates an instance of SepalSocket.
     *
     * @memberOf SepalSocket
     */
    public constructor(private config: IConfig) {
        this.errorBuilder = new ErrorBuilder();

        this.parsers = {
            join: new JoinPacketParser()
        };
    }

    /**
     * Create a new socket and listen on the port in the config
     *
     * @memberOf SepalSocket
     */
    public async create(): Promise<any> {
        const options: IServerOptions = {
            port: this.config.socket.port
        };

        this.socket = new Server(options);

        this.socket.on("error", (error: Error) => {
            Logger.error(error);
        });

        this.socket.once("listening", () => {
            Logger.log(`Listening on port: ${options.port}`);
        });

        this.socket.on("connection", (connection) => {
            connection.on("message", (message: string) => {
                let packet: Object;
                try {
                    packet = JSON.parse(message);
                } catch (e) {
                    this.errorBuilder.create("packet not json!", 1000).then((error: string) => {
                        connection.send(error);
                    });
                    return;
                }

                if (!packet.hasOwnProperty("type")) {
                    this.errorBuilder.create("packet didn't contain a type!", 1001).then((error: string) => {
                        connection.send(error);
                    });
                    return;
                }

                if (!packet.hasOwnProperty("data")) {
                    this.errorBuilder.create("packet didn't contain data!", 1002).then((error: string) => {
                        connection.send(error);
                    });
                    return;
                }

                if (!((packet as any).data as Object).hasOwnProperty("channel")) {  // Don't let Art see this
                    this.errorBuilder.create("packet didn't contain a channel!", 1003).then((error: string) => {
                        connection.send(error);
                    });
                    return;
                }

                Logger.debug(packet);

                const packetData = packet as any;
                if (packetData.type in this.parsers) {
                    this.parsers[packetData.type].parse(packetData.data).then((parsed) => {
                        console.log(typeof(parsed));
                    });
                } else {
                    this.errorBuilder.create("packet type is invalid!", 1004).then((error: string) => {
                        connection.send(error);
                    });
                    return;
                }
            });
        });
    }
}
