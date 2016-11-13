export class SuccessPacket {

    constructor(public message: string, public action: string) { }

    parse() {
        let packet = {
            "action": this.action,
            "message": this.message
        };

        return JSON.stringify(packet);
    }
}
