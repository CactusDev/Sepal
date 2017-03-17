import { SepalSocket } from "../socket";
import { Rethink } from "../rethink";
import Logger from "../logger";

/**
 * Repeat object
 * 
 * @export
 * @interface Repeat
 */
export interface Repeat {
    command: string;
    period: number;
    channel: string;
}

/**
 * Currently running repeat
 * 
 * @interface RunningRepeat
 * @extends {Repeat}
 */
interface RunningRepeat extends Repeat {
    interval: any;
}

/**
 * The command response of a repeat
 * 
 * @interface RepeatResponse
 * @extends {Repeat}
 */
interface RepeatResponse extends Repeat {
    response: any;
}

/**
 * Running repeats for a channel
 * 
 * @interface IRepeats
 */
interface IRepeats {
    [channel: string]: RunningRepeat[];
}

/**
 * Location of a repeat in the running repeats
 * 
 * @interface RepeatLocation
 */
interface RepeatLocation {
    location: number;
    channel: string;
}

/**
 * Handle repeats
 * 
 * @export
 * @class RepeatHandler
 */
export class RepeatHandler {

    private runningRepeats: IRepeats;

    /**
     * Creates an instance of RepeatHandler.
     * 
     * @memberOf RepeatHandler
     */
    public constructor(private socket: SepalSocket, private rethink: Rethink) {
        this.runningRepeats = {};

        socket.rethink.on("repeat:start", (repeat: Repeat) => {
            this.startRepeat(repeat).catch((error: string) => {
                console.log(error);
            });
        });

        socket.rethink.on("repeat:stop", (repeat: Repeat) => {
            this.stopRepeat(repeat).catch((error: string) => {
                console.log(error);
            });
        });
    }

    /**
     * Start a new repeat
     * 
     * @private
     * @param {Repeat} repeat 
     * 
     * @memberOf RepeatHandler
     */
    private async startRepeat(repeat: Repeat) {
        repeat.period = repeat.period * 1000;
        this.rethink.getCommand(repeat.command).then((response: any) => {
            let repeatResponse: RepeatResponse = {
                channel: repeat.channel,
                command: repeat.command,
                period: repeat.period,
                response: response
            };

            const interval = setInterval(() => {
                this.socket.sendToChannel(repeat.channel, "repeatSend", repeatResponse);
            }, repeat.period);

            const runningRepeat: RunningRepeat = {
                channel: repeat.channel,
                command: repeat.command,
                interval: interval,
                period: repeat.period
            };

            if (this.runningRepeats[repeat.channel] === undefined) {
                this.runningRepeats[repeat.channel] = [runningRepeat];
            } else {
                this.runningRepeats[repeat.channel].push(runningRepeat);
            }
        });
    }

    /**
     * Stop a running repeat
     * 
     * @private
     * @param {Repeat} repeat 
     * 
     * @memberOf RepeatHandler
     */
    private async stopRepeat(repeat: Repeat) {
        const location: RepeatLocation = await this.findRepeat(repeat);
        const runningRepeat: RunningRepeat = this.runningRepeats[location.channel][location.location];
        clearInterval(runningRepeat.interval);
        delete this.runningRepeats[location.channel][location.location];
    }

    /**
     * Find the location of a repeat, if it exists
     * 
     * @private
     * @param {Repeat} repeat 
     * @returns {Promise<RepeatLocation>} 
     * 
     * @memberOf RepeatHandler
     */
    private async findRepeat(repeat: Repeat): Promise<RepeatLocation> {
        repeat.period = repeat.period * 1000;
        const keys = Object.keys(this.runningRepeats);
        let location: RepeatLocation = null;

        for (let i = 0, length = keys.length; i < length; i++) {
            this.runningRepeats[keys[i]].forEach((runningRepeat: Repeat) => {
                const running: Repeat = {
                    command: runningRepeat.command,
                    period: runningRepeat.period,
                    channel: runningRepeat.channel
                };
                if (JSON.stringify(running) === JSON.stringify(repeat)) {
                    location = {
                        location: i,
                        channel: runningRepeat.channel
                    };
                }
            });
        }
        return location;
    }

    /**
     * Start all the active repeats
     * 
     * 
     * @memberOf RepeatHandler
     */
    public async startRepeats() {
        const repeats: any[] = await this.rethink.getAllRepeats();

        repeats.forEach((databaseRepeat: any) => {
            this.rethink.getCommand(databaseRepeat.commandName).then((response: any) => {
                let repeat: RepeatResponse = {
                    channel: databaseRepeat.token,
                    command: databaseRepeat.commandName,
                    period: databaseRepeat.period,
                    response: response
                };
                this.startRepeat(repeat);
            });
        });
    }
}
