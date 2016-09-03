package main

import (
	"flag"
	"os"

	"github.com/cactusbot/sepal/client/ratelimit"
	"github.com/cactusbot/sepal/database"
	"github.com/cactusbot/sepal/util"
	"github.com/cactusbot/sepal/websocket"
)

func main() {
	debug := flag.Bool("debug", false, "Debug mode")
	flag.Parse()

	log := util.InitLogger(*debug)

	log.Info("Starting dispathcer...")
	go websocket.Dispatch()

	log.Info("Attempting to connect to the database...")
	go database.Connect()

	log.Info("Starting rate limiter...")
	go ratelimit.Reset()

	log.Info("Attempting to create a socket...")
	websocket.Listen(os.Getenv("PORT"))
}
