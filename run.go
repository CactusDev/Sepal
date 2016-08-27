package main

import (
	"github.com/cactusbot/sepal/client/ratelimit"
	"github.com/cactusbot/sepal/database"
	"github.com/cactusbot/sepal/util"
	"github.com/cactusbot/sepal/websocket"
)

var log = util.InitLogger(true)

func main() {
	log.Info("Starting dispathcer...")
	go websocket.Dispatch()

	log.Info("Attempting to connect to the database...")
	go database.Connect()

	log.Info("Starting rate limiter...")
	go ratelimit.Reset()

	log.Info("Attempting to create a socket...")
	websocket.Listen()

}
