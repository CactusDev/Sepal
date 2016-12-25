interface IConfig {
  env: string;
  rethinkdb: {
    host: string;
    port: number;
    user: string;
    authKey?: string;
    password: string;
    db: string;
    silent?: boolean;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
  };
  sentry: {
    dsn: string;
  };
  socket: {
    port: number;
  };
}

interface IChannelEvent {
  token: string;
  action: string;
  event: string;
  service: string;
  data: any;
}
