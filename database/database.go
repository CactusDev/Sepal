package database

import (
	"strconv"
	"strings"

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
	defer session.Close()

	if err != nil {
		util.GetLogger().Fatal("Unable to connect to database.")
	}

	go WatchCommands(session)
	WatchQuotes(session)
}

// WatchCommands - Watch the commands table, and dispatch changes.
func WatchCommands(session *rethink.Session) {
	commands, err := rethink.Table("commands").Changes().Run(session)
	defer commands.Close()

	if err != nil {
		util.GetLogger().Error(err)
	}

	var command *Command
	for commands.Next(&command) {
		CommandChannel <- *command
	}
}

// WatchQuotes - Watch the quotes table, and dispatch changes.
func WatchQuotes(session *rethink.Session) {
	quotes, err := rethink.Table("quotes").Changes().Run(session)
	defer quotes.Close()

	if err != nil {
		util.GetLogger().Error(err)
	}

	var quote *Quote
	for quotes.Next(&quote) {
		QuoteChannel <- *quote
	}
}

// GetAllQuotes - Get all the quotes, and return them in an interface.
func GetAllQuotes(channel string) (interface{}, error) {
	session, err := rethink.Connect(rethink.ConnectOpts{
		Address:  "localhost:28015",
		Database: "api",
	})
	defer session.Close()
	if err != nil {
		return nil, err
	}

	quotes, err := rethink.Table("quotes").Run(session)
	defer quotes.Close()
	if err != nil {
		return nil, err
	}

	allQuotes := map[string]interface{}{}

	var quote *QuoteResult
	for quotes.Next(&quote) {
		if strings.EqualFold(quote.Channel, channel) {
			allQuotes[strconv.Itoa(quote.ID)] = *quote
		}
	}

	return allQuotes, nil
}

// GetAllCommands - Get all the quotes, and return them in an interface.
func GetAllCommands(channel string) (interface{}, error) {
	session, err := rethink.Connect(rethink.ConnectOpts{
		Address:  "localhost:28015",
		Database: "api",
	})
	defer session.Close()
	if err != nil {
		return nil, err
	}

	commands, err := rethink.Table("commands").Run(session)
	defer commands.Close()
	if err != nil {
		return nil, err
	}

	allCommands := map[string]interface{}{}

	var command *CommandResult
	for commands.Next(&command) {
		if strings.EqualFold(command.Channel, channel) {
			allCommands[command.Command] = *command
		}
	}

	return allCommands, nil
}
