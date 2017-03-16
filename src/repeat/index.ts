
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
 * Running repeats for a channel
 * 
 * @interface IRepeats
 */
interface IRepeats {
    [channel: string]: RunningRepeat[];
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
    public constructor() {
        this.runningRepeats = {};
    }

    /**
     * Start a new repeat
     * 
     * @param {Repeat} repeat 
     * 
     * @memberOf RepeatHandler
     */
    public async startRepeat(repeat: Repeat) {

    }

    public async stopRepeat(repeat: Repeat) {
        
    }
}
