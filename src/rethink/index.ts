
import { EventEmitter } from "events";
import Logger from "../logger";

/**
 * Handle rethink interactions
 * 
 * @export
 * @class Rethink
 */
export class Rethink {

    private thinkyInstance: any;

    /**
     * Creates an instance of Rethink.
     * 
     * @memberOf Rethink
     */
    constructor(private config: IConfig) {
        
    }

    /**
     * Connect to rethink and create all the models
     *
     *
     * @memberOf Rethink
     */
    connect() {

    }
}
