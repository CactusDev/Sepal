
/**
 * Base packet
 * 
 * @export
 * @interface BasePacket
 */
export interface BasePacket {
    type: string;
    channel: string;
    data: Object;
}

/**
 * Packet parser
 *
 * @export
 * @interface PacketParser
 */
export interface PacketParser {
    fields: string[];

    parse(packet: Object): Promise<BasePacket>;
}
