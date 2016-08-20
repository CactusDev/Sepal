package main

import (
    log "github.com/Sirupsen/logrus"
    "./websocket"
)

var port = ":3000"

func main() {
    log.Info("Attempting to bind socket.")

    websocket.Listen(port)
}
