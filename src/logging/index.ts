const colors = require("colors/safe");

export class Logger {
    public static raven: any;
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
