
import { Logger } from "cactus-stl";
Logger.initialize();

Logger.addContainer("core");

import { ReflectiveInjector } from "@angular/core";
import { Core } from "./core";

import { Config } from "./config";
import * as nconf from "config";

const injector = ReflectiveInjector.resolveAndCreate([
	{
		provide: Config,
		useValue: nconf
	},
	Core
]);

const core: Core = injector.get(Core);
core.start()
	.catch(err => Logger.error("core", err));