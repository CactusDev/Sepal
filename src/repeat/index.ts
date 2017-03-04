
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

/**
 * Repeat object
 * 
 * @export
 * @interface IRepeat
 */
export interface IRepeat {
    token: string;
    command: string;
    period: number;
    channel: string;
}

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
     * Creates a new repeat.
     * 
     * @param {IRepeat} repeat 
     * @returns 
     * 
     * @memberOf Repeat
     */
    addRepeat(repeat: IRepeat) {
        if (!this.activeRepeats[repeat.token]) {
            this.activeRepeats[repeat.token] = {};
        }

        this.rethink.getCommandName(repeat.command).then((data: any) => {
            repeat.command = data[0]["name"];
        });

        const repeating = {
            command: repeat.command,
            interval: repeat.period * 1000,
            intervalVar: this.startRepeat(repeat)
        };

        if (!this.activeRepeats[repeat.token][repeat.command]) {
            this.activeRepeats[repeat.token][repeat.command] = [repeating];
        } else {
            this.activeRepeats[repeat.token][repeat.command].push(repeating);
        }

        return false;
    }

    /**
     * Removes a repeat
     * 
     * @param {IRepeat} repeat 
     * @returns 
     * 
     * @memberOf Repeat
     */
    removeRepeat(repeat: IRepeat) {
        if (!repeat.channel || !repeat.command || !repeat.period) {
            return false;
        }

        if (this.activeRepeats[repeat.channel] == null) {
            return false;
        }

        if (this.activeRepeats[repeat.channel][repeat.command] == null) {
            return false;
        }

        this.activeRepeats[repeat.channel][repeat.command] = null;

        return true;
    }

    /**
     * Start a new repeat
     * 
     * @private
     * @param {IRepeat} repeat
     * @returns {any}
     * 
     * @memberOf Repeat
     */
    private startRepeat(repeat: IRepeat): any {
        let intervalVar: any;

        intervalVar = setInterval(() => {
            this.server.broadcastToChannel(repeat.token, null, "repeat", null, repeat);
        }, repeat.period);

        return intervalVar;
    }
}
