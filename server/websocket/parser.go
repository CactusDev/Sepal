package websocket

import (
    "encoding/json"
     log "github.com/Sirupsen/logrus"
)

type message struct {
    AlertType string `json:"type"`
    Message string `json:"message"`
    To string `json:"to"`
}

func Parse(data []byte) (*message, error) {
    var msg = new (message)

    err := json.Unmarshal(data, &msg)
    if err != nil {
        log.Error("Unable to parse data: ", data)
        log.Error(err)
    }
    return msg, err
}
