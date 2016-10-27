"use strict";

const thinky = require("thinky")();
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

export class Database {
    constructor() { }

    stringify(document: any) {
        return JSON.stringify(document, null, 4);
    }

    watchCommands() {
        Commands.changes().then((feed: any) => {
            feed.each((error: any, document: any) => {
                console.log(document);
                if (error) {
                    console.log(error);
                    process.exit(1);
                }

                if (document.isSaved() === false) {
                    console.log("This was deleted: ");
                    console.log(this.stringify(document));
                } else if (document.getOldValue() == null) {
                    console.log("This was created");
                    console.log(this.stringify(document));
                } else {
                    console.log("This was updated: ");
                    console.log("Old: ");
                    console.log(this.stringify(document.getOldValue));
                    console.log("New: ");
                    console.log(this.stringify(document));
                }
            });
        }).error((error: any) => {
            console.log(error);
            process.exit(1);
        });
    }
}
