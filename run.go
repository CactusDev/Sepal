package main

import (
    "github.com/Sirupsen/logrus"
    "./websocket"
)
var (
    port = ":3000"
    log = logrus.New()
)

func main() {
    log.Formatter = new(logrus.TextFormatter)
    log.Level = logrus.DebugLevel
    log.Info("Logger initialized.")

    log.Info("Attempting to bind socket.")
    websocket.Listen(port)
}
