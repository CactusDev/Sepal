
import { BasePacket } from "../packet";

/**
 * Outgoing error packet
 * 
 * @export
 * @interface ErrorPacket
 */
export interface ErrorPacket {
    message: string;
    code: number;
}

/**
 * Build errors
 * 
 * @export
 * @class ErrorBuilder
 */
export class ErrorBuilder {

    /**
     * Create a new error packet from the input
     * 
     * @param {string} message 
     * @param {number} code 
     * @returns {Promise<BasePacket>} 
     * 
     * @memberOf ErrorBuilder
     */
    public async create(message: string, code: number): Promise<string> {
        const error: ErrorPacket = {
            message: message,
            code: code
        };

        return JSON.stringify({
            type: "error",
            channel: "", // TODO: Get the channel somehow
            data: error
        });
    }
}
