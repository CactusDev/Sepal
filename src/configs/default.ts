
export default {
    socket: {
        port: 3000
    },
    rethink: {
        connection: {
            host: "localhost",
            user: "yay",
            password: ""
        },
        db: "api"
    },
    redis: {
        host: "",
        port: 2023,
        password: "",
        db: 6
    },
    sentry: {
        dsn: "https://amazing.neato.stuff/keys",
        enabled: false
    }
};
