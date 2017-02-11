import * as Promise from "bluebird";
import { Logger } from "../logging";

const redis = require("redis");

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

/**
 * Handle the redis interactions
 * 
 * @export
 * @class Redis
 */
export class Redis {
    client: any = null;

    /**
     * Connect to the redis server
     * 
     * @param {IConfig} config
     * @returns {Promise<any>}
     * 
     * @memberOf Redis
     */
    connect(config: IConfig): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            // Timeout to create an error if we're unable to connect.
            let connectionTimeout: any = setTimeout(() => {
                return reject("Unable to connect to Redis.");
            }, 2000);

            let client = redis.createClient(config.redis);

            client.on("reconnection", () => {
                Logger.debug("Connection to Redis was lost. Attempting to reconnect...");
            });

            client.on("error", (error: string) => {
                Logger.error(error);
            });

            client.on("ready", () => {
                clearTimeout(connectionTimeout);
                this.client = client;

                resolve();
            });
        });
    }

    /**
     * Disconnect from the redis server
     * 
     * @returns {Promise<any>}
     * 
     * @memberOf Redis
     */
    disconnect(): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            let disconnectionTimeout: any = setTimeout(() => {
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
     * @param {string} key
     * @param {string} value
     * @param {number} [expire]
     * @returns {Promise<string>}
     * 
     * @memberOf Redis
     */
    set(key: string, value: string, expire?: number): Promise<string> {
        if (expire != null) {
            return this.client.setexAsync(key, expire, value);
        }
        return this.client.setAsync(key, value);
    }

    /**
     * Get a key
     * 
     * @param {string} key
     * @returns {Promise<any>}
     * 
     * @memberOf Redis
     */
    get(key: string): Promise<any> {
        return this.client.getAsync(key);
    }

    /**
     * Remove a key
     * 
     * @param {string} key
     * @returns {Promise<any>}
     * 
     * @memberOf Redis
     */
    delete(key: string): Promise<any> {
        return this.client.delAsync(key);
    }

    /**
     * Increment the value of a key
     * 
     * @param {string} key
     * @returns {Promise<any>}
     * 
     * @memberOf Redis
     */
    increment(key: string): Promise<any> {
        return this.client.incrAsync(key);
    }
}
