package websocket

import (
	"encoding/json"
	"net/http"

	parser "github.com/cactusbot/sepal/parse"
	"github.com/cactusbot/sepal/user"
	"github.com/cactusbot/sepal/util"
	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	log = util.GetLogger()
)

func sendMessage(connection *websocket.Conn, message string) {
	connection.WriteMessage(1, []byte(message))
}

// Listen listen for websocket connections
func Listen() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		connection, err := upgrader.Upgrade(w, r, nil)

		packet := map[string]string{
			"type": "sup",
		}
		packetMsg, _ := json.Marshal(packet)

		sendMessage(connection, string(packetMsg))

		if err != nil {
			log.Error(err)
			return
		}

		for {
			messageType, message, err := connection.ReadMessage()

			log.Info(messageType)
			if err != nil {
				log.Error(err)
				return
			}

			go func() {
				msg, err := parser.Parse([]byte(message))
				if err != nil {
					log.Error(err)
					return
				}

				if msg != nil {
					user.RemoveUser("potato")
					if msg.Type == "auth" {
						// TODO: Auth checking
					} else if msg.Type == "subscribe" {
						// TODO: Sub to events
					} else if msg.Type == "unsubscribe" {
						// TODO: Unsub from events
					} else {
						// TODO: Send an error packet
					}

					log.Info("Got: ", msg)
				}
			}()
		}
	})

	http.ListenAndServe(":3000", nil)
}
