import { EventCache } from "../caching";
import { Server, IServerOptions } from "ws";
import { Logger } from "../logger";
import { PacketParser } from "../packets/packet";

import { JoinPacketParser, EventPacketParser, ErrorBuilder, JoinedBuilder } from "../packets";
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
    public constructor(private config: IConfig, public rethink: Rethink, private eventCache: EventCache) {
        this.errorBuilder = new ErrorBuilder();
        this.joinedBuilder = new JoinedBuilder();

        this.parsers = {
            join: new JoinPacketParser(),
            event: new EventPacketParser()
        };

        rethink.on("broadcast:channel", (data: any) => {
            this.sendToChannel(data["data"]["new_val"]["token"], data["event"], data["data"]["new_val"]);
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

            setInterval(() => {
                this.broadcast({type: "living"});
            }, 60000);
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
                        if (parsed === null) {
                            this.errorBuilder.create("packet data didn't contain all values.", 1005).then((error: string) => {
                                connection.send(error);
                                return;
                            });
                        }
                        if (packetData.type === "join") {
                            if (this.clients[parsed.channel] === undefined) {
                                this.clients[parsed.channel] = [connection];
                            } else {
                                this.clients[parsed.channel].push(connection);
                            }

                            this.joinedBuilder.create(parsed.channel, true).then((joinedPacket: string) => {
                                connection.send(joinedPacket);
                            });
                        } else if (packetData.type === "event") {
                            const cacheTime = parsed.cacheTime;
                            const channel = parsed.channel;
                            const user = parsed.user;
                            const event = parsed.event;

                            this.eventCache.cacheEvent(event, cacheTime, {
                                channel: channel,
                                user: user
                            }).then(() => {
                                connection.send(JSON.stringify({
                                    type: "cached",
                                    data: {
                                        event: event,
                                        user: user,
                                        channel: channel,
                                        cacheTime: cacheTime
                                    }
                                }));
                            }).catch((error) => {
                                console.log(error);
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
     * @param {string} channel The channel the event happened in
     * @param {Object} data The changed values
     * @returns {Promise<any>}
     * 
     * @memberOf SepalSocket
     */
    public async sendToChannel(channel: string, event: string, data: any): Promise<any> {
        if (this.clients[channel] === undefined) {
            return;
        }

        delete data["id"];

        const packet = {
            type: "event",
            event: event,
            channel: data["token"],
            data: data
        };

        if (event === "config") {
            delete data["services"];
            delete data["permissions"];
        }

        const keys = Object.keys(this.clients);

        for (let i = 0, length = keys.length; i < length; i++) {
            this.clients[keys[i]].forEach((client: WebSocket) => {
                try {
                    client.send(JSON.stringify(packet));
                } catch (e) {
                    delete this.clients[keys[i]];
                }
            });
        }
    }

    /**
     * Broadcast to all connected clients
     * 
     * @private
     * @param {*} packet The packet to broadcast
     * 
     * @memberOf SepalSocket
     */
    private async broadcast(packet: any) {
        const keys = Object.keys(this.clients);
        for (let i = 0, length = keys.length; i < length; i++) {
            this.clients[keys[i]].forEach((client: WebSocket) => {
                try {
                    client.send(JSON.stringify(packet));
                } catch (e) {
                    delete this.clients[keys[i]];
                }
            });
        }
    }
}
