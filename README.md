# Sepal

## What is this?

This is our system for sending alerts to all our services to provide real-time updates to information displayed.


## Setup:

Sepal is the backend service that sends packets when the database updates
so the bot can update dynamic values, like the spam config.

## Pre-Install

Sepal requires [NodeJS](nodejs.org) (6 or higher), [RethinkDB](rethinkdb.com), and [Redis](redis.io)


```
git clone https://github.com/CactusDev/Sepal
cd Sepal
npm i -g typescript
npm i
```

Next, open `src/configs/default.ts` and fill out all the fields.


## Licence

MIT
