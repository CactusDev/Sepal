package client

import "github.com/cactusbot/sepal/util"

// BroadcastToScope - Broadcast data to clients in a scope.
func BroadcastToScope(scope string, channel string, data string) {
	for _, client := range Clients {
		inScope, _ := util.StringInSlice(scope, client.Scopes)

		if inScope {
			util.GetLogger().Info("1")
			if client.Channel == channel {
				util.GetLogger().Info("2")
				client.Connection.WriteMessage(1, []byte(data))
			}
		}
	}
}
