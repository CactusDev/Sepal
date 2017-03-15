
import "reflect-metadata";

import { RethinkConnection } from "rethinkts";
import { EventEmitter } from "events";

import Logger from "../logger";
import { Alias, Command, Config, Quote, Repeat, Social, Trust } from "./models";

/**
 * Handle rethink interactions
 * 
 * @export
 * @class Rethink
 */
export class Rethink {

    private rethink: RethinkConnection;

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
        Logger.log("Connecting to Rethink...");
        this.rethink = new RethinkConnection(this.config.rethink.connection);
        this.rethink.setDefaultDatabase(this.config.rethink.db);
        Logger.log("Connected to Rethink!");

        Logger.log("Registering models...");
        this.rethink.registerModel(Alias);
        this.rethink.registerModel(Command);
        this.rethink.registerModel(Config);
        this.rethink.registerModel(Quote);
        this.rethink.registerModel(Repeat);
        this.rethink.registerModel(Social);
        this.rethink.registerModel(Trust);
        Logger.log("Registered models!");
    }
}
