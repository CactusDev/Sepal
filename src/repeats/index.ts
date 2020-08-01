
import { RedisController } from "cactus-stl"
import { RabbitHandler } from "../rabbit"

export class RepeatManager {

    constructor(private redis: RedisController, private rabbit: RabbitHandler) {
    }

    public startExpirationListener() {
        this.redis.on("expiration", async (chan, msg) => {
            const { key, channel, id } = msg.split(":")
            
            const repeat = await this.getRepeatData(channel, id)
            if (!repeat) {
                // If the repeat does not / no longer exists, don't reschedule or send the packet.
                return
            }

            // Add the key back into Redis.
            await this.redis.set(msg, "", repeat.meta.delay * 1000);

            // Once it has been scheduled, send the packet into Rabbit.
            this.rabbit.queueResponse([
                {
                    packet: repeat.message,
                    channel: repeat.channel,
                    service: ""  // TODO: Service-specific repeats
                }
            ])
        })
    }

    private async getRepeatData(channel: string, repeatId: number): Promise<Repeat> {
        // TODO
        return {
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
                delay: 5
            }
        }
    }
}
