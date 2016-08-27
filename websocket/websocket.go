package websocket

import (
	"encoding/json"
	"net/http"

	"golang.org/x/net/http2"

	"github.com/cactusbot/sepal/client"
	"github.com/cactusbot/sepal/client/ratelimit"
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

// Listen listen for websocket connections
func Listen() {
	var server http.Server
	http2.VerboseLogs = true
	server.Addr = ":3000"

	http2.ConfigureServer(&server, nil)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		connection, err := upgrader.Upgrade(w, r, nil)
		ip := connection.LocalAddr().String()

		if err != nil {
			return
		}

		if !ratelimit.CanConnect(ip) {
			go func(conn *websocket.Conn) {
				err = conn.Close()
				if err != nil {
					log.Error(err)
				}
			}(connection)
		}

		log.Info("Connection from IP: ", ip)
		log.Debug("Remaining Limit: ", ratelimit.GetLimit(ip))

		packet := map[string]string{
			"type": "aloha",
		}
		packetMsg, _ := json.Marshal(packet)

		sendMessage(connection, string(packetMsg))

		for {
			_, message, err := connection.ReadMessage()

			if err != nil {
				log.Info("Client with IP ", ip, " disconnected.")
				client.Clients[ip] = client.Client{}
			}

			if err != nil {
				log.Error(err)
			}

			go func() {
				msg, err := parser.Parse([]byte(message))
				if err != nil {
					log.Error(err)
				}

				if msg != nil {
					var currentClient client.Client

					log.Debug("Got a packet: ", msg)
					if msg.Type == "auth" {
						currentClient = client.Client{
							Scopes:     msg.Scopes,
							IP:         ip,
							Connection: connection,
							Channel:    msg.Channel,
						}
						client.AddClient(&currentClient)

						log.Info("Client with the ip of: ",
							currentClient.IP, " subscribed to scopes: ",
							currentClient.Scopes, " of the channel: ",
							currentClient.Channel)
					} else {
						packet = map[string]string{
							"type":  "error",
							"error": "Invalid packet type: " + msg.Type,
						}
						packetMsg, _ := json.Marshal(packet)

						sendMessage(connection, string(packetMsg))
					}

				}
			}()
		}
	})

	log.Fatal(server.ListenAndServe())
	// log.Fatal(server.ListenAndServeTLS("cert.pem", "key.pem"))
}
