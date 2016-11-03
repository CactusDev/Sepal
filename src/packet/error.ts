
export class ErrorPacket {
    error: string;
    code: number;
    data: Object;

    constructor(error: string, code: number, data: Object) {
        this.error = error;
        this.code = code;
        this.data = data;
    }

    parse() {
        let packet = {
            "type": "error",
            "error": {
                "error": this.error,
                "code": this.code
            },
            "data": this.data
        };

        return packet;
    }
}
