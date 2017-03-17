export = {
  env: "develop",
  rethinkdb: {
    host: "localhost",
    port: 28015,
    user: "",
    password: "",
    db: "api",
    silent: true // Setting this makes Thinky not log "debug" data.
  },
  redis: {
    host: "localhost",
    port: 6379,
    password: "",
    db: 0
  },
  sentry: {
    dsn: ""
  },
  socket: {
    port: 3000
  }
};
