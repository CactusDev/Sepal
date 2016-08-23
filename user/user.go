package user

import "github.com/cactusbot/sepal/util"

type user struct {
	Events []string
}

var users = map[string]user{}

// AddUser Add a user
func AddUser(channel string, events []string) {
	users[channel] = user{events}
}

// RemoveUser Remove a user
func RemoveUser(channel string) {
	_, exists := users[channel]
	if exists {
		delete(users, channel)
	} else {
		defer func() {
			if r := recover(); r != nil {
				util.GetLogger().Error("Recovered from panic.")
				util.GetLogger().Warn("Panic cause: Tried to delete a user that doesn't exist.")
			}
		}()
		panic("Tried to delete a user that doesn't exist!")
	}
}

// Subscribe Subscribe to events
func Subscribe(channel string, events []string) {
	go func() {
		for _, event := range events {
			_ = append(users[channel].Events, event)
		}
	}()
}

// Unsubscribe Unsubscribe to events
func Unsubscribe(channel string, events []string) {
	go func() {
		// TODO: this stuff down there v
		for _ = range events {
			// delete(users[channel].Events, event)
		}
	}()
}
