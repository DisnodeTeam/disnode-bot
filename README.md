# Disnode [Discord](https://discord.gg/0prrdN1joHCrVhdw)
Public effort in making Awesome Discord Bots
#Offical Docs:
[Disnode Docs](https://disnode.readme.io/docs)

#Installing:
`npm install disnode --save`

#Adding Managers:
Options is optional;

Included Managers:
```js
testBot.addManager({name:"NAME", options:{}});
```
SelfMade
```js
testBot.addManager({name:"NAME",path:"./Manager.js", options:{}});
```
NPM (put the npm package name into path)
```js
testBot.addManager({name:"NAME",path:"disnode-manager", options:{}});
```

#Example Bot
```js
var DisnodeBot = require("../src/Disnode.js");
var testBot = new DisnodeBot("BOT_OAUTH_HERE", "./TestBotConfig.json"); /
testBot.on("Bot_Ready", function(){
    console.log('[TEST_BOT - BotReady] Bot Ready.');
    testBot.loadConfig(OnLoad);
});
var OnLoad = function(){
  testBot.addManager({name:"CommandHandler", options:{prefix: "!"}});
  testBot.addManager({name:"MusicManager", options:{voiceEvents: true, maxVolume:2.0}});
  testBot.addManager({name:"HelpManager", options:{}});
  testBot.addManager({name:"CleverManager", options:{channelid:"ID of a channel for cleverbot to use"}});
  testBot.addManager({name:"Wolfram", options:{key:"KEY_HERE"}});
  testBot.addManager({name:"DiscordManager", options:{}});
  testBot.addManager({name:"SayManager", options:{}});

  testBot.CommandHandler.AddContext(botCommands,"TestBot");
  testBot.CommandHandler.LoadList(testBot.config.commands);
}

testBot.on("Bot_Init", function () { //event emitter that is called before bot ready
  console.log("[TEST_BOT - BotReady] Bot Init.");
});


testBot.on("Bot_RawMessage", function(msg){ //event emitter called when the bot obtains a message
  console.log("[TEST_BOT - RawMessage] |" + msg.author.name + " :: " + msg.content);
});
//export a function that starts the bot. this allows you to have a script that launches more than one Disnode Bot
exports.Start = function () {
  testBot.startBot();
};

````
