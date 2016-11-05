
const colors = require("colors/safe");

export class Logger {
    constructor() {

    }

    info(message: string) {
        console.log(colors.green("INFO: ") + colors.white(message));
    }

    warning(message: string) {
        console.log(colors.yello("WARN: ") + colors.white(message));
    }

    error(message: string) {
        console.log(colors.red("ERROR: ") + colors.white(message));
    }
}
