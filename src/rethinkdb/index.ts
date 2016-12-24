import { EventEmitter } from "events";

import { Server } from "../server";

import { Logger } from "../logging";

const config: IConfig = require("../configs/development");

const thinky = require("thinky")(config.rethinkdb);
const type = thinky.type;

// TODO: Fix this
const Commands = thinky.createModel("commands", type.any());

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
    commandName: type.string(),
    command: type.object()
});

const Config = thinky.createModel("config", {
    id: type.string(),
    token: type.string(),
    services: type.object(),
    announce: type.object(),
    spam: type.object()
});

const Cached = thinky.createModel("cached", {
    id: type.string(),
    token: type.string(),
    service: type.string(),
    event: type.string()
});

interface Result {
    "new_val": any;
    "old_val": any;
};

export class RethinkDB extends EventEmitter {
    // TODO: Figure out variable types for all the things
    constructor(public config: IConfig, public server: Server) {
        super();
    }

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

    getRepeats(channel: String): Object {
        return Repeats.filter({ "token": channel }).run().then((res: Object) => {
            return res;
        });
    }

    getAllReapeats(): any {
        return Repeats.run().then((res: any) => {
            return res;
        });
    }

    channelExists(channel: string) {
        Users.filter({ username: channel }).run().then((res: Object) => {
            return res === [];
        });
    }

    addCached(data: Object) {
        const document = new Cached({
            token: data.token,
            service: data.service,
            event: data.event
        });

        document.saveAll().then((res: Object) => {
            if (!res.id) {
                Logger.error("Error creating a new cached document! " + JSON.stringify(res));
            }
        });
    }

    hasEvent(data: Object): boolean {
        return Cached.filter({ token: data.token, channel: data.channel, service: data.service, event: data.event }).run().then((res: Object) => {
            return res !== (null || undefined || {} || []);
        });
    }
}
