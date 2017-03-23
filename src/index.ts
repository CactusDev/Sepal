import { EventCache } from "./caching";
import Config from "./configs/config";

import { Rethink } from "./rethink";
import { SepalSocket } from "./socket";
import { RepeatHandler } from "./repeat";
import { Logger } from "./logger";
import { Redis } from "./redis";

/**
 * Init sentry
 * 
 */
async function initLogger() {
    await Logger.createSentry(Config.sentry);
}

/**
 * Connect to rethink
 * 
 * @returns Rethink instance
 */
async function createRethink() {
    const rethink: Rethink = new Rethink(Config);
    await rethink.connect();
    return rethink;
}


/**
 * Connect to redis.
 * 
 * @returns Redis instance
 */
async function createRedis() {
    const redis: Redis = new Redis(Config);
    await redis.connect();
    return redis;
}


/**
 * Start repeats
 * 
 * @param {SepalSocket} socket SepalSocket instance
 * @param {Rethink} rethink RethinkDB instance
 */
async function startRepeat(socket: SepalSocket, rethink: Rethink) {
    const repeat: RepeatHandler = new RepeatHandler(socket, rethink);
    await repeat.startRepeats();
}

async function createCache(redis: Redis, rethink: Rethink) {
    const cache = new EventCache(redis, rethink);
    return cache;
}

/**
 * Create Sepal's websocket and listen
 * 
 * @param {Rethink} rethink RethinkDB instance
 * @returns SepalSocket instance
 */
async function createSocket(rethink: Rethink, redis: Redis, cache: EventCache) {
    const socket: SepalSocket = new SepalSocket(Config, rethink, cache);
    await socket.create();

    return socket;
}


/**
 * Init everything
 * 
 */
async function init() {
    try {
        await initLogger();

        const rethink: Rethink = await createRethink();
        const redis: Redis = await createRedis();
        const cache: EventCache = await createCache(redis, rethink);
        const socket: SepalSocket = await createSocket(rethink, redis, cache);

        await startRepeat(socket, rethink);
    } catch (e) {
        Logger.error(<string>e);
    }
}

init();
