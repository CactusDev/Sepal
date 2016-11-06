
const colors = require("colors/safe");

export function info(message: string) {
    console.log(colors.green("INFO: ") + colors.white(message));
}

export function warning(message: string) {
    console.log(colors.yellow("WARN: ") + colors.white(message));
}

export function error(message: string) {
    console.log(colors.red("ERROR: ") + colors.white(message));
}

export function debug(message: string) {
    console.log(colors.blue("DEBUG: ") + colors.white(message));
}
