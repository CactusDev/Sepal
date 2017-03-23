import { Rethink } from "../rethink";

import { Redis } from "../redis";

/**
 * Event waiting to be cached.
 * 
 * @export
 * @interface CachedEvent
 */
export interface CachedEvent {
    channel: string;
    user: string;
}

/**
 * Handles caching of any type of event.
 * 
 * @export
 * @class EventCache
 */
export class EventCache {

    /**
     * Creates an instance of EventCache.
     * @param {Redis} redis redis instance
     * @param {Rethink} rethink rethink instance 
     * 
     * @memberOf EventCache
     */
    constructor(private redis: Redis, private rethink: Rethink) {

    }

    /**
     * 
     * 
     * @param {string} event event type to cache
     * @param {number} cacheTime time to cache
     * @param {CachedEvent} data information about the event
     * 
     * @memberOf EventCache
     */
    public async cacheEvent(event: string, cacheTime: number, data: CachedEvent) {
        if (!this.isEventCached(event, data.channel, data.user)) {
            const cached = await this.rethink.setEvent(data.channel, data.user, event, new Date().toString());
            await this.redis.set(`${data.channel}:${event}:${data.user}:${cached.id}`, "true", cacheTime);
        }
    }

    /**
     * Check if an event is cached
     * 
     * @param {string} event event type
     * @param {string} channel the channel the event was in
     * @param {string} user the user that executed the event
     * @returns {Promise<boolean>} event existance
     * 
     * @memberOf EventCache
     */
    public async isEventCached(event: string, channel: string, user: string): Promise<boolean> {
        const cached = await this.rethink.getEvent(channel, user, event);
        const redisEvent: string = await this.redis.get(`${channel}:${event}:${user}:${cached.id}`);
        return redisEvent === "true";
    }
}
