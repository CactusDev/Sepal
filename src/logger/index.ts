const chalk = require("chalk");
const dateFormat = require("dateformat");

/**
 * Magical logger of happiness
 * 
 * @export
 * @class Logger
 */
export default class {

    /**
     * Log with a normal level
     * 
     * @static
     * @param {(string | Object)} message 
     * 
     * @memberOf Logger
     */
    public static log(message: string | Object) {
        this.formatMessage(chalk.green("INFO: "), message);
    }

    /**
     * Log with a warning level
     * 
     * @static
     * @param {(string | Object)} message 
     */
    public static warning(message: string | Object) {
        this.formatMessage(chalk.yellow("WARN: "), message);
    }

    /**
     * Log with an error level
     * 
     * @static
     * @param {(string | Object)} message 
     */
    public static error(message: string | Object) {
        this.formatMessage(chalk.red("ERR: "), message);
    }

    /**
     * Log with a debug level
     * 
     * @static
     * @param {(string | Object)} message 
     */
    public static debug(message: string | Object) {
        this.formatMessage(chalk.blue("DEBUG: "), message);
    }


    /**
     * Format a new message with the date
     * 
     * @private
     * @static
     * @param {string} prefix 
     * @param {string} message 
     * 
     * @memberOf Logger
     */
    private static formatMessage(prefix: string, message: string | Object) {
        if (typeof(message) === typeof("")) {
            console.log(this.getTime() + prefix + chalk.white(message));
        } else if (message instanceof Object) {
            console.log(this.getTime() + prefix + chalk.white(JSON.stringify(message)));
        } else {
            throw new TypeError(`Type ${typeof(message)} is not a string, or an object.`);
        }
    }

    /**
     * Get the current time
     * 
     * @private
     * @static
     * @returns {string} 
     * 
     * @memberOf Logger
     */
    private static getTime(): string {
        var time = dateFormat(new Date(), "HH:MM:ss");
        return `[${chalk.grey(time)}] `;
    }
}
