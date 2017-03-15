
import { PacketParser } from "../packet";

/**
 * Join packet
 * 
 * @export
 * @interface JoinPacket
 */
export interface JoinPacket {
    channel: string;
}

/**
 * Parse channel join packets
 * 
 * @export
 * @class JoinPacketParser
 * @implements {PacketParser}
 */
export class JoinPacketParser implements PacketParser {

    /**
     * Requried fields for a packet to contain
     * 
     * @type {string[]}
     * @memberOf JoinPacketParser
     */
    public fields: string[] = [
        "channel"
    ];

    public async parse(packet: Object): Promise<JoinPacket> {
        // TODO: Check if the channel supplied is a channel that we have
        this.fields.forEach((field: string) => {
            if (!packet.hasOwnProperty(field)) {
                return null;
            }
        });

        return {
            channel: (packet as any)["channel"]
        };
    }
}
