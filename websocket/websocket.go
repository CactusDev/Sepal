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

	Close = make(chan bool)
)

type commandPacket struct {
	Scope    string `json:"scope"`
	Command  string `json:"command"`
	Response string `json:"response"`
	ID       string `json:"id"`
	Channel  string `json:"channel"`
}

type quotePacket struct {
	Scope    string `json:"scope"`
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

			if command.NewVal == nil && command.OldVal != nil {
				packet = commandPacket{
					Scope:    "command:remove",
					Command:  command.OldVal.Command,
					Response: command.OldVal.Response,
					ID:       command.OldVal.ID,
					Channel:  command.OldVal.Channel,
				}

				data, _ := json.Marshal(packet)
				client.BroadcastToScope("command:remove", packet.Channel, string(data))
			} else {
				packet = commandPacket{
					Scope:    "command:create",
					Command:  command.NewVal.Command,
					Response: command.NewVal.Response,
					ID:       command.NewVal.ID,
					Channel:  command.NewVal.Channel,
				}

				data, _ := json.Marshal(packet)
				client.BroadcastToScope("command:create", packet.Channel, string(data))
			}
		case quote := <-database.QuoteChannel:
			var packet quotePacket

			if quote.OldVal != nil && quote.NewVal == nil {
				packet = quotePacket{
					Scope:    "quote:remove",
					ID:       quote.OldVal.ID,
					Response: quote.OldVal.Quote,
					Channel:  quote.OldVal.Channel,
				}

				data, _ := json.Marshal(packet)
				client.BroadcastToScope("quote:remove", packet.Channel, string(data))
			} else {
				packet = quotePacket{
					Scope:    "quote:create",
					ID:       quote.NewVal.ID,
					Response: quote.NewVal.Quote,
					Channel:  quote.NewVal.Channel,
				}

				data, _ := json.Marshal(packet)
				client.BroadcastToScope("quote:create", packet.Channel, string(data))
			}
		}
	}
}

// Listen listen for websocket connections
func Listen(port string) {
	var server http.Server
	http2.VerboseLogs = true
	server.Addr = port

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
