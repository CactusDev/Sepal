package client

import (
	"github.com/cactusdev/sepal/util"
	"github.com/gorilla/websocket"
)

// Client - Client connected to the websocket
type Client struct {
	Scopes     []string
	IP         string
	Channel    string
	Connection *websocket.Conn
}

// Clients - Array of clients connected to the websocket
var Clients = map[string]Client{}

// AddClient - Add a client
func AddClient(client *Client) {
	Clients[client.IP] = *client
}

// Remove - Remove the client
func (c *Client) Remove(client *Client) {
	_, exists := Clients[client.IP]
	if exists {
		delete(Clients, client.IP)
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
