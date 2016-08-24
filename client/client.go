package user

import "github.com/cactusbot/sepal/util"

// Client - Client connected to the websocket
type Client struct {
	Events []string
	IP     string
}

// Clients - Array of clients connected to the websocket
var Clients = map[string]Client{}

// AddClient Add a client
func AddClient(channel string, events []string, ip string) Client {
	client := Client{events, ip}
	Clients[channel] = client
	return client
}

// RemoveClient Remove a client
func (c *Client) RemoveClient(channel string) {
	_, exists := Clients[channel]
	if exists {
		delete(Clients, channel)
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
func (c *Client) Subscribe(channel string, events []string) {
	go func() {
		for _, event := range events {
			_ = append(Clients[channel].Events, event)
		}
	}()
}

// Unsubscribe Unsubscribe to events
func (c Client) Unsubscribe(channel string, events []string) {
	go func() {
		// TODO: this stuff down there v
		for _ = range events {
			// delete(Clients[channel].Events, event)
		}
	}()
}
