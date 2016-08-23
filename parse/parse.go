package parsing

import (
	"encoding/json"
)

// Packet a general packet for everything
type Packet struct {
	Type   string            `json:"type"`
	Method string            `json:"method"`
	Data   map[string]string `json:"data"`
}

func isJSON(data []byte) bool {
	var message map[string]interface{}
	return json.Unmarshal(data, &message) == nil
}

// Parse parse the given data into a packet, and return that and an error
func Parse(data []byte) (*Packet, error) {
	var err error

	if isJSON(data) {
		var message = new(packet)
		err = json.Unmarshal(data, &message)

		return message, err
	}
	return nil, err
}
