var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");
var YoutubeMp3Downloader = require('youtube-mp3-downloader');

var bot = new Discord.Client();
var token = "MTcwMDIwODA3MTk4NjM4MDgw.CfXhsg.IE2sRoFeBGJnxLZn1QZjwyUgDTY";
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
  {cmd: "yt", run: cmdDownloadYT},
];

var CommandHandler = new Disnode.CommandHandler(commandPrefix, Commands);

var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "../libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
  "outputPath": "../audio/", // Where should the downloaded and encoded files be stored?
  "youtubeVideoQuality": "highest", // What video quality should be used?
  "queueParallelism": 2, // How many parallel downloads/encodes should be started?
  "progressTimeout": 1000 // How long should be the interval of the progress reports
});

var ytManager = new Disnode.YoutubeManager(YD);

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

function cmdDownloadYT(message) {
  var msg = message.content;

  var firstSpace =msg.indexOf(" ");
  var link = msg.substring(firstSpace + 1, msg.indexOf(" ", firstSpace + 1));
  var file = msg.substring(msg.indexOf(" ",msg.indexOf(link)) + 1,msg.length);

  var progressMessage;



  bot.sendMessage(message.channel, "``` Video Code: "+link+" Command Name: "+file+"```" );
  bot.sendMessage(message.channel, "``` Downloading... ```", function(err, sent) {
    progressMessage = sent;
    console.log(err);
  });

  ytManager.SetOnFinished(function(data){
    bot.updateMessage(progressMessage, "``` Finished. Use '!play "+file+"'```");
  });
  ytManager.SetOnError(function(error){
    bot.updateMessage(progressMessage, error);
  });
  ytManager.SetOnProgess(function(progress){
    console.log(progress.progress.percentage);
    if(progress.progress.percentage != 100){
      var percent = Math.round(progress.progress.percentage);
      bot.updateMessage(progressMessage, "```Downloading..."+percent + "%```");
    }
  });
  ytManager.Download(link, file);
}



StartBot();
