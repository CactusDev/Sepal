package client

import "github.com/cactusbot/sepal/util"

// BroadcastToScope - Broadcast data to clients in a scope.
func BroadcastToScope(scope string, data string) {
	for _, client := range Clients {
		yes, _ := util.StringInSlice(scope, client.Scopes)

		if yes {
			client.Connection.WriteMessage(1, []byte(data))
		}
	}
}
