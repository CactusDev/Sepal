# Sepal Reference

### Introduction
Sepal is a piece of software who's purpose is to broadcast events.

### Clients
 - Python: [Rose](https://github.com/cactusbot/rose)
 - Typescript: [Dandelion](https://github.com/cactusbot/dandelion)
 - Golang: [Papyrus](https://github.com/cactusbot/papyrus)

### Protocol
Sepal uses a format simalar to JSON-API. We plan to make it the same format later on. To connect, create a normal Websocket connection to `sepal.cactusdev.potato`. No custom headers need to be passed.

### Packets
There's four packet types. These are: `auth`, `list`, `aloha`, and `event`. They're sent over the socket as normal JSON encoded strings.

##### Auth Packet
This is the only packet the client should ever send. If you send another packet, it will be ignored. The user should send this packet when they get the `aloha` packet. It should look similar the following:
`{"type": "auth", "channel": "Innectic", "scopes": ["command:list", "command:create", "command:remove"]}`
The only thing you should change, is the channel, and the scopes. Channel is the name of the channel that you want to connect to that has CactusBot in the chat.
##### Scopes list:
`command:list`

`command:create`

`command:remove`

`quote:list`

`quote:create`

`quote:remove`

#### List
The list packet is only sent to you if you subscribe to the `command:list` or the `quote:list` scope. Within this packet, it shows every entry (command or quote).

Command & Quote list example:

```json
{
    "command:list":{
        "type":"command:list",
        "channel":"innectic",
        "list":{
            "potato":{
                "ID":"8b88c725-c59f-48b3-81f7-6e4ec6798003",
                "Command":"potato",
                "Response":"salad",
                "Channel":"innectic"
            }
        }
    },
    "quote:list":{
        "type":"quote:list",
        "channel":"innectic",
        "list":{
            "1":{
                "ID":1,
                "Quote":"*silence* - Stanley",
                "Channel":"innectic"
            },
            "2":{
                "ID":2,
                "Quote":":fish :fish :fish :fish -Matt",
                "Channel":"innectic"
            }
        }
    },
    "type":"list"
}
```


#### Event
An `event` packet contains the adding of a command, or a quote. Quote example:

`{"type":"event","scope":"quote:create","id":2,"response":"*silence* - Stanley","channel":"innectic"}`\

Command Example:

`{"type":"event","scope":"command:create","command":"potato","response":"salad","id":"fd868db2-2d90-42b7-b12f-1b331d81460d","channel":"Innectic"}`
