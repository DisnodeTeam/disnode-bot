var DiscordBot = require("../DisnodeLib/DiscordBot.js");
var bot = new DiscordBot("");

bot.on("Bot_Ready", function(){
    console.log('[VB - BotReady] Bot Ready.');
    bot.enableAudioPlayer({path: './Audio/', maxVolume:2.0});

    var cmdList = [
      {cmd:"helloworld",run: test,desc: "Hello World Command",usage:"!"+"helloworld"},
      {cmd: "help",run: test,desc: "List All Commands",usage:"!"+"help"},
    ];

    bot.enableCommandHandler({prefix: "!",list:cmdList});
    bot.addDefaultCommands();

    bot.enableVoiceManager({voiceEvents:true});
});

bot.on("Bot_Init", function () {
  console.log("[VB - BotReady] Bot Init.");
});



bot.on("Bot_RawMessage", function(msg){
  console.log("[VB - RawMessage] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  bot.startBot();

};
var test = function(msg)
{
  bot.bot.sendMessage(msg.msg.channel, "TEST!!!!!!");
}
