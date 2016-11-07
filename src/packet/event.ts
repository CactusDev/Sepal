export class EventPacket {
    event: string;
    channel: string;
    action: string;
    service: string;
    data: Object;

    constructor(event: string, channel: string, action: string, service: string, data: Object) {
        this.channel = channel;
        this.event = event;
        this.data = data;
        this.action = action;
        this.service = service;
}

    parse() {
        let packet = {
            "type": "event",
            "event": this.event,
            "service": this.service,
            "channel": this.channel,
            "action": this.action,
            "data": this.data
        };

        return packet;
    }
}
