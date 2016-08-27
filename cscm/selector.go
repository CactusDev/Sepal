package cscm

import (
	"github.com/cactusbot/sepal/client"
	socket "github.com/cactusbot/sepal/websocket"
	"github.com/gorilla/websocket"
)

// CreateNewInstance - Create a new instace, and move all the connections over
func CreateNewInstance() {
	socket.Listen(":3001")
	connections := []websocket.Conn{}

	for _, client := range client.Clients {
		append(connections, client.Connection)
	}

	redirect(connections)
}

func redirect(connections []*websocket.Conn) {
	// TODO
}
