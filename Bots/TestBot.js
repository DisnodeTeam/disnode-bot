var DiscordBot = require("../DisnodeLib/Disnode.js");
var bot = new DiscordBot("");
var botCommands = {};
bot.on("Bot_Ready", function(){
    console.log('[TEST_BOT - BotReady] Bot Ready.');
    bot.enableVoiceManager({voiceEvents:true});
    bot.enableAudioPlayer({path: './Audio/', maxVolume:2.0});
    bot.enableConfigManager({path:"./TestBotConfig.json"});
    bot.config.manager.loadConfig(OnLoad);
});
var OnLoad = function(){
  bot.enableCleverManager({channelid:"185614233168248833"});
  bot.enableWolfram({key:"a"});
  bot.enableYoutubeManager();
  bot.enableCommandHandler({prefix: "#"});
  bot.command.handler.AddContext(botCommands,"testbot");
  bot.command.handler.LoadList(bot.config.manager.config.commands)
}

bot.on("Bot_Init", function () {
  console.log("[TEST_BOT - BotReady] Bot Init.");
});


bot.on("Bot_RawMessage", function(msg){
  console.log("[TEST_BOT - RawMessage] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  bot.startBot();
};

botCommands.cmdTestContext = function(msg){
  bot.bot.sendMessage(msg.msg.channel, "THIS WAS CALLED IN THIS CONTEXT " );
}
