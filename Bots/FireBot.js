var DiscordBot = require("../DisnodeLib/DiscordBot.js");
var bot = new DiscordBot("");

bot.on("Bot_Ready", function(){
    console.log('[FB - BotReady] Bot Ready.');
    bot.enableVoiceManager({voiceEvents:true});
    bot.enableAudioPlayer({path: './Audio/', maxVolume:2.0});
    bot.enableCleverManager({});

    var cmdList = [
      {cmd: "dc",run: cmdDC,desc: "Diconnects bot",usage:"#"+"dc"},
    ];

    bot.enableCommandHandler({prefix: "#",list:cmdList});
    bot.addDefaultCommands();
});

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
