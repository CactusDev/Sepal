package websocket

import (
	parser ".././parse"
	".././util"
	".././user"
	"encoding/json"
	"github.com/gorilla/websocket"
	"net/http"
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
			if messageType == -1 {
				return
			}
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
                    if msg.Type == "auth" {
                        // TODO: Auth checking
						user.AddUser(msg.Data["channel"], msg.Data["events"])
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
