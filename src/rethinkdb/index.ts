import { EventEmitter } from "events";

import { Server } from "../server";

import { Logger } from "../logging";

const config: IConfig = require("../configs/development");

const thinky = require("thinky")(config.rethinkdb);
const type = thinky.type;

const Commands = thinky.createModel("commands", {
    id: type.string(),
    name: type.string(),
    response: type.object(),
    token: type.string(),
    userLevel: type.number(),
    enabled: type.boolean(),
    arguments: type.any(),
});

const Quotes = thinky.createModel("quotes", {
    id: type.string(),
    quoteId: type.number(),
    quote: type.string(),
    token: type.string()
});

const Users = thinky.createModel("users", {
    id: type.string(),
    username: type.string()
});

const Repeats = thinky.createModel("repeats", {
    id: type.string(),
    period: type.number(),
    token: type.string(),
    repeatId: type.number(),
    command: type.string(),
    arguments: type.any()
});

const Config = thinky.createModel("config", {
    id: type.string(),
    token: type.string(),
    services: type.object(),
    announce: type.object(),
    spam: type.object()
});

/**
 * Result from the database
 * 
 * @interface IResult
 */
interface IResult {
    new_val: any;
    old_val: any;
};

/**
 * Handle rethink interactions
 * 
 * @export
 * @class RethinkDB
 * @extends {EventEmitter}
 */
export class RethinkDB extends EventEmitter {
    // TODO: Figure out variable types for all the things

    /**
     * Creates an instance of RethinkDB.
     * 
     * @param {IConfig} config
     * @param {Server} server
     * 
     * @memberOf RethinkDB
     */
    constructor(public config: IConfig, public server: Server) {
        super();
    }

    /**
     * Watch the commands table
     * 
     * 
     * @memberOf RethinkDB
     */
    watchCommands() {
        Commands.changes().then((feed: any) => {
            feed.each((error: any, doc: any) => {
                if (error) {
                    Logger.error(error);
                }
                let action: "deleted" | "created" | "updated" = "updated";

                if (doc === (null || undefined)) {    
                    return;
                }

                if (doc.isSaved() === false) {
                    action = "deleted";
                } else if (doc.getOldValue() == null) {
                    action = "created";
                }
                // Emit the event back to the server.
                this.emit("broadcast:channel", {
                    channel: doc.channel,
                    action: "deleted",
                    event: "command",
                    service: "",
                    data: doc
                });
            });
        }).error((error: any) => Logger.error(error));
    }

    /**
     * Watch the quotes tables
     * 
     * 
     * @memberOf RethinkDB
     */
    watchQuotes() {
        Quotes.changes().then((feed: any) => {
            feed.each((error: any, doc: any) => {
                if (error) {
                    Logger.error(error);
                }
                let action: "deleted" | "created" | "updated" = "updated";

                if (doc.isSaved() === false) {
                    action = "deleted";
                } else if (doc.getOldValue() == null) {
                    action = "created";
                }
                // Emit the event back to the server.
                this.emit("broadcast:channel", {
                    channel: doc.channel,
                    action: action,
                    event: "quote",
                    service: "",
                    data: doc
                });
            });
        }).error((error: any) => Logger.error(error));
    }

    /**
     * Watch the repeats table
     * 
     * 
     * @memberOf RethinkDB
     */
    watchRepeats() {
        Repeats.changes().then((feed: any) => {
            feed.each((error: any, doc: any) => {
                if (error) {
                    Logger.error(error);
                }
                let action: "deleted" | "created" | "updated" = "updated";

                if (doc.isSaved() === false) {
                    action = "deleted";
                } else if (doc.getOldValue() == null) {
                    action = "created";
                }
                // Emit the event back to the server.
                this.emit("broadcast:channel", {
                    token: doc.token,
                    action: action,
                    event: "repeat",
                    service: "",
                    data: doc
                });

                if (action === "created") {
                    this.server.repeat.addRepeat(doc);
                } else if (action === "deleted") {
                    this.server.repeat.removeRepeat(doc);
                } else if (action === "updated") {
                    this.server.repeat.removeRepeat(doc.getOldValue());
                    this.server.repeat.addRepeat(doc);
                }
            });
        }).error((error: any) => Logger.error(error));
    }

    /**
     * Watch the config table
     * 
     * 
     * @memberOf RethinkDB
     */
    watchConfig() {
        Config.changes().then((feed: any) => {
            feed.each((error: any, doc: any) => {
                if (error) {
                    Logger.error(error);
                }
                let action: "deleted" | "created" | "updated" = "updated";

                if (doc.isSaved() === false) {
                    action = "deleted";
                } else if (doc.getOldValue() == null) {
                    action = "created";
                }
                // Emit the event back to the server.
                this.emit("broadcast:channel", {
                    channel: doc.channel,
                    action: action,
                    event: "config",
                    service: "",
                    data: doc
                });
            });
        }).error((error: any) => Logger.error(error));
    }

    /**
     * Get all the current repeats
     * 
     * @returns {*}
     * 
     * @memberOf RethinkDB
     */
    getAllReapeats(): any {
        return Repeats.run().then((res: any) => {
            return res;
        });
    }

    /**
     * Does a channel exist?
     * 
     * @param {string} channel
     * @returns {boolean}
     * 
     * @memberOf RethinkDB
     */
    channelExists(channel: string): boolean {
        return Users.filter({ token: channel }).run().then((res: Object) => {
            return res === [];
        });
    }

    /**
     * Find a command by the name
     * 
     * @param {string} command
     * @returns {*}
     * 
     * @memberOf RethinkDB
     */
    getCommandName(command: string): any{
        return Commands.filter({ id: command }).run().then((res: Object) => {
            return res;
        });
    }
}
