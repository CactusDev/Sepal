package parsing

import (
	"encoding/json"

	"github.com/cactusdev/sepal/util"
)

// Packet a general packet for everything
type Packet struct {
	Type    string   `json:"type"`
	Scopes  []string `json:"scopes"`
	Channel string   `json:"channel"`
}

// Parse parse the given data into a packet, and return that and an error
func Parse(data []byte) (*Packet, error) {
	var err error

	if util.IsJSON(data) {
		var message = new(Packet)
		err = json.Unmarshal(data, &message)

		return message, err
	}
	return nil, err
}
