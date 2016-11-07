import * as Logger from "../logging/logger";

import { Redis } from "../redis";

interface IActiveUsers {
    [channelName: string]: {
        [userId: string]: {
            activeTime: number;
            lastMessage: number;
        };
    };
}

interface IAFK {
    [channelName: string]: Array<string>;
}

export class Active {
    activeUsers: IActiveUsers = {};
    activeTime: number;
    redis: Redis;

    constructor(redis: Redis, activeTime?: number) {
        if (activeTime != null) {
            this.activeTime = 4;
        } else {
            this.activeTime = activeTime;
        }

        this.redis = redis;
    }

    addUser(uuid: string, channel: string) {
        if (this.activeUsers[channel] === undefined) {
            this.activeUsers[channel] = {};
            this.activeUsers[channel][uuid] = {activeTime: 0, lastMessage: 0};
        } else {
            this.activeUsers[channel][uuid] = {activeTime: 0, lastMessage: 0};
        }

        this.redis.set(`${channel}.${uuid}`, "0");

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

        this.redis.delete(`${channel}.${uuid}`);

        Logger.debug(`Removed ${uuid} from ${channel}`);
    }

    private check(): IAFK {
        let time = new Date().getTime();

        let afk: IAFK = {};

        Object.keys(this.activeUsers).forEach(channel => {
            Object.keys(this.activeUsers[channel]).forEach(userID => {
                if ((time - this.activeUsers[channel][userID]["lastMessage"]) >= (this.activeTime * 60)) {
                    if (afk[channel] === undefined) {
                        afk[channel] = [];
                    }
                    afk[channel].push(userID);
                }
            });
        });

        return afk;
    }

    checkActive() {
        Logger.info("Checking for inactive users...");

        let inactiveUsers = this.check();

        Object.keys(inactiveUsers).forEach(checkingChannel => {
            Object.keys(inactiveUsers[checkingChannel]).forEach(checkingUser => {
                Object.keys(this.activeUsers).forEach(channel => {
                    Object.keys(this.activeUsers[channel]).forEach(userID => {
                        if (channel === checkingChannel) {
                            if (checkingUser === userID) {
                                Logger.debug(`Removing inactive user ${userID} from ${channel}`);
                                this.redis.delete(`${channel}.${userID}`)
                                this.activeUsers[channel][userID]["activeTime"] = -1;
                            } else {
                                    this.redis.increment(`${channel}.${userID}`)
                                this.activeUsers[channel][userID]["activeTime"] += 1;
                            }
                        }
                    });
                });
            });
        });
    }
}
