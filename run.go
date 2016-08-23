package main

import (
	"github.com/cactusbot/sepal/util"
	"github.com/cactusbot/sepal/websocket"
)

var log = util.InitLogger(true)

func main() {
	log.Info("Attempting to bind socket.")
	websocket.Listen()
}
