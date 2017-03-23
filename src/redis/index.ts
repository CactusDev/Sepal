
import * as Bluebird from "bluebird";
import { Logger } from "../logger";
const redis = require("redis");

Bluebird.promisifyAll(redis.RedisClient.prototype);
Bluebird.promisifyAll(redis.Multi.prototype);

/**
 * Redis handler
 * 
 * @export
 * @class Redis
 */
export class Redis {
    private client: any = null;

    /**
     * Creates an instance of Redis.
     * @param {IConfig} config 
     * 
     * @memberOf Redis
     */
    constructor(private config: IConfig) {

    }

    /**
     * Connect to redis
     * 
     * @returns {Promise<any>} connected
     * 
     * @memberOf Redis
     */
    public async connect(): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            let connectionTimeout = setTimeout(() => {
                return reject("Unable to connect to Redis.");
            }, 2000);
            this.client = redis.createClient(this.config.redis);

            this.client.on("reconnection", () => {
                Logger.warning("Connection to Redis was lost. Attempting to reconnect...");
            });

            this.client.on("error", Logger.error);
            this.client.on("ready", () => {
                clearTimeout(connectionTimeout);
                resolve();
            });
        });
    }

    /**
     * Disconnect from redis
     * 
     * @returns {Promise<any>} disconnected
     * 
     * @memberOf Redis
     */
    public async disconnect(): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            let disconnectionTimeout = setTimeout(() => {
                return reject("Unable to disconnect from Redis.");
            }, 2000);

            this.client.on("end", () => {
                clearTimeout(disconnectionTimeout);
                Logger.log("Disconnected from Redis.");
                resolve();
            });
            this.client.quit();
        });
    }

    /**
     * Set a key
     * 
     * @param {string} key name of the key
     * @param {string} value value of the key
     * @param {number} [expire] time until expiration
     * @returns {Promise<string>} result
     * 
     * @memberOf Redis
     */
    public async set(key: string, value: string, expire?: number): Promise<string> {
        if (expire != null) {
            return this.client.setexAsync(key, expire, value);
        }
        return this.client.setAsync(key, value);
    }

    /**
     * Get a key
     * 
     * @param {string} key Key to get
     * @returns {Promise<any>} result
     * 
     * @memberOf Redis
     */
    public async get(key: string): Promise<any> {
        return this.client.getAsync(key);
    }

    /**
     * Delete a key
     * 
     * @param {string} key Key to delete
     * @returns {Promise<any>} result
     * 
     * @memberOf Redis
     */
    public async delete(key: string): Promise<any> {
        return this.client.delAsync(key);
    }

    /**
     * Increment a key
     * 
     * @param {string} key The key to be incremented
     * @returns {Promise<any>} result
     * 
     * @memberOf Redis
     */
    public async increment(key: string): Promise<any> {
        return this.client.incrAsync(key);
    }
}
