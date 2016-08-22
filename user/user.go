package user

import ".././util"

type user struct{
    Events []string
}

var users = map[string]user{}

func AddUser(channel string, events []string) {
    users[channel] = user{events}
}

func RemoveUser(channel string) {
    _, exists := users[channel]
    if exists {
        delete(users, channel)
    } else {
        defer func() {
            if r := recover(); r != nil {
                util.GetLogger().Warn("Recovered from panic.")
            }
        }()
        panic("Tried to delete a user that doesn't exist!")
    }
}

func Subscribe(channel string, events []string) {
    go func() {
        for _, event := range events {
            _ = append(users[channel].Events, event)
        }
    }()
}

func Unsubscribe(channel string, events []string) {
    go func() {
        // TODO: this stuff down there v
        for _, _ = range events {
            // delete(users[channel].Events, event)
        }
    }()
}
