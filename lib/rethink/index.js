"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thinky = require("thinky");
class Rethink {
    constructor(config) {
        this.config = config;
        this.thinkyInstance = new thinky(config.rethink);
    }
}
exports.Rethink = Rethink;
