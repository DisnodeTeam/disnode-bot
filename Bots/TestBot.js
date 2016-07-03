var DisnodeBot = require("../DisnodeLib/Disnode.js"); //defines DisnodeBot
var testBot = new DisnodeBot(""); //Defines the testBot in the "" is where your discord bot oauth token would go
var botCommands = {}; //defines an object for local bot commands
testBot.on("Bot_Ready", function(){ //event emitter called when the bot is ready for init
    console.log('[TEST_BOT - BotReady] Bot Ready.');
    testBot.enableVoiceManager({voiceEvents:true});
    testBot.enableAudioPlayer({path: './Audio/', maxVolume:2.0});
    testBot.enableConfigManager({path:"./TestBotConfig.json"});
    testBot.config.manager.loadConfig(OnLoad);
});
var OnLoad = function(){
  testBot.enableCleverManager({channelid:"185614233168248833"});
  testBot.enableWolfram({key:"a"});
  testBot.enableYoutubeManager();
  testBot.enableCommandHandler({prefix: "#"});
  bot.command.handler.AddContext(botCommands,"testbot");
  testBot.command.handler.LoadList(testBot.config.manager.config.commands)
}

testBot.on("Bot_Init", function () {
  console.log("[TEST_BOT - BotReady] Bot Init.");
});


testBot.on("Bot_RawMessage", function(msg){
  console.log("[TEST_BOT - RawMessage] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  testBot.startBot();
};

botCommands.cmdTestContext = function(ParsedMsg){
  testBot.bot.sendMessage(ParsedMsg.msg.channel, "THIS WAS CALLED IN THIS CONTEXT " );
}
