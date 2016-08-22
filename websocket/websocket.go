package websocket

import (
    "github.com/gorilla/websocket"
    "net/http"
    "encoding/json"
    log "github.com/Sirupsen/logrus"
    parser ".././parse"
)

var upgrader = websocket.Upgrader {
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
}

func sendMessage(connection *websocket.Conn, message string) {
    connection.WriteMessage(1, []byte(message))
}

func Listen(port string) {
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
        }
    })

    http.ListenAndServe(port, nil)
}
