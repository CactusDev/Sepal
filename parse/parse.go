package parsing

import (
    "encoding/json"
)

type packet struct {
    Type string `json:"type"`
    Method string `json:"method"`
    Data map[string]string `json:"data"`
}

func isJson(data []byte) bool {
    var message map[string]interface{}
    return json.Unmarshal(data, &message) == nil
}

func Parse(data []byte) (*packet, error) {
    var err error

    if isJson(data) {
        var message = new(packet)
        err = json.Unmarshal(data, &message)

        return message, err
    }
    return nil, err
}
