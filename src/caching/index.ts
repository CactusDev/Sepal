
\import { Redis } from "../redis";

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
     * 
     * @memberOf EventCache
     */
    constructor(private redis: Redis) {

    }

    /**
     * Cache an event in Redis.
     * 
     * @param {string} event 
     * @param {CachedEvent} data 
     * 
     * @memberOf EventCache
     */
    public async cacheEvent(event: string, cacheTime: number, data: CachedEvent) {
        const cachedEvent: CachedEvent = this.isEventCached(event, data.channel);
    }

    public async isEventCached(event: string, channel: string): Promise<CachedEvent> {
        const cacheEvent = await this.redis.get(`${channel}:${event}`);
        if (cacheEvent) {
            return {
                channel: cacheEvent.channel,
                user: cacheEvent.user
            };
        }
        return null;
    }
}
