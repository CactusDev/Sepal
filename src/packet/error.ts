
/**
 * Error packet
 * 
 * @export
 * @class ErrorPacket
 */
export class ErrorPacket {

    /**
     * Creates an instance of ErrorPacket.
     * 
     * @param {string} error
     * @param {number} code
     * @param {Object} data
     * 
     * @memberOf ErrorPacket
     */
    constructor(private error: string, private code: number, private data: Object) {
        // TODO: Convert this to an interface
        this.error = error;
        this.code = code;
        this.data = data;
    }

    /**
     * Parse the packet
     * 
     * @returns {string}
     * 
     * @memberOf ErrorPacket
     */
    parse(): string {
        let packet = {
            "type": "error",
            "error": {
                "error": this.error,
                "code": this.code
            },
            "data": this.data
        };

        return JSON.stringify(packet);
    }
}
