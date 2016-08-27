package database

import (
	"github.com/cactusbot/sepal/util"
	rethink "gopkg.in/dancannon/gorethink.v2"
)

// CommandResult - Result from a rethink call on the commands table
type CommandResult struct {
	ID       string `gorethink:"id"`
	Command  string `gorethink:"command"`
	Response string `gorethink:"response"`
	Channel  string `gorethink:"channelName"`
}

// Command - Command
type Command struct {
	NewVal *CommandResult `gorethink:"new_val"`
	OldVal *CommandResult `gorethink:"old_val"`
}

// QuoteResult - Result from a rethink call on the quotes table
type QuoteResult struct {
	ID      int    `gorethink:"quoteId"`
	Quote   string `gorethink:"quote"`
	Channel string `gorethink:"channelName"`
}

// Quote - Quote
type Quote struct {
	NewVal *QuoteResult `gorethink:"new_val"`
	OldVal *QuoteResult `gorethink:"old_val"`
}

// CommandChannel - Channel for sending command changes
var CommandChannel = make(chan Command)

// QuoteChannel - Channel for sending quote changes
var QuoteChannel = make(chan Quote)

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
	WatchQuotes(session)
}

// WatchCommands - Watch the commands table, and dispatch changes.
func WatchCommands(session *rethink.Session) {
	table, err := rethink.Table("commands").Changes().Run(session)

	if err != nil {
		util.GetLogger().Error(err)
	}

	var command Command
	for table.Next(&command) {
		CommandChannel <- command
	}
}

// WatchQuotes - Watch the quotes table, and dispatch changes.
func WatchQuotes(session *rethink.Session) {
	table, err := rethink.Table("quotes").Changes().Run(session)

	if err != nil {
		util.GetLogger().Error(err)
	}

	var quote Quote
	for table.Next(&quote) {
		QuoteChannel <- quote
	}
}
