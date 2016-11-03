## Sepal

Sepal is an app that delivers real-time events to services.

### Packets

#### Subscribe Packet
Subscribe packets are what the user sends to the server when they first connect.

```json
{
    "type": "subscribe",
    "channel": "temmie"
}
```
#### Event Packet
Event packets are sent by the server when something notable happens.

```json
{
    "type": "event",
    "event": "command",
    "channel": "temmie",
    "action": "created",
    "data": {
        "calls": 1,
        "channel": "temmie",
        "commandName": "potato",
        "response": "salad",
        "id": "756dd65b-e2ca-4e04-b309-c21ea1ee0477"
    }
}
```

### Error codes

 - 999: The packet is invalid or blank
 - 1000: Packet doesn't contain a type
 - 1001: Channel was not supplied
 - 1002: Channel is invalid
 - 1003: Packet type isn't valid
