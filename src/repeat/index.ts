
import { Server } from "../server";
import { RethinkDB } from "../rethinkdb";

// Sidenote: Interval is in MS
interface IRepeats {
    [token: string]: {
        [command: string]: {
            command: string;
            interval: number;
            intervalVar: number;
        }[];
    };
};

export class Repeat {
    private activeRepeats: IRepeats = {};

    constructor(public server: Server, public rethink: RethinkDB) { }

    addRepeat(packet: Object): boolean {
        let repeat: any = packet;
        
        if (!repeat.token || !repeat.commandName || !repeat.period) {
            return false;
        }

        if (this.activeRepeats[repeat.token] === (null || undefined)) {
            this.activeRepeats[repeat.token] = {};
        }

        if (this.activeRepeats[repeat.token][repeat.command] === (null || undefined)) {
            this.activeRepeats[repeat.token][repeat.command] = [{ command: repeat.command, interval: repeat.period, intervalVar: this.startRepeat(repeat) }];
        } else {
            this.activeRepeats[repeat.token][repeat.command].push({ command: repeat.command, interval: repeat.period, intervalVar: this.startRepeat(repeat) });
        }

        return true;
    }

    removeRepeat(packet: Object): boolean {
        let data: any = packet;

        console.log(data);

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

    private startRepeat(packet: Object): number {
        let data: any = packet;
        let intervalVar: number;

        intervalVar = setInterval(() => {
            this.server.broadcastToChannel(data.token, null, "repeat", null, data);
        }, data.period);

        return intervalVar
    }
}
