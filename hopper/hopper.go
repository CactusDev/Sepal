package hopper

import (
	"encoding/json"
	"net/http"

	"github.com/cactusbot/sepal/client"
	"github.com/cactusbot/sepal/database"
	"github.com/cactusbot/sepal/util"
	"golang.org/x/net/websocket"
)

var log = util.GetLogger()

type commandPacket struct {
	Command  string `json:"command"`
	Response string `json:"response"`
	ID       string `json:"id"`
	Channel  string `json:"channel"`
}

type quotePacket struct {
	ID       int    `json:"id"`
	Response string `json:"response"`
	Channel  string `json:"channel"`
}

// Listen - Listen for ws connections
func Listen() {
	http.Handle("/", websocket.Handler(handleConn))
	log.Fatal(http.ListenAndServe(":3000", nil))
}

// DispatchChanges - Send changes to all clients
func DispatchChanges() {
	for {
		select {
		case command := <-database.CommandChannel:
			var packet commandPacket

			packet = commandPacket{
				Command:  command.NewVal.Command,
				Response: command.NewVal.Response,
				ID:       command.NewVal.ID,
				Channel:  command.NewVal.Channel,
			}

			log.Info("Command: ", packet)
			data, _ := json.Marshal(packet)
			client.BroadcastToScope("command:create", packet.Channel, string(data))
		case quote := <-database.QuoteChannel:
			var packet quotePacket

			packet = quotePacket{
				ID:       quote.NewVal.ID,
				Response: quote.NewVal.Quote,
				Channel:  quote.NewVal.Channel,
			}

			data, _ := json.Marshal(packet)
			client.BroadcastToScope("quote:create", packet.Channel, string(data))
		}
	}
}

func handleConn(ws *websocket.Conn) {

}
