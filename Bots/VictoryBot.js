var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");

var bot = new Discord.Client();
var token = "";
var name = "";
var avatar = "";
var commandPrefix = "!";
var VoiceManager= new Disnode.VoiceManager(bot);
var Commands = [
  {cmd:"test", run: cmdTest},
  {cmd:"joinVoice", run: joinVoice},
  {cmd: "follow", run: cmdFollow},
  {cmd: "unfollow", run: cmdUnFollow},
  {cmd: "joinme", run: cmdJoinMe},
];

var CommandHandler = new Disnode.CommandHandler(commandPrefix, Commands);



function StartBot(){
  bot.loginWithToken(token);
  bot.on("ready", OnBotReady);
  bot.on("message", OnBotMessage);
  bot.on('voiceJoin', OnVoiceJoin);
  bot.on('voiceLeave', OnVoiceLeave);

}

var OnBotReady = function(){
  console.log("[VictoryBot] Ready!");
}

var OnBotMessage = function(msg){
  console.log("[VictoryBot] Recieved Msg!");
  CommandHandler.RunMessage(msg);
}

var OnVoiceJoin = function(channel, user){
  VoiceManager.OnVoiceJoin(channel, user);
}

var OnVoiceLeave = function(channel, user){
  VoiceManager.OnVoiceLeave(channel, user);
}

function cmdFollow(msg){
  VoiceManager.Follow(msg.author.username);
  bot.sendMessage(msg.channel, "``` Following: "+msg.author.username+".```");
  cmdJoinMe(msg);
}

function cmdJoinMe(msg){
  for (var i = 0; i < msg.channel.server.members.length; i++) {
    var user = msg.channel.server.members[i];
    if(user.username == msg.author.username){
      if(user.voiceChannel){
        VoiceManager.JoinChannelWithId(user.voiceChannel);
      }
    }
  }
}

function cmdUnFollow(msg){
VoiceManager.UnFollow(msg.client.user.username);
bot.sendMessage(msg.channel, "``` Stopped Following: "+msg.author.username+".```");
}
function cmdTest(){
  console.log("TEST COMMAND");
}

function joinVoice(msg, parms){
  Disnode.CommonCommands.JoinVoice(VoiceManager, msg,parms,function(){
    console.log("JOINED!");
  });
}



StartBot();
