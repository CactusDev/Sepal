
import { EventEmitter } from "events";
import { Config } from "./config"

import * as Amqp from "amqp-ts";

export class RabbitHandler extends EventEmitter {
    private connection: Amqp.Connection;
    private proxyExchange: Amqp.Exchange;
    private outgoingQueue: Amqp.Queue;

    constructor(private config: Config) {
        super();
    }

    public async connect() {
        this.connection = new Amqp.Connection(`amqp://${this.config.rabbitmq.host}:${this.config.rabbitmq.port}`);
        this.proxyExchange = this.connection.declareExchange("proxy");
        
        this.outgoingQueue = this.connection.declareQueue(`${this.config.rabbitmq.queues.messages}-repeat`);
        this.outgoingQueue.bind(this.proxyExchange);

        await this.connection.completeConfiguration();
    }

    public async disconnect() {
        await this.connection.close();
    }

    public async queueResponse(message: CactusContext) {
        const stringed = JSON.stringify(message);
        await this.outgoingQueue.send(new Amqp.Message(stringed));
    }
}
