var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");

var bot = new Discord.Client();
var token = "MTcwMDIwODA3MTk4NjM4MDgw.CfCntw.lUVQYtFJ-Jh2flq0-TXRUImjkZw";
var name = "";
var avatar = "";
var commandPrefix = "!";

var Commands = [
  {cmd:"test", run: cmdTest},
  {cmd:"joinVoice", run: joinVoice}
];

var CommandHandler = new Disnode.CommandHandler(commandPrefix, Commands);



function StartBot(){
  bot.loginWithToken(token);
  bot.on("ready", OnBotReady);
  bot.on("message", OnBotMessage);
}

var OnBotReady = function(){
  console.log("[VictoryBot] Ready!");
}

var OnBotMessage = function(msg){
  console.log("[VictoryBot] Recieved Msg!");
  CommandHandler.RunMessage(msg);
}

function cmdTest(){
  console.log("TEST COMMAND");
}

function joinVoice(msg){
  var Manger = new Disnode.VoiceManager(bot);
  Manger.JoinChannel("Base of Operations",msg.channel.server);
}
StartBot();
