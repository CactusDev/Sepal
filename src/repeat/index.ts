import { Command } from "../rethink/models";
import { Rethink } from "../rethink";

import { SepalSocket } from "../socket";

/**
 * A actual repeat which has large amounts of hate
 * 
 * @interface Repeat
 */
interface Repeat {
    channel: string;
    interval: number;
    command: string;
    response: string;
    timer?: NodeJS.Timer;
}

/**
 * Current running repeats per channel
 * 
 * @interface RepeatTracker
 */
interface RepeatTracker {
    [channel: string]: Repeat[];
}

/**
 * Handle repeat creation, and hatred
 * 
 * @export
 * @class RepeatHandler
 */
export class RepeatHandler {

    private tracker: RepeatTracker = {};

    constructor(private socket: SepalSocket, private rethink: Rethink) {
        socket.rethink.on("repeat:start", (repeat: Repeat) => {
            this.start(repeat).catch((error: string) => {
                console.log(error);
            });
        });

        socket.rethink.on("repeat:stop", (channel: string, command: string) => {
            this.stop(channel, command).catch((error: string) => {
                console.log(error);
            });
        });
    }

    /**
     * Start a new repeat
     * 
     * @param {Repeat} repeat the repeat to start
     * 
     * @memberOf RepeatHandler
     */
    private async start(repeat: Repeat) {
        this.rethink.getCommand(repeat.command, repeat.channel).then((commandResponse: any[]) => {
            const response = commandResponse[0];
            const createdRepeat: Repeat = {
                channel: repeat.channel,
                command: repeat.command,
                interval: repeat.interval,
                response: (response as any).resopnse
            };

            const data = {
                response: {
                    message: (createdRepeat.response as any).message
                }
            };

            const timer = setInterval(() => this.socket.sendToChannel(
                    repeat.channel, "repeat", data), repeat.interval * 1000);

            if (this.tracker[repeat.channel] === undefined) {
                this.tracker[repeat.channel] = [];
            }

            repeat.timer = timer;

            if (repeat.timer === undefined) {
                throw new Error("Attempted to create a repeat without a timer!");
            }

            this.tracker[repeat.channel].push(repeat);
        });
    }

    private async stop(channel: string, command: string) {
        if (this.tracker[channel] === undefined) {
            throw new Error("Attempted to remove a repeat from a channel that doesn't exist!");
        }

        for (let i = 0; i < this.tracker[channel].length; i++) {
            let repeat: Repeat = this.tracker[channel][i];
            if (repeat !== undefined) {
                if (repeat.command === command) {
                    // We know it's the right repeat
                    clearInterval(this.tracker[channel][i].timer);
                    delete this.tracker[channel][i];
                }
            }
        }
    }

    public async startRepeats() {
        const repeats: any[] = await this.rethink.getAllRepeats();

        repeats.forEach((databaseRepeat: any) => {
            this.rethink.getCommand(databaseRepeat.commandName, databaseRepeat.token).then((commandResponse: any[]) => {
                const response = commandResponse[0];
                let repeat: Repeat = {
                    channel: databaseRepeat.token,
                    command: databaseRepeat.commandName,
                    interval: databaseRepeat.period,
                    response: response
                };
                this.start(repeat);
            });
        });
    }
}
