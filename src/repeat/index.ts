
import { Server } from "../server";
import { RethinkDB } from "../rethinkdb";

// Sidenote: Interval is in MS
interface IRepeats {
    [channel: string]: {
        [command: string]: {
            command: string;
            interval: number
        }[];
    };
};

export class Repeat {
    private activeRepeats: IRepeats = {};

    constructor(public server: Server, public rethink: RethinkDB) { }

    startCurrent(channel: String) {
        let repeats = this.rethink.getRepeats(channel);

        if (repeats === null) {
            return;
        }

        Object.keys(Promise.resolve(repeats).then((data: any) => {
            data.forEach((repeat: any) => {
                this.startRepeat(repeat)
            });
        }));
    }

    addRepeat(packet: Object): boolean {
        let data: any = packet;
        if (!data.channel || !data.command || !data.interval) {
            return false;
        }

        if (this.activeRepeats[data.channel] == null) {
            this.activeRepeats[data.channel] = {};
        }

        if (this.activeRepeats[data.channel] === (null || undefined)) {
            this.activeRepeats[data.channel] = {};
        }
        this.activeRepeats[data.channel][data.command].push({ command: data.command, interval: data.interval });
        this.startRepeat(packet);

        return true;
    }

    removeRepeat(packet: Object): boolean {
        let data: any = packet;

        if (!data.channel || !data.command || !data.interval) {
            return false;
        }

        if (this.activeRepeats[data.channel] == null) {
            return false;
        }

        if (this.activeRepeats[data.channel][data.command] == null) {
            return false;
        }

        this.activeRepeats[data.channel][data.command] = null;

        return true;
    }

    private startRepeat(packet: Object) {
        let data: any = packet;

        setInterval(() => {
            this.server.broadcastToChannel(data.channel, null, "repeat", null, data);
        }, data.interval);
    }
}
