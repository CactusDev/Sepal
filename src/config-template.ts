
export class Config {
    config = {
        "env": "dev",
        "rethinkdb": {
            "host": "localhost",
            "port": "28015",
            "authKey": "",
            "db": "api"
        },
        "redis": {
            "host": "localhost",
            "port": "6379",
            "password": "",
            "db": ""
        },
        "sentry": {
            "enabled": false,
            "url": ""
        }
    };
}
