package cscm

import (
	"github.com/cactusbot/sepal/client"
	"github.com/cactusbot/sepal/util"
	socket "github.com/cactusbot/sepal/websocket"
	"github.com/gorilla/websocket"
)

// CreateNewInstance - Create a new instace, and move all the connections over
func CreateNewInstance() {
	// TODO everything
	connections := []websocket.Conn{}

	for _, client := range client.Clients {
		connections = append(connections, *client.Connection)
	}

	redirect(&connections)
	socket.Close <- true
}

func redirect(connections *[]websocket.Conn) {
	util.GetLogger().Warn("Attempting to move connections")
	for connection := range *connections {
		util.GetLogger().Info("Moving: ", connection)
		// TODO Get connections redirected
	}
}
