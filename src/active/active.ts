
import * as Logger from "../logging/logger";

interface ActiveUsers {
    [channelName: string]: {
        [userId: string]: number;
    }[];
}

export class Active {
    activeUsers: ActiveUsers;
    activeTime: number;

    constructor(activeTime?: number) {
        if (activeTime != null) {
            this.activeTime = 4;
        } else {
            this.activeTime = activeTime;
        }
    }

    addUser(uuid: string, channel: string) {
        this.activeUsers[channel].push({ uuid: 0 });
    }

    deleteUser(uuid: string, channel: string) {
        // TODO
    }

    watch() {
        let time = new Date().getTime();
    }
}
