package websocket

import (
    "github.com/gorilla/websocket"
    "net/http"
    log "github.com/Sirupsen/logrus"
    parser ".././parse"
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
            _, message, err := connection.ReadMessage()
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
                log.Info("Got: ", msg)
            }
        }
    })

    http.ListenAndServe(port, nil)
}
