package main

import (
	"./util"
	"./websocket"
)

var log = util.InitLogger(true)

func main() {
	log.Info("Attempting to bind socket.")
	websocket.Listen()
}
