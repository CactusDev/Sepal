"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const dateFormat = require("dateformat");
class default_1 {
    static log(message) {
        this.formatMessage(chalk.green("INFO: "), message);
    }
    static warning(message) {
        this.formatMessage(chalk.yellow("WARN: "), message);
    }
    static error(message) {
        this.formatMessage(chalk.red("ERR: "), message);
    }
    static debug(message) {
        this.formatMessage(chalk.blue("DEBUG: "), message);
    }
    static formatMessage(prefix, message) {
        if (typeof (message) === typeof ("")) {
            console.log(this.getTime() + prefix + chalk.white(message));
        }
        else if (message instanceof Object) {
            console.log(this.getTime() + prefix + chalk.white(JSON.stringify(message)));
        }
        else {
            throw new TypeError(`Type ${typeof (message)} is not a string, or an object.`);
        }
    }
    static getTime() {
        var time = dateFormat(new Date(), "HH:MM:ss");
        return `[${chalk.grey(time)}] `;
    }
}
exports.default = default_1;
