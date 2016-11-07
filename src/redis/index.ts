import * as Promise from "bluebird";
import * as Logger from "../logging/logger";

import { Config } from "../config";
const config = new Config().config;

const redis = require("redis");

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

export class Redis {

    client: any = null;

    connect(): Promise<any> {
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

    disconnect(): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            let disconnectionTimeout: any = setTimeout(() => {
                return reject("Unable to disconnect from Redis.");
            }, 2000);

            this.client.on("end", () => {
                clearTimeout(disconnectionTimeout);
                Logger.info("Disconnected from Redis.");
                resolve();
            });
            this.client.quit();
        });
    }

    set(key: string, value: string, expire?: number): Promise<string> {
        if (expire != null) {
            return this.client.setexAsync(key, expire, value);
        }
        return this.client.setAsync(key, value);
    }

    get(key: string): Promise<any> {
        return this.client.getAsync(key);
    }

    delete(key: string): Promise<any> {
        return this.client.delAsync(key);
    }

    increment(key: string): Promise<any> {
        return this.client.incrAsync(key);
    }
}
