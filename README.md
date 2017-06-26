
<p align="center"><img src="http://i.imgur.com/QFVRJPU.png"></p>
<h1 align="center">Disnode</h1>

Software Powering Communities

[![Discord](https://discordapp.com/api/guilds/236338097955143680/widget.png)](https://discord.gg/AbZhCen)

### [Offical Docs](https://disnode.readme.io/docs)

### Getting Started:

#### Installing
`npm install disnode --save && npm install`
##### Bot Config
Make a file called Bot-Config.json in `/bots` and fill it in with your bots information
```json
  {
  "key": "Bot Token Here",
     "prefix" : "Bot Prefix",
  "db": {
     "use_db" : false,
     "auth" : false,
     "user" : "",
     "pass" : "",
     "host" : "",
     "port" : "",
     "DBName" : ""
        }
  }
  ```
##### Starting Up
 `node Run.js` or [pm2](http://pm2.keymetrics.io/) can run your bot.
