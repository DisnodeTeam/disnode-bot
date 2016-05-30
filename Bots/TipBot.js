var DiscordBot = require("../DisnodeLib/DiscordBot.js");
var bot = new DiscordBot("");

bot.on("Bot_Ready", function(){
    console.log('[TB - BotReady] Bot Ready.');


    var cmdList = [
      {cmd:"helloworld",run: test,desc: "Hello World Command",usage:"!"+"helloworld"},
      {cmd: "help",run: test,desc: "List All Commands",usage:"$"+"help"},
    ];


    bot.enableVoiceManager({voiceEvents:true});
    bot.enableAudioPlayer({path: './Audio/'});


    bot.enableCommandHandler({prefix: "!",list:cmdList});
    bot.addDefaultCommands();
    bot.enableBotCommunication({});
    bot.enableCleverManager({});
});

bot.on("Bot_Init", function () {
  console.log("[TB - BotReady] Bot Init.");
});

bot.on("Bot_RawMessage", function(msg){
  console.log("[TB - BotReady] Recieved Raw msg: " + msg.content);
});

exports.Start = function () {
  bot.startBot();

};
var test = function(msg)
{
  bot.bot.sendMessage(msg.msg.channel, "TEST!!!!!!");
}
