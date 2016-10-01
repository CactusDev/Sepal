package websocket

import (
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/net/http2"

	"github.com/cactusdev/sepal/client"
	"github.com/cactusdev/sepal/client/ratelimit"
	"github.com/cactusdev/sepal/database"
	parser "github.com/cactusdev/sepal/parse"
	"github.com/cactusdev/sepal/util"
	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	log = util.GetLogger()
)

type dataPacket struct {
	Type    string `json:"type"`
	Scope   string `json:"scope"`
	Channel string `json:"channel"`
	Data    interface{}
}

type commandPacket struct {
	Command  string `json:"command"`
	Response string `json:"response"`
	ID       string `json:"id"`
}

type quotePacket struct {
	ID       int    `json:"id"`
	Response string `json:"response"`
}

type friendPacket struct {
	Username string `json:"username"`
}

type listPacket struct {
	List interface{} `json:"list"`
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
					Command:  command.OldVal.Command,
					Response: command.OldVal.Response,
					ID:       command.OldVal.ID,
				}
				data := dataPacket{
					Type:    "event",
					Scope:   "command:remove",
					Channel: command.OldVal.Channel,
					Data:    packet,
				}

				marshalled, _ := json.Marshal(data)
				client.BroadcastToScope(data.Scope, data.Channel, string(marshalled))
			} else {
				packet = commandPacket{
					Command:  command.NewVal.Command,
					Response: command.NewVal.Response,
					ID:       command.NewVal.ID,
				}
				data := dataPacket{
					Type:    "event",
					Scope:   "command:create",
					Channel: command.NewVal.Channel,
					Data:    packet,
				}

				marshalled, _ := json.Marshal(packet)
				client.BroadcastToScope(data.Scope, data.Channel, string(marshalled))
			}
		case quote := <-database.QuoteChannel:
			var packet quotePacket

			if quote.OldVal != nil && quote.NewVal == nil {
				packet = quotePacket{
					ID:       quote.OldVal.ID,
					Response: quote.OldVal.Quote,
				}

				data := dataPacket{
					Type:    "event",
					Scope:   "quote:remove",
					Channel: quote.OldVal.Channel,
					Data:    packet,
				}

				marshalled, _ := json.Marshal(packet)
				client.BroadcastToScope(data.Scope, data.Channel, string(marshalled))
			} else {
				packet = quotePacket{
					ID:       quote.NewVal.ID,
					Response: quote.NewVal.Quote,
				}
				data := dataPacket{
					Type:    "event",
					Scope:   "quote:create",
					Channel: quote.NewVal.Channel,
					Data:    packet,
				}

				marshalled, _ := json.Marshal(packet)
				client.BroadcastToScope(data.Scope, data.Channel, string(marshalled))
			}

		case friend := <-database.FriendChannel:
			var packet friendPacket

			if friend.OldVal != nil && friend.NewVal == nil {
				packet = friendPacket{
					Username: friend.OldVal.Username,
				}

				data := dataPacket{
					Type:  "event",
					Scope: "friend:remove",
					Data:  packet,
				}

				marshalled, _ := json.Marshal(packet)
				client.BroadcastToScope(data.Scope, data.Channel, string(marshalled))
			} else {
				packet = friendPacket{
					Username: packet.Username,
				}
				data := dataPacket{
					Type:  "event",
					Scope: "friend:create",
					Data:  packet,
				}

				marshalled, _ := json.Marshal(packet)
				client.BroadcastToScope(data.Scope, data.Channel, string(marshalled))
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

		if err != nil {
			return
		}
		ip := connection.LocalAddr().String()

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
				break
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

						scopes := []string{}
						for _, scope := range msg.Scopes {
							scopes = append(scopes, strings.ToLower(scope))
						}

						currentClient = client.Client{
							Scopes:     scopes,
							IP:         ip,
							Connection: connection,
							Channel:    msg.Channel,
						}
						client.AddClient(&currentClient)

						packet := map[string]interface{}{
							"type": "list",
						}
						go func(currentClient *client.Client) {
							for scope := range currentClient.Scopes {
								if currentClient.Scopes[scope] == "command:list" {
									data, err := database.GetAllCommands(currentClient.Channel)
									if err != nil {
										log.Error(err)
										return
									}

									p := listPacket{
										Type:    "command:list",
										Channel: currentClient.Channel,
										List:    data,
									}
									packet[currentClient.Scopes[scope]] = p
								} else if currentClient.Scopes[scope] == "quote:list" {
									data, err := database.GetAllQuotes(currentClient.Channel)
									log.Info(data)
									if err != nil {
										log.Error(err)
										return
									}

									p := listPacket{
										Type:    "quote:list",
										Channel: currentClient.Channel,
										List:    data,
									}
									packet[currentClient.Scopes[scope]] = p
								}
							}
							marshalledPacket, err := json.Marshal(packet)
							if err != nil {
								log.Error(err)
							}
							sendMessage(currentClient.Connection, string(marshalledPacket))
							log.Info(string(marshalledPacket))
						}(&currentClient)

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
