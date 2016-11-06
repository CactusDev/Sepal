
import * as Logger from "../logging/logger";

interface ActiveUsers {
    [channelName: string]: {
        [userId: string]: number;
    };
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
        this.activeUsers[channel][uuid] = 0;
        Logger.debug(`Added ${uuid} to ${channel}`);
    }

    deleteUser(uuid: string, channel: string) {
        Object.keys(this.activeUsers).forEach(channelName => {
            if (channelName === channel) {
                Object.keys(channel).forEach(user => {
                    if (user === uuid) {
                        delete this.activeUsers[channel][user];
                    }
                });
            }
        });
        Logger.debug(`Removed ${uuid} from ${channel}`);
    }

    watch() {
        let time = new Date().getTime();
    }
}
