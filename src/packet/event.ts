
export class EventPacket {
    event: string;
    channel: string;
    action: string;
    data: Object;

    constructor(event: string, channel: string, action: string, data: Object) {
        this.channel = channel;
        this.event = event;
        this.data = data;
        this.action = action;
    }

    parse() {
        let packet = {
            "type": "event",
            "event": this.event,
            "channel": this.channel,
            "action": this.action,
            "data": this.data
        };

        return packet;
    }
}
