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
        host: "localhost",
        port: 4000,
        password: "supergudpass",
        db: 1
    },
    sentry: {
        dsn: "https://amazing.neato.stuff/keys",
        enabled: false
    }
};
