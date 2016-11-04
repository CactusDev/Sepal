const redis = require("redis");
const config = require("../config");
const client = redis.createClient(config.redis);

export class Redis {

    constructor() { }

    set(key: string, value: string) {
        client.set(key, value);
    }

    get(key: string) {
        return client.get(key);
    }
}
