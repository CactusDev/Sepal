
import { RepeatManager } from "./repeats"
import { RabbitHandler } from "./rabbit"
import { RedisController } from "cactus-stl"

export class Core {

    constructor(private redis: RedisController, private rabbit: RabbitHandler, private repeatManager: RepeatManager) {
    }
	
    public async start() {
        await this.redis.connect()
        await this.rabbit.connect()

        await this.repeatManager.recover()
        await this.repeatManager.startExpirationListener()
    }
}
