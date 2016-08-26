package client

import (
	"github.com/cactusbot/sepal/util"
	"github.com/gorilla/websocket"
)

// Client - Client connected to the websocket
type Client struct {
	Events     []string
	IP         string
	Connection *websocket.Conn
}

// Clients - Array of clients connected to the websocket
var Clients = map[string]Client{}

// AddClient - Add a client
func AddClient(client Client) {
	Clients[client.IP] = client
}

// Remove - Remove the client
func (c *Client) Remove() {
	_, exists := Clients[c.IP]
	if exists {
		delete(Clients, c.IP)
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

// Subscribe - Subscribe to events
func (c *Client) Subscribe(event string) {
	c.Events = append(c.Events, event)
	// go func() {
	// 	for _, event := range events {
	// 		_ = append(c.Events, event)
	// 	}
	// }()
}

// Unsubscribe - Unsubscribe from events
func (c *Client) Unsubscribe(event string) {
	yes, index := util.StringInSlice(event, c.Events)
	if yes {
		util.GetLogger().Info(c.Events[index])
		c.Events[index] = ""
	}
	// go func() {
	// 	for _, event := range events {
	// 		yes, index := util.StringInSlice(event, c.Events)
	// 		if yes && index != -1 {
	// 			c.Events[index] = ""
	// 		}
	// 	}
	// }()
}
