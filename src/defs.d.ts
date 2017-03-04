
/**
 * Config object
 * 
 * @interface IConfig
 */
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

/**
 * Channel event that's emitted
 * 
 * @interface IChannelEvent
 */
interface IChannelEvent {
  token: string;
  action: string;
  event: string;
  service: string;
  data: any;
}
