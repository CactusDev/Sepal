
import "reflect-metadata";

import { RethinkConnection, DocumentCursor, Model } from "rethinkts";

import { EventEmitter } from "events";

import { Logger } from "../logger";
import { Alias, Command, Config, Quote, Repeat, Social, Trust, Event } from "./models";

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
     * Connect to Rethink and create all the models.
     * 
     * @returns {Promise<any>} 
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
                        this.modelStatus(cursor).then((state) => {
                            if (keys[i] === "repeat") {
                                if (state === Status.CREATED) {
                                    const data: any = cursor["new_val"];
                                    this.emit("repeat:start", {
                                        command: data.commandName,
                                        period: data.period,
                                        channel: data.token
                                    });
                                } else if (state === Status.CHANGED) {
                                    const removed: any = cursor["old_val"];
                                    const added: any = cursor["new_val"];

                                    this.emit("repeat:stop", {
                                        command: removed.commandName,
                                        period: removed.period,
                                        channel: removed.token
                                    });

                                    this.emit("repeat:start", {
                                        command: added.commandName,
                                        period: added.period,
                                        channel: added.token
                                    });
                                } else if (state === Status.DELETED) {
                                    const data: any = cursor["old_val"];
                                    this.emit("repeat:stop", {
                                        command: data.commandName,
                                        period: data.period,
                                        channel: data.token
                                    });
                                }
                                return;
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
            resolve();
        });
    }

    /**
     * Get all repeats in the database
     * 
     * @returns {Promise<any>} List of repeats to be started
     * 
     * @memberOf Rethink
     */
    public async getAllRepeats(): Promise<any> {
        return await Repeat.find<Repeat>({});
    }

    /**
     * Get a command from id
     * 
     * @param {string} id id of the command
     * @param {string} channel channel the command is in
     * @returns {Promise<Command>} the command
     * 
     * @memberOf Rethink
     */
    public async getCommand(id: string, channel: string): Promise<Command> {
        return await Command.get<Command>(id);
    }

    /**
     * Get an event from the database
     * 
     * @param {string} channel the channel the event was in
     * @param {string} user user that executed the event
     * @param {string} event the event type
     * @returns {Promise<Event>} the event in the database
     * 
     * @memberOf Rethink
     */
    public async getEvent(channel: string, user: string, event: string): Promise<Event> {
        return await Event.get<Event>({channel, user, event});
    }

    /**
     * Create a new event in Rethink
     * 
     * @param {string} channel the channel the even was in
     * @param {string} user the user that executed the event
     * @param {string} event the event type to cache
     * @param {string} date the time that the event occurred
     * @returns {Promise<Event>} the event in the database
     * 
     * @memberOf Rethink
     */
    public async setEvent(channel: string, user: string, event: string, date: string): Promise<Event> {
        const cachedEvent = new Event({
            channel: channel,
            user: user,
            event: event,
            occurredAt: date
        });
        return await cachedEvent.save();
    }


    /**
     * Get the status of a model in string form
     * 
     * @private
     * @param {DocumentCursor<Model>} model The model to check
     * @returns {Promise<Status>} Status of the model
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
