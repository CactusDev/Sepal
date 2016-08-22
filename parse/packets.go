package parsing

type message struct {
    AlertType string `json:"type"`
    Message string `json:"message"`
    To string `json:"to"`
}

type authPacket struct {
    authKey string `json:"authkey"`
}

type methodPacket struct {
    Type string `json:"type"`
    Method string `json:"method"`
    Data map[string]string `json:"data"`
}
