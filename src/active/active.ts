
import * as Logger from "../logging/logger";

interface ActiveUsers {
    [channelName: string]: {
        [userId: string]: {
            activeTime: number;
            lastMessage: number;
        };
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
        this.activeUsers[channel][uuid]["activeTime"] = 0;
        this.activeUsers[channel][uuid]["lastMessage"] = 0;

        Logger.debug(`Added ${uuid} to ${channel}`);
    }

    deleteUser(uuid: string, channel: string) {
        Object.keys(this.activeUsers).forEach(channelName => {
            if (channelName === channel) {
                Object.keys(this.activeUsers[channelName]).forEach(userID => {
                    if (userID === uuid) {
                        delete this.activeUsers[channel][userID];
                    }
                });
            }
        });

        Logger.debug(`Removed ${uuid} from ${channel}`);
    }

    watch() {
        // let time = new Date().getTime();
    }
}
