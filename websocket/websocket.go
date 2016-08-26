package websocket

import (
	"encoding/json"
	"net/http"

	"golang.org/x/net/http2"

	"github.com/cactusbot/sepal/client"
	"github.com/cactusbot/sepal/database"
	parser "github.com/cactusbot/sepal/parse"
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

// Dispatch - Dispatch a message
func Dispatch() {
	for {
		select {
		case command := <-database.CommandChannel:
			log.Info(command)
			client.BroadcastToScope("test", command)
		case quote := <-database.QuoteChannel:
			log.Info(quote)
		}
	}
}

// Listen listen for websocket connections
func Listen() {
	var server http.Server
	http2.VerboseLogs = true
	server.Addr = ":3000"

	http2.ConfigureServer(&server, nil)

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

			if messageType != 1 {
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
					var currentClient client.Client

					log.Info("Got: ", msg)
					if msg.Type == "auth" {
						// TODO: Auth checking
						events := []string{"test"}
						currentClient = client.Client{events, "", connection}
						client.AddClient(currentClient)
					} else if msg.Type == "subscribe" {
						currentClient.Subscribe(msg.Data)
					} else if msg.Type == "unsubscribe" {
						currentClient.Unsubscribe(msg.Data)
					} else {
						// TODO: Send an error packet
					}

				}
			}()
		}
	})

	log.Fatal(server.ListenAndServe())
	// log.Fatal(server.ListenAndServeTLS("cert.pem", "key.pem"))
}
