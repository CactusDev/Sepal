export class SubscribePacket {
    packet: any = {};

    constructor(packet: Object) {
        this.packet = packet;
    }

    parse() {
        if (!this.packet.type) {
            return "Packet type is not supplied.";
        } else if (!this.packet.channel) {
            return "The channel is not supplied.";
        } else if (!this.packet.events) {
            return "The packet doesn't contain events!";
        }

        return null;
    }
}
