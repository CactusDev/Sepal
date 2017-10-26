
import "reflect-metadata";

import { Logger } from "cactus-stl";
Logger.initialize();

Logger.addContainer("core");
Logger.addContainer("socket");

import { ReflectiveInjector } from "@angular/core";
import { Core } from "./core";
import { Socket } from "./socket";

import { Config } from "./config";
import * as nconf from "config";

const injector = ReflectiveInjector.resolveAndCreate([
	{
		provide: Config,
		useValue: nconf
	},
	{
		provide: Socket,
		deps: [Config],
		useFactory: (config: Config) => {
			return new Socket(config);
		}
	},
	Core
]);

const core: Core = injector.get(Core);
core.start()
	.catch(err => Logger.error("core", err));