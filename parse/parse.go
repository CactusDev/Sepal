package parsing

import (
    "encoding/json"
)

func isJson(data []byte) bool {
    var message map[string]interface{}
    return json.Unmarshal(data, &message) == nil
}

func Parse(data []byte) (*methodPacket, error) {
    var err error

    if isJson(data) {
        var msg = new(methodPacket)

        err = json.Unmarshal(data, &msg)
        return msg, err
    }
    return nil, err
}
