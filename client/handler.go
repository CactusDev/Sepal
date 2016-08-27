package client

import "github.com/cactusbot/sepal/util"

// BroadcastToScope - Broadcast data to clients in a scope.
func BroadcastToScope(scope string, channel string, data string) {
	for _, client := range Clients {
		inScope, _ := util.StringInSlice(scope, client.Scopes)

		if inScope {
			if client.Channel == channel {
				client.Connection.WriteMessage(1, []byte(data))
			}
		}
	}
}
