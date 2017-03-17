
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
        host: string;
        port: number;
        password: string;
        db: number;
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
