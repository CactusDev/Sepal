
import { Server } from "../server";
import { RethinkDB } from "../rethinkdb";

/**
 * Current running repeats
 * 
 * @interface IRepeats
 */
interface IRepeats {
    [token: string]: {
        [command: string]: {
            command: string;
            interval: number;
            intervalVar: number;
        }[];
    };
};

// TODO: Stop using objects for the repeat stuff. Use custom interfaces

/**
 * Handle repeating events
 * 
 * @export
 * @class Repeat
 */
export class Repeat {
    private activeRepeats: IRepeats = {};

    /**
     * Creates an instance of Repeat.
     * 
     * @param {Server} server
     * @param {RethinkDB} rethink
     * 
     * @memberOf Repeat
     */
    constructor(public server: Server, public rethink: RethinkDB) { }

    /**
     * Add a new repeat
     * 
     * @param {Object} packet
     * @returns {boolean}
     * 
     * @memberOf Repeat
     */
    addRepeat(packet: Object): boolean {
        let repeat: any = packet;
        
        if (!repeat.token || !repeat.command || !repeat.period) {
            return false;
        }

        if (this.activeRepeats[repeat.token] === (null || undefined)) {
            this.activeRepeats[repeat.token] = {};
        }

        repeat.period = repeat.period * 1000
        
        this.rethink.getCommandName(repeat.command).then((data: any) => {
            repeat.command = data[0]["name"];
        });
 
        if (this.activeRepeats[repeat.token][repeat.command] === (null || undefined)) {
            this.activeRepeats[repeat.token][repeat.command] = [{ command: repeat.command, interval: repeat.period, intervalVar: this.startRepeat(repeat) }];
        } else {
            this.activeRepeats[repeat.token][repeat.command].push({ command: repeat.command, interval: repeat.period, intervalVar: this.startRepeat(repeat) });
        }

        return true;
    }

    /**
     * Remove a running repeat
     * 
     * @param {Object} packet
     * @returns {boolean}
     * 
     * @memberOf Repeat
     */
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

    /**
     * Start a new repeat
     * 
     * @private
     * @param {Object} packet
     * @returns {number}
     * 
     * @memberOf Repeat
     */
    private startRepeat(packet: Object): number {
        let data: any = packet;
        let intervalVar: number;

        intervalVar = setInterval(() => {
            this.server.broadcastToChannel(data.token, null, "repeat", null, data);
        }, data.period);

        return intervalVar
    }
}
