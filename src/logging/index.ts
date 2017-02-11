const colors = require("colors/safe");

// Should this be documented?
export class Logger {
    public static raven: any;
    // TODO: Move raven stuff to it's own thing
    public static debugMode: boolean = false;

    public static log(message: string) {
        console.log(colors.green("INFO: ") + colors.white(message));
    }

    public static warning(message: string) {
        console.log(colors.yellow("WARN: ") + colors.white(message));
    }

    public static debug(message: string) {
        console.log(colors.blue("DEBUG: ") + colors.white(message));
    }

    public static error(message: string) {
        console.log(colors.red("ERROR: ") + colors.white(message));
        if (Logger.raven != null) {
            Logger.raven.captureException(message);
        }
    }
}
