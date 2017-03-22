const chalk = require("chalk");
const dateFormat = require("dateformat");
const Raven = require("raven");

interface SentryInformation {
    enabled: boolean;
    dsn: string;
}

/**
 * Magical logger of happiness
 * 
 * @export
 * @class Logger
 */
export class Logger {
    private static raven: any;
    private static sentryEnabled: boolean = false;

    public static async createSentry(sentry: SentryInformation) {
        if (sentry.enabled) {
            this.sentryEnabled = true;

            this.log("Initializing Sentry.");
            this.raven = new Raven.Client(sentry.dsn);
            this.raven.patchGlobal();
            this.log("Sentry initialized.");
        }
    }

    /**
     * Log with a normal level
     * 
     * @static
     * @param {(string | Object)} message Message to log
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
     * @param {(string | Object)} message Message to log
     */
    public static warning(message: string | Object) {
        this.formatMessage(chalk.yellow("WARN: "), message);
    }

    /**
     * Log with an error level
     * 
     * @static
     * @param {(string | Object)} message Message to log
     */
    public static error(message: string | Object) {
        if (this.sentryEnabled) {
            this.formatMessage(chalk.red("ERR: "), message);
            this.raven.captureException(message);
        }
    }

    /**
     * Log with a debug level
     * 
     * @static
     * @param {(string | Object)} message Message to log
     */
    public static debug(message: string | Object) {
        if (this.debug) {
            this.formatMessage(chalk.blue("DEBUG: "), message);
        }
    }


    /**
     * Format a new message with the date
     * 
     * @private
     * @static
     * @param {string} prefix Logging prefix
     * @param {string} message Message to log
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
     * @returns {string} Formatted time
     * 
     * @memberOf Logger
     */
    private static getTime(): string {
        var time = dateFormat(new Date(), "HH:MM:ss");
        return `[${chalk.grey(time)}] `;
    }

    /**
     * Creates an instance of Logger.
     * @param {boolean} [debug=false] Debug mode
     * 
     * @memberOf Logger
     */
    constructor(private debug = false) {

    }
}
