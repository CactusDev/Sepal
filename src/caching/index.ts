
import { RethinkDB } from "../rethinkdb";
import { Logger } from "../logger";

export class Caching {
    constructor(public rethink: RethinkDB) { }

    hasFollowed(username: string, channel: string, service: string): boolean {
        return this.rethink.hasEvent({ token: username, "channel": channel, service: service, event: "follow" });
    }

    addFollow(username: string, service: string, channel: string) {
        let packet = { token: username, "channel": channel, event: "follow" }

        this.rethink.addCached(packet);
    }
}
