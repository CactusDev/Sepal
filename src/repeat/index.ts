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

    addRepeat(packet: Object) {
        let repeat: any = packet;
        if (this.activeRepeats[repeat.token] === (null || undefined)) {
            this.activeRepeats[repeat.token] = [];
        }

        repeat.period = repeat.period * 1000
        repeat.timeout = this.startRepeat(repeat);
        repeat.response = data[0]["response"];

        this.activeRepeats[repeat.token][repeat.commandName] = repeat;
    }

    removeRepeat(packet: Object) {
        let repeat: any = packet;
        let timeout: any = this.activeRepeats[repeat.token][repeat.commandName]["timeout"];

        clearInterval(timeout);
        delete this.activeRepeats[repeat["token"]][repeat.command];
    }

    private startRepeat(packet: Object): number {
        let data: any = packet;

        return setInterval(() => {
            this.server.broadcastToChannel(data.token, null, "repeat", null, data)
        }, data.period);
    }
}

