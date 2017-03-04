
/**
 * Event packet from the client
 * 
 * @export
 * @class IncomingEventPacket
 */
export class IncomingEventPacket {
    /**
     * Creates an instance of IncomingEventPacket.
     * 
     * @param {*} packet
     * 
     * @memberOf IncomingEventPacket
     */
    constructor(private packet: any) {

    }

    /**
     * Parse a packet
     * 
     * @returns {string}
     * 
     * @memberOf IncomingEventPacket
     */
    parse(): string {
        if (!this.packet.type) {
            return "Packet type is not supplied.";
        } else if (!this.packet.event) {
            return "Packet event is not supplied.";
        } else if (!this.packet.channel) {
            return "The channel is not supplied.";
        } else if (!this.packet.service) {
            return "The service is not supplied.";
        }

        return null;
    }
}
