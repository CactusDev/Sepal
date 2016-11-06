# Active Users Algorithm Specification

Simple algorithm for detecting users that are inactive in a given channel. You can get a list of active users in a channel by sending a packet: `{"type": "activeList", "channel": "temmie"}`. This will send a packet back that looks like the following:

```json
{
    "type": "activeList",
    "channel": "temmie",
    "users": {
        "cb65919a-8628-4427-b3b2-c9a5dea1d992": 1,
        "faa45d7f-8c4d-42e2-a445-97ecaf0c871d": 20,
        "c185385a-2014-4c4b-af93-ef3991cbdf84": 2
    }
}
```

The `users` dictionary is formatted like: `username: activeTime`
`activeTime` increments by one every 10 minutes if the user is still determined to be active.

### Incoming Packets

`Join` packet

```json
{
    "type": "join",
    "username": "innectic",
    "service": "beam"
}
```

### Algorithm Design

[CactusBot - User join event] -> send join packet to sepal -> Sepal finds the uuid of the user -> Add uuid to list of users -> Determine activity every `x` mintutes based on last message and current time. If the user is determined to be active, increment their `activeTime`. If they're determined to be inactive, remove them from the activeUsers list.
