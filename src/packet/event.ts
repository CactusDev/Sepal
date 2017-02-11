
/**
 * Event packet to the client
 * 
 * @export
 * @class EventPacket
 */
export class EventPacket {
    /**
     * Creates an instance of EventPacket.
     * 
     * @param {string} event
     * @param {string} channel
     * @param {string} action
     * @param {string} service
     * @param {Object} data
     * 
     * @memberOf EventPacket
     */
    constructor(private event: string, private channel: string, private action: string, private service: string, private data: Object) {
        // TODO: Convert this to an interface
    }

    /**
     * Parse the packet
     * 
     * @returns {Object}
     * 
     * @memberOf EventPacket
     */
    parse(): Object {
        let packet = {
            type: "event",
            event: this.event,
            service: this.service,
            channel: this.channel,
            action: this.action,
            data: this.data
        };

        return packet;
    }
}
