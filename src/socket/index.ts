
import { Server, IServerOptions } from "ws";
import Logger from "../logger";
import { PacketParser } from "../packets/packet";

import { JoinPacketParser, ErrorBuilder, JoinedBuilder } from "../packets";
import { Rethink } from "../rethink";

/**
 * Types of packets to the parsers that handle them
 * 
 * @interface PacketParsers
 */
interface PacketParsers {
    [type: string]: PacketParser;
}

/**
 * Stores the clients for each channel
 * 
 * @interface ChannelClients
 */
interface ChannelClients {
    [channel: string]: any[];
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

    /**
     * Build custom JSON errors
     * 
     * @private
     * @type {ErrorBuilder}
     * @memberOf SepalSocket
     */
    private errorBuilder: ErrorBuilder;

    /**
     * Build channel joined packets
     * 
     * @private
     * @type {JoinedBuilder}
     * @memberOf SepalSocket
     */
    private joinedBuilder: JoinedBuilder;

    /**
     * Connected clients who have joined a channel
     * 
     * @private
     * @type {ChannelClients[]}
     * @memberOf SepalSocket
     */
    private clients: ChannelClients = {};

    /**
     * Creates an instance of SepalSocket.
     *
     * @memberOf SepalSocket
     */
    public constructor(private config: IConfig, private rethink: Rethink) {
        this.errorBuilder = new ErrorBuilder();
        this.joinedBuilder = new JoinedBuilder();

        this.parsers = {
            join: new JoinPacketParser()
        };

        rethink.on("broadcast:channel", (data: any) => {
            this.sendToChannel(data["data"]["channel"], data["data"]);
        });
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

                if (!((packet as any).data as Object).hasOwnProperty("channel")) {  // Don't let Art see this (or me for that matter)
                    this.errorBuilder.create("packet didn't contain a channel!", 1003).then((error: string) => {
                        connection.send(error);
                    });
                    return;
                }
                Logger.debug(packet);

                const packetData = packet as any;
                if (packetData.type in this.parsers) {
                    this.parsers[packetData.type].parse(packetData.data).then((parsed) => {
                        if (packetData.type === "join") {
                            if (this.clients[parsed.channel] === undefined) {
                                this.clients[parsed.channel] = [connection];
                            } else {
                                this.clients[parsed.channel].push(connection);
                            }

                            this.joinedBuilder.create(parsed.channel, true).then((joinedPacket: string) => {
                                connection.send(joinedPacket);
                            });
                        }
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

    /**
     * Send JSON data to a channel's subscribed clients
     * 
     * @param {string} channel 
     * @param {Object} data 
     * @returns {Promise<any>} 
     * 
     * @memberOf SepalSocket
     */
    public async sendToChannel(channel: string, data: Object): Promise<any> {
        let position = 0;
        this.clients[channel].forEach((client: WebSocket) => {
            try {
                client.send(JSON.stringify(data));
            } catch (e) {
                delete this.clients[channel][position];
            }
            position++;
        });
    }
}
