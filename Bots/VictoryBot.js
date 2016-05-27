var DiscordBot = require("../DisnodeLib/DiscordBot.js");


var bot = new DiscordBot("");

exports.Start = function () {
  bot.startBot();
};

bot.on("BotReady", function(){
  console.log("[VB - BotReady] Bot Ready!");
});
