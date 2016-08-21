package main

import (
    log "github.com/Sirupsen/logrus"
    "./websocket"
)

var port = ":3000"

func main() {
    log.Formatter = new(logrus.TextFormatter)
    log.Level = logrus.DebugLevel
    
    log.Info("Attempting to bind socket.")

    websocket.Listen(port)
}
