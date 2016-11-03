"use strict";

import { Config } from "../config";
import { Server } from "../server";

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
    calls: type.string(),
    channel: type.string()
});

let Quotes = thinky.createModel("quotes", {
    id: type.string(),
    quoteID: type.string(),
    quote: type.string()
});

export class Database {
    server: any;

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
                    let packet = { "action": "deleted", "type": "command", "data":  document };

                    // FIXME: This is stupid to do
                    this.server.broadcastToChannel(document.channel, packet);
                } else if (document.getOldValue() == null) {
                    let packet = { "action": "created", "type": "command", "data":  document };

                    // FIXME: This is stupid to do
                    this.server.broadcastToChannel(document.channel, packet);
                } else {
                    let packet = { "action": "updated", "type": "command", "data":  document };

                    // FIXME: This is stupid to do
                    this.server.broadcastToChannel(document.channel, packet);
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
                    let packet = { "action": "deleted", "type": "quote", "data":  document };

                    // FIXME: This is stupid to do
                    this.server.broadcastToChannel(document.channel, packet);
                } else if (document.getOldValue() == null) {
                    let packet = { "action": "created", "type": "quote", "data":  document };

                    // FIXME: This is stupid to do
                    this.server.broadcastToChannel(document.channel, packet);
                } else {
                    let packet = { "action": "updated", "type": "quote", "data":  document };

                    // FIXME: This is stupid to do
                    this.server.broadcastToChannel(document.channel, packet);
                }
            });
        }).error((error: any) => {
            console.log(error);
            process.exit(1);
        });
    }
}
