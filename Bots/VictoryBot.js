var DiscordBot = require("../DisnodeLib/DiscordBot.js");
var bot = new DiscordBot("");
var botCommands = {};
bot.on("Bot_Ready", function(){
    console.log('[VB - BotReady] Bot Ready.');


    var cmdList = [

    ];


    bot.enableVoiceManager({voiceEvents:true});
    bot.enableAudioPlayer({path: './Audio/'});

    bot.enableBotCommunication({});
    bot.enableConfigManager({path:"./VictoryBotConfig.json"});
    bot.config.manager.loadConfig(OnLoad);


});
var OnLoad = function(){
  console.log("CONFIG LOADED!");
  bot.enableCleverManager({channelid:"185614233168248833"});
  bot.enableWolfram({key:"API_KEY_HERE"});

  bot.enableCommandHandler({prefix: "!",list:bot.config.manager.config.commands});
  bot.command.handler.AddContext(botCommands,"victorybot");
  bot.addDefaultCommands();
}
bot.on("Bot_Init", function () {
  console.log("[VB - BotReady] Bot Init.");
});

bot.on("Bot_RawMessage", function(msg){
  console.log("[VB - BotReady] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  bot.startBot();

};
var test = function(msg)
{
  bot.bot.sendMessage(msg.msg.channel, "TEST!!!!!!");
}
var EditConfig = function(msg){
  bot.config.manager.config[msg.params[0]] = msg.params[1];
  bot.config.manager.saveConfig();
}
var PrintCommand = function(msg){
    bot.config.manager.loadConfig();
    bot.bot.sendMessage(msg.msg.channel, JSON.stringify(bot.config.manager.config));
}

botCommands.cmdTestContext = function(msg){
  bot.bot.sendMessage(msg.msg.channel, "Context Works!");
}
