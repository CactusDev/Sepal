export default {
    socket: {
        port: 3000
    },
    rethink: {
        connection: {
            host: "localhost",
            user: "loginUser",
            password: "amazingpassword"
        },
        db: "api"
    },
    redis: {
        db: "1",
        host: "localhost",
        port: 4000,
        password: ""
    },
    sentry: {
        dsn: "https://amazing.neato.stuff/keys",
        enabled: false
    }
};
