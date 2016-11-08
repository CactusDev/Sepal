export = {
  env: "develop",
  rethinkdb: {
    host: "localhost",
    port: 28015,
    user: "",
    authKey: "", // You should probs switch to the new version and use User logins. Authkey is old and not supported now.
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
    port: 8080
  }
};
