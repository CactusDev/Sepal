
import { Injector } from "dependy"
import { RedisController } from "cactus-stl"

import { Core } from "./core"

import * as nconf from "config"
import { Config } from "./config"
import { RabbitHandler } from "./rabbit"
import { RepeatManager } from "./repeats"

const injector = new Injector(
	{
        injects: Config,
        value: nconf
    },
    {
        injects: RedisController,
        depends: [Config],
        create: (config: Config) => new RedisController(config.redis)
    },
    {
        injects: RabbitHandler,
        depends: [Config]
    },
    {
        injects: RepeatManager,
        depends: [RedisController, RabbitHandler]
    },
    {
		injects: Core,
		depends: [RedisController, RepeatManager]
	}
);

async function start() {
    const core = injector.get(Core)
    await core.start()
}

start()
	.then(() => console.log("Sepal online."))
	.catch(console.error)
