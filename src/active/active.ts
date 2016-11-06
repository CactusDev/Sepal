
import * as Logger from "../logging/logger";

interface ActiveUsers {
    [channelName: string]: {
        [userId: string]: number;
    }[];
}

export class Active {
    activeUsers: ActiveUsers;

    constructor() { }

    addUser(uuid: string, channel: string) {
        this.activeUsers[channel].push({ uuid: 0 });
    }

    deleteUser(uuid: string, channel: string) {
        // TODO
    }
}
