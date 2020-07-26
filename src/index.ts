
import { Injector } from "dependy";

const injector = new Injector(
	{
		injects: Core,
		depends: []
	}
);

async function start() {
}

start()
	.then(() => console.log("Sepal online."))
	.catch(console.error)
