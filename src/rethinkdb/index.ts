import { EventEmitter } from "events";

const config: IConfig = require(`../configs/${process.env["NODE_ENV"] || "development"}`);

const thinky = require("thinky")(config.rethinkdb);
const type = thinky.type;

const Commands = thinky.createModel("commands", {
    id: type.string(),
    commandName: type.string(),
    response: type.string(),
    calls: type.number(),
    channel: type.string(),
    service: type.string()
});

const Quotes = thinky.createModel("quotes", {
    id: type.string(),
    quoteID: type.number(),
    quote: type.string()
});

const Users = thinky.createModel("users", {
    id: type.string(),
    username: type.string()
});

interface Result {
    "new_val": any;
    "old_val": any;
};

export class RethinkDB extends EventEmitter {
    // TODO: Figure out variable types for all the things
    constructor(public config: IConfig) {
        super();
    }

    watchCommands() {
        Commands.changes().then((feed: any) => {
            feed.each((error: any, doc: any) => {
                if (error) {
                    console.log(error);
                    process.exit(1);
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
                    action: "deleted",
                    event: "command",
                    service: "",
                    data: doc
                });
            });
        }).error((error: any) => {
            console.log(error);
            process.exit(1);
        });
    }

    watchQuotes() {
        Quotes.changes().then((feed: any) => {
            feed.each((error: any, doc: any) => {
                if (error) {
                    console.log(error);
                    process.exit(1);
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
                    action: "deleted",
                    event: "quote",
                    service: "",
                    data: doc
                });
            });
        }).error((error: any) => {
            console.log(error);
            process.exit(1);
        });
    }

    channelExists(channel: string) {
        Users.filter({ username: channel }).run().then((res: Object) => {
            return res === [];
        });
    }
}
