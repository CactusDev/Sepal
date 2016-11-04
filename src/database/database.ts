"use strict";

import { Config } from "../config";

const config = new Config().config;
const thinky = require("thinky")(config.rethinkdb);
const type = thinky.type;

interface Result {
    "new_val": any;
    "old_val": any;
};

let Commands = thinky.createModel("commands", {
    id: type.string(),
    commandName: type.string(),
    response: type.string(),
    calls: type.number(),
    channel: type.string(),
    service: type.string()
});

let Quotes = thinky.createModel("quotes", {
    id: type.string(),
    quoteID: type.number(),
    quote: type.string()
});

let Users = thinky.createModel("users", {
    id: type.string(),
    username: type.string()
})

export class Database {
    server: any;

    // TODO: Figure out variable types for all the things
    constructor(server: any) {
        this.server = server;
    }

    watchCommands() {
        Commands.changes().then((feed: any) => {
            feed.each((error: any, document: any) => {
                if (error) {
                    console.log(error);
                    process.exit(1);
                }

                if (document.isSaved() === false) {
                    this.server.broadcastToChannel(document.channel, "deleted", "command", document);
                } else if (document.getOldValue() == null) {
                    this.server.broadcastToChannel(document.channel, "created", "command", document);
                } else {
                    this.server.broadcastToChannel(document.channel, "updated", "command", document);
                }
            });
        }).error((error: any) => {
            console.log(error);
            process.exit(1);
        });
    }

    watchQuotes() {
        Quotes.changes().then((feed: any) => {
            feed.each((error: any, document: any) => {
                if (error) {
                    console.log(error);
                    process.exit(1);
                }

                if (document.isSaved() === false) {
                    this.server.broadcastToChannel(document.channel, "deleted", "quote", document);
                } else if (document.getOldValue() == null) {
                    this.server.broadcastToChannel(document.channel, "created", "quote", document);
                } else {
                    this.server.broadcastToChannel(document.channel, "updated", "quote", document);
                }
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
