
import { RethinkConnection, DocumentCursor, Model } from "rethinkts";

import { EventEmitter } from "events";

import { Logger } from "../logger";
import { Alias, Command, Config, Quote, Repeat, Social, Trust } from "./models";

/**
 * Status of the document
 *
 * @export
 * @enum {number}
 */
export enum Status {
    CREATED,
    DELETED,
    CHANGED
};

/**
 * Handle rethink interactions
 * 
 * @export
 * @class Rethink
 */
export class Rethink extends EventEmitter {
    private rethink: RethinkConnection;

    /**
     * Creates an instance of Rethink.
     * 
     * @memberOf Rethink
     */
    constructor(private config: IConfig) {
        super();
    }

    /**
     * Connect to rethink and create all the models
     *
     *
     * @memberOf Rethink
     */
    public async connect() {
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


        const keys = Object.keys(this.rethink.models);
        for (let i = 0, length = keys.length; i < length; i++) {
            const model = this.rethink.models[keys[i]];

            model.changes().then((changes) => {
                changes.each((error, cursor) => {
                    this.modelStatus(cursor).then((state) => {
                        if (keys[i] === "repeat") {
                            if (state === Status.CREATED) {
                                const data: any = cursor["new_val"];
                                this.emit("repeat:start", {
                                    command: data.commandName,
                                    interval: data.period,
                                    channel: data.token,
                                    response: ""
                                });
                            } else if (state === Status.CHANGED) {
                                const removed: any = cursor["old_val"];
                                const added: any = cursor["new_val"];

                                this.emit("repeat:stop", removed.token, removed.commandName);

                                this.emit("repeat:start", {
                                    command: added.commandName,
                                    period: added.period,
                                    channel: added.token
                                });
                            } else if (state === Status.DELETED) {
                                const data: any = cursor["old_val"];
                                this.emit("repeat:stop", data.token, data.commandName);
                            }
                        }
                        this.emit("broadcast:channel", {
                            event: keys[i],
                            data: cursor
                        });
                    });
                });
            });
        }

        Logger.log("Registered models!");
    }

    /**
     * Get all repeats in the database
     * 
     * @returns {Promise<any>} all the repeats
     * 
     * @memberOf Rethink
     */
    public async getAllRepeats(): Promise<any> {
        return await Repeat.find<Repeat>({});
    }

    /**
     * Get a command by the channel and the name
     * 
     * @param {string} name the name of the command
     * @param {string} channel the chanel the command is in
     * @returns {Promise<Command[]>} the command, if any
     * 
     * @memberOf Rethink
     */
    public async getCommand(name: string, channel: string): Promise<Command[]> {
        return await Command.find<Command>({ name: name, token: channel });
    }

    /**
     * Get the status of a model in string form
     * 
     * @private
     * @param {DocumentCursor<Model>} model 
     * @returns {Promise<Status>} 
     * 
     * @memberOf Rethink
     */
    private async modelStatus(model: DocumentCursor<Model>): Promise<Status> {
        if (model.new_val !== null && model.old_val === null) {
            return Status.CREATED;
        } else if (model.new_val !== null && model.old_val !== null) {
            return Status.CHANGED;
        } else {
            return Status.DELETED;
        }
    }
}
