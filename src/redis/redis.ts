const redis = require("redis");
const client = redis.createClient();

export class Redis {

    host: string;
    port: number;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
    }

    set(key: string, value: string) {
        client.set(key, value);
    }

    get(key: string) {
        return client.get(key);
    }
}
