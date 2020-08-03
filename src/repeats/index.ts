
import { RedisController } from "cactus-stl"
import { RabbitHandler } from "../rabbit"

export class RepeatManager {

    constructor(private redis: RedisController, private rabbit: RabbitHandler) {
    }

    public async recover() {
        // Get the current active repeats in Redis
        const currentRepeats = await this.redis.scan("repeat:*")
        const currentIds = currentRepeats.map(repeat => +repeat.split(":")[2])

        // Get the list of repeats that should be running
        const allRepeats = await this.getAllRepeats()

        // Remove the already running ones
        const difference = allRepeats.filter(repeat => !currentIds.includes(repeat.id))
    
        // Start all missing repeats.
        difference.forEach(async repeat => await this.redis.set(`repeat:${repeat.channel}:${repeat.id}`, "", repeat.meta.delay))
    }

    public startExpirationListener() {
        this.redis.on("expiration", async (event) => {
            const { key, channel, id } = event.msg.split(":")
            
            const repeat = await this.getRepeatData(channel, id)
            if (!repeat) {
                // If the repeat does not / no longer exists, don't reschedule or send the packet.
                return
            }

            // Add the key back into Redis.
            await this.redis.set(event.msg, "", repeat.meta.delay)

            console.log(`Submitting repeat for ${repeat.channel}`)
            // Once it has been scheduled, send the packet into Rabbit.
            await this.rabbit.queueResponse({
                packet: repeat.message,
                channel: repeat.channel,
                service: "twitch"  // TODO: Service-specific repeats
            })
        })
    }

    private async getRepeatData(channel: string, repeatId: number): Promise<Repeat> {
        // TODO
        return {
            id: 1,
            channel: "innectic",
            message: {
                type: "message",
                text: [
                    {
                         type: "text",
                         data: "Testing"
                    }
                ],
                action: false
            },
            meta: {
                delay: 10
            }
        }
    }

    private async getAllRepeats(): Promise<Repeat[]> {
        return [await this.getRepeatData("", 0)]
    }
}
