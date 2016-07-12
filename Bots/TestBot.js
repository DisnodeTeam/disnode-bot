var DisnodeBot = require("../DisnodeLib/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM

var testBot = new DisnodeBot("", "./TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go
var botCommands = {}; //defines an object for local bot commands
testBot.on("Bot_Ready", function(){ //event emitter called when the bot is ready for init
    console.log('[TEST_BOT - BotReady] Bot Ready.');
    //loads config from previous given path and executes 'OnLoad' after loading the config
    testBot.loadConfig(OnLoad);
});
var OnLoad = function(){
  //enables the command handler which allows for recognizing commands from regular messages takes and object with the command prefix
  testBot.addManager({name:"CommandHandler", options:{prefix: "!"}});
  //enables voice manager required for audio player
  testBot.addManager({name: "VoiceManager", options:{voiceEvents:true}});
  //enables audio player with an object that passes a 'path(String)' and 'maxVolume(float)'
  testBot.addManager({name:"AudioPlayer", options:{path: './Audio/', maxVolume:2.0}});
  //enables config manager which is a required library for loading commands

  //cleverbot functionality passed is a object containing the channel that cleverbot will speak in
  testBot.addManager({name:"CleverManager", options:{channelid:"185614233168248833"}});
  //enables wolfram-alpha functionality inside "" is your APP ID from WolframAPI
  testBot.addManager({name:"Wolfram", options:{key:""}});
  //enables youtube manager which allows for taking youtube videos and converts them to mp3
  testBot.addManager({name:"YoutubeManager", options:{}});
  //DiscordManager allows for simple commands that change your bot's details
  testBot.addManager({name:"DiscordManager", options:{}});
  testBot.addManager({name:"SayManager", options:{}});

  testBot.postLoad(); // finish commandhandler loading

  //setting a command context for command written in the bot. passes in an object that contains local command functions
  testBot.CommandHandler.AddContext(botCommands,"testbot");

  //loads the command list pulled from the config manager
  testBot.CommandHandler.LoadList(testBot.config.commands)

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
//this adds a function to the botCommands to be referenced in local context when creating commands
botCommands.cmdDebug = function(ParsedMsg){
  //console.log(ParsedMsg.msg.channel.server.rolesOfUser(ParsedMsg.msg.author));
  //testBot.bot.sendMessage(ParsedMsg.msg.channel, ParsedMsg.msg.server);
}
