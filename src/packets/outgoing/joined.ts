
/**
 * Outgoing channel joined packet
 * 
 * @export
 * @interface JoinedPacket
 */
export interface JoinedPacket {
    channel: string;
    success: boolean;
}

/**
 * Build a channel joined packet
 * 
 * @export
 * @class JoinedBuilder
 */
export class JoinedBuilder {

    /**
     * Create a new channel joined packet
     * 
     * @param {string} channel 
     * @param {boolean} success 
     * @returns {Promise<string>} 
     * 
     * @memberOf JoinedBuilder
     */
    public async create(channel: string, success: boolean): Promise<string> {
        const packet: JoinedPacket = {
            channel: channel,
            success: success
        };

        return JSON.stringify({
            type: "joined",
            channel: channel,
            data: packet
        });
    }
}
