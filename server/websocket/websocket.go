package websocket

import (
    "github.com/gorilla/websocket"
    "net/http"
    log "github.com/Sirupsen/logrus"
    "encoding/json"
)

type message struct {
    AlertType string `json:"type"`
    Message string `json:"message"`
    To string `json:"to"`
}

var upgrader = websocket.Upgrader {
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
}

func parse(data []byte) (*message, error) {
    var msg = new (message)

    err := json.Unmarshal(data, &msg)
    if err != nil {
        log.Error("Unable to parse data: ", data)
        log.Error(err)
    }
    return msg, err
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

            msg, err := parse([]byte(message))
            if err != nil {
                log.Error(err)
                return
            }
            log.Info(msg)
        }
    })

    http.ListenAndServe(port, nil)
}
