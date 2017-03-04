/**
 * Event subscription packet
 * 
 * @export
 * @class SubscribePacket
 */
export class SubscribePacket {
    /**
     * Creates an instance of SubscribePacket.
     * 
     * @param {Object} packet
     * 
     * @memberOf SubscribePacket
     */
    constructor(private packet: any) {

    }

    /**
     * 
     * 
     * @returns {string}
     * 
     * @memberOf SubscribePacket
     */
    parse(): string {
        if (!this.packet.type) {
            return "Packet type is not supplied.";
        } else if (!this.packet.channel) {
            return "The channel is not supplied.";
        }

        return null;
    }
}
