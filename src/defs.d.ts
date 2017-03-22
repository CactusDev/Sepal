
interface IConfig {
    socket: {
        port: number;
    };
    rethink: {
        connection: {
            host: string;
            user: string;
            password: string;
        }
        db: string;
    };
    redis: {
        db: string;
        host: string;
        port: number;
        password: string;
    };
    sentry: {
        dsn: string;
        enabled: boolean;
    };
}

interface IChannelEvent {
    event: string;
    data: any;
}
