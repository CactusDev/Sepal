package database

import (
	"fmt"

	"github.com/cactusbot/sepal/util"
	rethink "gopkg.in/dancannon/gorethink.v2"
)

// CommandChannel - Channel for sending command changes
var CommandChannel = make(chan string)

// QuoteChannel - Channel for sending quote changes
var QuoteChannel = make(chan string)

// Connect - Connect to the database.
func Connect() {
	session, err := rethink.Connect(rethink.ConnectOpts{
		Address:  "localhost:28015",
		Database: "api",
	})

	if err != nil {
		util.GetLogger().Fatal("Unable to connect to database.")
	}

	go WatchCommands(session)
	// WatchQuotes(session)
}

// WatchCommands - Watch the commands table, and dispatch changes.
func WatchCommands(session *rethink.Session) {
	table, err := rethink.Table("commands").Changes().Run(session)
	var value interface{}
	if err != nil {
		return
	}

	for table.Next(&value) {
		CommandChannel <- "newCommand"
		util.GetLogger().Info(fmt.Sprint(value))
	}
}

// WatchQuotes - Watch the quotes table, and dispatch changes.
func WatchQuotes(session *rethink.Session) {
	table, err := rethink.Table("quotes").Changes().Run(session)
	var value interface{}
	if err != nil {
		return
	}

	for table.Next(&value) {
		util.GetLogger().Info(value)
	}
}
