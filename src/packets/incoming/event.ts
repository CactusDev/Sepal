
import { PacketParser } from "../packet";

/**
 * Client event packet
 * 
 * @export
 * @interface EventPacket
 */
export interface EventPacket {
    channel: string;
    event: string;
    user: string;
    cacheTime: number;
};

/**
 * Parse event packets
 * 
 * @export
 * @class EventPacketParser
 * @implements {PacketParser}
 */
export class EventPacketParser implements PacketParser {

    /**
     * Required fields for a packet to contain
     * 
     * @type {string[]}
     * @memberOf EventPacketParser
     */
    public fields: string[] = [
        "channel",
        "event",
        "user",
        "cacheTime"
    ];

    /**
     * Parse the data of the packet
     * 
     * @param {Object} packet Data section of the packet
     * @returns {Promise<EventPacket>} Valid packet from the data or null
     * 
     * @memberOf EventPacketParser
     */
    public async parse(packet: Object): Promise<EventPacket> {
        this.fields.forEach((field: string) => {
            if (!packet.hasOwnProperty(field)) {
                return null;
            }
        });

        const data: any = packet;
        return {
            channel: data.channel,
            event: data.event,
            user: data.user,
            cacheTime: data.cacheTime,
        };
    }
}
