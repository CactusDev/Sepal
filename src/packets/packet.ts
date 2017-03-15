
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
