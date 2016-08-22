package user

type user struct{
    Events string
}

var users = map[string]user{}

func AddUser(channel string, events string) {
    newUser := user{events}
    users[channel] = newUser
}

func RemoveUser(channel string) {
    _, exists := users[channel]
    if exists {
        delete(users, channel)
    }
}
