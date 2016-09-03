package client

import (
	"strings"

	"github.com/cactusbot/sepal/util"
)

// BroadcastToScope - Broadcast data to clients in a scope.
func BroadcastToScope(scope string, channel string, data string) {
	for _, client := range Clients {
		if yes, _ := util.StringInSlice(scope, client.Scopes); yes {
			if strings.EqualFold(client.Channel, channel) {
				client.Connection.WriteMessage(1, []byte(data))
			}
		}
	}
}
