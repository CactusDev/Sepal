
import { RepeatManager } from "./repeats"
import { RedisController } from "cactus-stl"

export class Core {

    constructor(private redis: RedisController, private repeatManager: RepeatManager) {
    }
	
    public async start() {
        await this.redis.connect()

        await this.repeatManager.recover()
        await this.repeatManager.startExpirationListener()
    }
}
