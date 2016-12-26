
import { Server } from "../server";
import { RethinkDB } from "../rethinkdb";

interface IRepeats {
    [token: string]: {
        [command: string]: {
            command: string;
            period: number;
            timeout: number;
        };
    }[];
};

export class Repeat {
    private activeRepeats: IRepeats = {};

    constructor(public server: Server, public rethink: RethinkDB) { }

    addRepeat(packet: Object): boolean {
        let repeat: any = packet;
        
        if (!repeat.token || !repeat.command || !repeat.period) {
            return false;
        }

        if (this.activeRepeats[repeat.token] === (null || undefined)) {
            this.activeRepeats[repeat.token] = [];
        }

        repeat.period = repeat.period * 1000

        let document: any = {
            command: repeat.command,
            period: repeat.period,
            timeout: this.startRepeat(repeat)
        };

        this.activeRepeats[repeat.token][repeat.command] = document;

        return true;
    }

    removeRepeat(packet: Object) {
        let data: any = packet;

        delete this.activeRepeats[data.token][data.command]
    }

    private startRepeat(packet: Object): number {
        let data: any = packet;

        return setInterval(() => {
            this.server.broadcastToChannel(data.token, null, "repeat", null, data);
        }, data.period);
    }
}
