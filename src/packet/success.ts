
/**
 * Packet success
 * 
 * @export
 * @class SuccessPacket
 */
export class SuccessPacket {

    /**
     * Creates an instance of SuccessPacket.
     * 
     * @param {string} message
     * @param {string} action
     * 
     * @memberOf SuccessPacket
     */
    constructor(public message: string, public action: string) { }

    /**
     * Parse the packet
     * 
     * @returns {Object}
     * 
     * @memberOf SuccessPacket
     */
    parse(): Object {
        let packet = {
            action: this.action,
            message: this.message
        };

        return JSON.stringify(packet);
    }
}
