var DiscordBot = require("../DisnodeLib/DiscordBot.js");
var bot = new DiscordBot("a");

bot.on("Bot_Ready", function(){
    console.log('[FB - BotReady] Bot Ready.');
    bot.enableVoiceManager({voiceEvents:true});
    bot.enableAudioPlayer({path: './Audio/', maxVolume:2.0});
    bot.enableConfigManager({path:"./FireBotConfig.json"});
    bot.config.manager.loadConfig(OnLoad);
});
var OnLoad = function(){
  bot.enableCleverManager({channelid:"185614233168248833"});
  bot.enableWolfram({key:"a"});
  bot.enableYoutubeManager();
  bot.enableCommandHandler({prefix: "#",list:bot.config.manager.config.commands});
  bot.addDefaultCommands();
}

bot.on("Bot_Init", function () {
  console.log("[FB - BotReady] Bot Init.");
});



bot.on("Bot_RawMessage", function(msg){
  console.log("[FB - RawMessage] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  bot.startBot();

};
var cmdDC = function(msg){
  if (msg.msg.author.name =="FireGamer3"){
		bot.bot.sendMessage(msg.msg.channel, "``` Disconnecting ```");
		bot.bot.logout();
	}else {
		bot.bot.sendMessage(msg.channel, "I can't let you do that! " + msg.author);
	}
}
