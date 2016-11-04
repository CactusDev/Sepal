const redis = require("redis");
import { Config } from "../config";

const config = new Config().config;

const client = redis.createClient(config.redis);

export class Redis {
    set(key: string, value: string) {
        client.set(key, value);
    }

    get(key: string) {
        return client.get(key);
    }
}
