
import { SepalSocket } from "../socket";
import { Rethink } from "../rethink";
import { Logger } from "../logger";

/**
 * Running repeat
 * 
 * @export
 * @interface Repeat
 */
export interface IRepeat {
    command: string;
    period: number;
    channel: string;
    interval?: NodeJS.Timer;
}

/**
 * Command response of a repeat
 * 
 * @interface RepeatResponse
 */
interface IRepeatResponse {
    response: Object[];
}

/**
 * Running repeats in a channel
 * 
 * @interface IRunningRepeats
 */
interface IRunningRepeats {
    [channel: string]: IRepeat[];
}

/**
 * Location of a running repeat;
 * 
 * @interface IRepeatLocation
 */
interface IRepeatLocation {
    repeat: IRepeat;
    location: number;
}

/**
 * Handle repeats
 * 
 * @export
 * @class RepeatHandler
 */
export class RepeatHandler {
    private runningRepeats: IRunningRepeats = {};

    /**
     * Creates an instance of RepeatHandler.
     * @param {SepalSocket} socket SepalSocket instance
     * @param {Rethink} rethink Rethink instance
     * 
     * @memberOf RepeatHandler
     */
    constructor(private socket: SepalSocket, private rethink: Rethink) {
        rethink.on("repeat:start", (repeat: IRepeat) =>
            this.startRepeat(repeat).catch(console.error));

        rethink.on("repeat:stop", (repeat: IRepeat) =>
            this.stopRepeat(repeat).catch(console.error));
    }

    /**
     * Start a new repeat
     * 
     * @private
     * @param {Repeat} repeat Repeat to start
     * 
     * @memberOf RepeatHandler
     */
    private async startRepeat(repeat: IRepeat) {
        repeat.period = repeat.period * 1000;
        const command = await this.rethink.getCommand(repeat.command, repeat.channel);

        const interval: NodeJS.Timer = setInterval(() => {
            this.socket.sendToChannel(repeat.channel, "repeat", command.response);
        }, repeat.period);
        repeat.interval = interval;

        if (this.runningRepeats[repeat.channel] === undefined) {
            this.runningRepeats[repeat.channel] = [repeat];
        } else {
            this.runningRepeats[repeat.channel].push(repeat);
        }
    }

    /**
     * Stop a currently running repeat
     * 
     * @private
     * @param {Repeat} repeat Repeat to stop
     * 
     * @memberOf RepeatHandler
     */
    private async stopRepeat(repeat: IRepeat) {
        const repeatLocation = await this.findRepeat(repeat);
        if (repeatLocation === null) {
            Logger.error(`Stopping repeat was unable to be found! Repeat: \`${JSON.stringify(repeat)}\``);
            return;
        }

        const stopping: IRepeat = this.runningRepeats[repeat.channel][repeatLocation];
        clearInterval(stopping.interval);
        delete this.runningRepeats[repeat.channel][repeatLocation];
    }

    /**
     * Find a running repeat
     * 
     * @private
     * @param {IRepeat} repeat Repeat to find
     * @returns {Promise<IRepeatLocation>} The location of the repeat in the channels repeats
     * 
     * @memberOf RepeatHandler
     */
    private async findRepeat(repeat: IRepeat): Promise<number> {
        return new Promise<number>((resolve: any, reject: any) => {
            const keys = Object.keys(this.runningRepeats);
            repeat.period = repeat.period * 1000;

            for (let i = 0, length = keys.length; i < length; i++) {
                this.runningRepeats[keys[i]].forEach((running: IRepeat) => {
                    delete repeat.interval;
                    delete running.interval;

                    if (JSON.stringify(running) === JSON.stringify(repeat)) {
                        return resolve(i);
                    }
                });
            }
            return resolve(null);
        });
    }

    /**
     * Start all repeats
     * 
     * 
     * @memberOf RepeatHandler
     */
    public async startRepeats() {
        const repeats: IRepeat[] = await this.rethink.getAllRepeats();
        repeats.forEach((dbRepeat: any) => {
            const repeat: IRepeat = {
                channel: dbRepeat.token,
                command: dbRepeat.command,
                period: dbRepeat.period
            };
            this.startRepeat(repeat);
        });
    }
}
