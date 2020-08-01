
export class Config {

    public redis: {
        db: number;
        host: string;
        port: number;
        password: string;
    }

    public rabbitmq: {
        host: string;
        port: number;
        username: string;
        password: string;
        queues: {
            messages: string;
        }
    };
}
