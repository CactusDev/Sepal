package websocket

import (
	"encoding/json"
	"net/http"
	"strings"

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

type commandPacket struct {
	Command  string
	Response string
	ID       string
	Channel  string
}

func sendMessage(connection *websocket.Conn, message string) {
	connection.WriteMessage(1, []byte(message))
}

// Dispatch - Dispatch a message
func Dispatch() {
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

			data, _ := json.Marshal(packet)
			client.BroadcastToScope("command:create", string(data))
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

		log.Info("Got connection from IP: ", connection.LocalAddr().String())

		packet := map[string]string{
			"type": "aloha",
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

					log.Debug("Got a packet: ", msg)
					if msg.Type == "auth" {
						currentClient = client.Client{
							Scopes:     strings.Split(msg.Scopes, ","),
							IP:         connection.LocalAddr().String(),
							Connection: connection,
							Channel:    msg.Channel,
						}
						client.AddClient(&currentClient)

						log.Info("Client with the ip of: ",
							currentClient.IP, " subscribed to scopes: ",
							currentClient.Scopes, " of the channel: ",
							currentClient.Channel)
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
