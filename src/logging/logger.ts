
const colors = require("colors/safe");

export function info(message: string) {
    console.log(colors.green("INFO: ") + colors.white(message));
}

export function warning(message: string) {
        console.log(colors.yello("WARN: ") + colors.white(message));
}

export function error(message: string) {
        console.log(colors.red("ERROR: ") + colors.white(message));
}
