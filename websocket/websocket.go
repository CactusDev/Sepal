package websocket

import (
	parser ".././parse"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

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
					if msg.Data["event"] != "" {
						packet = map[string]string{
							"type": "info",
							"info": "Subscribed to event " + msg.Data["event"],
						}
						packetMsg, _ = json.Marshal(packet)
						sendMessage(connection, string(packetMsg))
					}
					log.Info("Got: ", msg)
				}
			}()
		}
	})

	http.ListenAndServe(":3000", nil)
}
