var DiscordBot = require("../DisnodeLib/DiscordBot.js");

bot.on("Bot_Ready", function(){
    console.log('this happens asynchronously');
});

bot.on("Bot_Init", function () {
  console.log("[VB - BotReady] Bot Init.");
});



bot.on("Bot_RawMessage", function(msg){
  console.log("[VB - BotReady] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  bot.startBot();
  bot.enableAudioPlayer({path: './Bots/Audio/'});
};
