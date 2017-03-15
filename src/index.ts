
import Config from "./configs/config";

import { Rethink } from "./rethink";

const rethink: Rethink = new Rethink(Config);
rethink.connect();
