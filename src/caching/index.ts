
import { Redis } from "../redis";
import { Logger } from "../logger";

export class Caching {
    constructor(public redis: Redis) { }

    hasFollowed(username: string, service: string): boolean {
        return false;
    }
}
