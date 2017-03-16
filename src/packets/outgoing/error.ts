
/**
 * Outgoing error packet
 * 
 * @export
 * @interface ErrorPacket
 */
export interface ErrorPacket {
    message: string;
    code: number;
    channel?: string;
}

/**
 * Build errors
 * 
 * @export
 * @class ErrorBuilder
 */
export class ErrorBuilder {

    /**
     * Create a new error packet
     * 
     * @param {string} message 
     * @param {number} code 
     * @returns {Promise<BasePacket>} 
     * 
     * @memberOf ErrorBuilder
     */
    public async create(message: string, code: number, channel?: string): Promise<string> {
        const error: ErrorPacket = {
            message: message,
            code: code
        };

        if (channel) {
            error.channel = channel;
        }

        return JSON.stringify({
            type: "error",
            data: error
        });
    }
}
