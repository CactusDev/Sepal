package ratelimit

import (
	"time"

	"github.com/cactusbot/sepal/util"
)

// String: IP Int: requests left until limited
var clients = make(map[string]int)

const maxLimit = 5

// CanConnect - Check if a client can connect
func CanConnect(ip string) bool {
	_, ok := clients[ip]
	if ok {
		if clients[ip] > 0 {
			clients[ip]--
			return true
		}
		return false
	}
	clients[ip] = maxLimit
	return true
}

// Reduce - Reduce a clients remaining limit
func Reduce(ip string) {
	_, ok := clients[ip]
	if ok {
		if clients[ip] > 0 {
			clients[ip]--
		}
	}
}

// GetLimit - Get the remaining limit for a user
func GetLimit(ip string) int {
	return clients[ip]
}

// Reset - Loop to reset all client's limit every minute
func Reset() {
	for {
		util.GetLogger().Info("Resetting Limits")
		for client, limit := range clients {
			if limit != maxLimit {
				clients[client] = maxLimit
			}
		}

		time.Sleep(60000 * time.Millisecond)
	}
}
