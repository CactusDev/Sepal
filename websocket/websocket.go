package websocket

import (
    "github.com/gorilla/websocket"
    "net/http"
    log "github.com/Sirupsen/logrus"
    // "encoding/json"
)

var upgrader = websocket.Upgrader {
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
}

func Listen(port string) {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        connection, err := upgrader.Upgrade(w, r, nil)

        if err != nil {
            log.Error(err)
            return
        }

        for {
            messageType, message, err := connection.ReadMessage()
            if err != nil {
                log.Error(err)
                return
            }

            if string(message) == "hi" {
                err = connection.WriteMessage(messageType, []byte("HI!"))
                if err != nil {
                    log.Error(err)
                    return
                }
            } else {
                connection.Close()
                log.Info(string(message))
                return
            }
        }
    })

    http.ListenAndServe(port, nil)
}
