package parsing

import (
    "encoding/json"
)

type message struct {
    AlertType string `json:"type"`
    Message string `json:"message"`
    To string `json:"to"`
}

type supPacket struct {
    authKey string `json:"authkey"`
}

func isJson(data []byte) bool {
    var message map[string]interface{}
    return json.Unmarshal(data, &message) == nil
}

func Parse(data []byte) (*message, error) {
    var err error

    if isJson(data) {
        var msg = new(message)

        err = json.Unmarshal(data, &msg)
        return msg, err
    }
    return nil, err
}
