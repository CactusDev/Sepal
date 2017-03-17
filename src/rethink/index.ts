
import "reflect-metadata";

import { RethinkConnection, DocumentCursor, Model } from "rethinkts";

import { EventEmitter } from "events";

import Logger from "../logger";
import { Alias, Command, Config, Quote, Repeat, Social, Trust } from "./models";

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
    public async connect(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                        this.modelStatus(cursor).then((state: string) => {
                            if (keys[i] === "repeat") {
                                if (state === "new") {
                                    const data: any = cursor["new_val"];
                                    this.emit("repeat:start", {
                                        command: data.commandName,
                                        period: data.period,
                                        channel: data.token
                                    });
                                } else {
                                    const data: any = cursor["old_val"] || cursor["new_val"];
                                    this.emit("repeat:stop", {
                                        command: data.commandName,
                                        period: data.period,
                                        channel: data.token
                                    });
                                }
                            } else {
                                this.emit("broadcast:channel", {
                                    event: keys[i],
                                    data: cursor
                                });
                            }
                        });
                    });
                });
            }

            Logger.log("Registered models!");
            resolve();
        });
    }

    /**
     * Get all repeats in the database
     * 
     * @returns {Promise<any>} 
     * 
     * @memberOf Rethink
     */
    public async getAllRepeats(): Promise<any> {
        return this.rethink.models["repeat"].all().then((res: any[]) => {
            return res;
        });
    }

    /**
     * Get the response of a command from the name given
     * 
     * @param {string} commandName 
     * @returns {Promise<any>} 
     * 
     * @memberOf Rethink
     */
    public async getCommand(commandName: string): Promise<any> {
        return this.rethink.models["command"].find({ name: commandName }).then((res: any[]) => {
            return res;
        });
    }

    /**
     * Get the status of a model in string form
     * 
     * @private
     * @param {DocumentCursor<Model>} model 
     * @returns {Promise<string>} 
     * 
     * @memberOf Rethink
     */
    private async modelStatus(model: DocumentCursor<Model>): Promise<string> {
        if (model.new_val !== null && model.old_val === null) {
            return "new";
        } else if (model.new_val !== null && model.old_val !== null) {
            return "changed";
        } else {
            return "deleted";
        }
    }
}
