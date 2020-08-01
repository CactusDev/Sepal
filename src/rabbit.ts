
import { EventEmitter } from "events";

import * as Amqp from "amqp-ts";

export class RabbitHandler extends EventEmitter {
    private connection: Amqp.Connection;
    private proxyExchange: Amqp.Exchange;
    private outgoingQueue: Amqp.Queue;

    constructor(private host: string, private port: number, private messageQueueName: string) {
        super();
    }

    public async connect() {
        this.connection = new Amqp.Connection(`amqp://${this.host}:${this.port}`);
        this.proxyExchange = this.connection.declareExchange("proxy");
        
        this.outgoingQueue = this.connection.declareQueue(`${this.messageQueueName}-proxy`);
        this.outgoingQueue.bind(this.proxyExchange);

        await this.connection.completeConfiguration();
    }

    public async disconnect() {
        await this.connection.close();
    }

    public async queueResponse(message: ProxyResponse[]) {
        for (let i = 0; i < message.length; i++) {
            message[i].order = i;
        }

        const stringed = JSON.stringify(message);
        await this.outgoingQueue.send(new Amqp.Message(stringed));
    }
}
