var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");
var YoutubeMp3Downloader = require('youtube-mp3-downloader');
var wimageid = "img";
var wolframapi = require('wolfram-alpha').createClient("L7GEPP-V87J3T9WL6");
var fs = require('fs');
  var walk = require('walk')
var bot = new Discord.Client();
var token = "MTcwMDIwODA3MTk4NjM4MDgw.CfdSKQ.3mA4PpT_6OhNQTt4Pis0pWtlZvk";
var name = "";
var avatar = "";
var BotChat;
var commandPrefix = "!";
var VoiceManager= new Disnode.VoiceManager(bot);
var wolfram= new Disnode.Wolfram(wolframapi);
var Commands = [
  {cmd: "test",      run: cmdTest,       desc: "Test Command"},
  {cmd: "joinVoice", run: joinVoice,     desc: "Join Voice",            usage:commandPrefix+"joinVoice [Voice Channel Name ('-' instead of spaces.)]"},
  {cmd: "follow",    run: cmdFollow,     desc: "Follow User",           usage:commandPrefix+"follow"},
  {cmd: "unfollow",  run: cmdUnFollow,   desc: "UNFollow User",         usage:commandPrefix+"unfollow"},
  {cmd: "joinme",    run: cmdJoinMe,     desc: "Join Users Voice",      usage:commandPrefix+"joinme"},
  {cmd: "yt",        run: cmdDownloadYT, desc: "Download Youtube Clip", usage:commandPrefix+"yt [Video ID] [Command/Clip Name]"},
  {cmd: "help",      run: cmdHelp,       desc: "List All Commands",     usage:commandPrefix+"help"},
  {cmd: "play",      run: cmdPlay,       desc: "Play Audio Clip",       usage:commandPrefix+"play [Clip Name]"},
  {cmd: "stop",      run: cmdStop,       desc: "Stop Audio Clip",       usage:commandPrefix+"stop"},
  {cmd: "list",      run: cmdListAudio,  desc: "List All Audio Clips",  usage:commandPrefix+"list"},
  {cmd: "setbot",      run: cmdSetChannel,  desc: "Set Bot Text Channel",  usage:commandPrefix+"list"},
  {cmd:"wold", 		run: cmdWA,			desc: "Pulls Information from Wolfram Alpha",	usage:commandPrefix+"wa [option1 option2] [Options: int (e.g. 1,2,3) or " + wimageid + " for imgaes]"},
];

var CommandHandler = new Disnode.CommandHandler(commandPrefix, Commands);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
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
  bot.on('error', error);
}

var OnBotReady = function(){
  console.log("[VictoryBot] Ready!");
}
var error = function(errorobj){
  console.log("[VictoryBot] :" + errorobj);
}
var OnBotMessage = function(msg){
  console.log("[VictoryBot] Recieved Msg!");
  CommandHandler.RunMessage(msg);
}

var OnVoiceJoin = function(channel, user){
  if(user.username == 'VictoryForPhil')
  {
    bot.sendMessage(BotChat,"!joinme VictoryForPhil");
    bot.sendMessage(BotChat,"!play PhilsHere");

  }
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

function cmdWA(msg, parms){
	var wolfmsg;
	bot.sendMessage(msg.channel, "``` Waiting on Wolfram API Q: " + parms[0] +" Options: " + parms[1] + " " + parms[2] + " ```", function(err, sent) {
		wolfmsg = sent;
		console.log(err);
	});
	wolfram.makeRequest(parms, wimageid, function(text){
		bot.updateMessage(wolfmsg, text);
	});
}


function cmdJoinMe(msg, parms){
  if(parms[0])
  {
    for (var i = 0; i < msg.channel.server.members.length; i++) {
      var user = msg.channel.server.members[i];
      if(user.username == parms[0]){
        if(user.voiceChannel){
          VoiceManager.JoinChannelWithId(user.voiceChannel);
        }
      }
    }
  }else{
    for (var i = 0; i < msg.channel.server.members.length; i++) {
    var user = msg.channel.server.members[i];
    if(user.username == msg.author.username){
      if(user.voiceChannel){
        VoiceManager.JoinChannelWithId(user.voiceChannel);
      }
    }
  }}
}

function cmdUnFollow(msg){
VoiceManager.UnFollow(msg.client.user.username);
bot.sendMessage(msg.channel, "``` Stopped Following: "+msg.author.username+".```");
}
function cmdTest(msg, parm){
  bot.sendMessage(msg.channel, "TestCommand ("+parm.length+"): " + parm);
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
      //bot.updateMessage(progressMessage, "```Downloading..."+percent + "%```");
    }
  });
  ytManager.Download(link, file);
}

function cmdHelp(message){
  var SendString = "``` === HELP === \n";
  Disnode.CommonCommands.Help(Commands,message,[],function(cmd,desc,use){
    SendString = SendString + "-"+commandPrefix+cmd+" : "+desc+" - " + use + "\n";
    SendString = SendString + " ---------------------------- \n";
  });
  SendString = SendString + "```";
  bot.sendMessage(message.channel, SendString);
}

function cmdPlay(msg, parms){
  console.log("[VB - Log] Parms: "+ parms[0] + " " + parms[1]);
  var found = false;
  var id;
  VoiceManager.checkForUserInSameServer(bot, msg, function cb(returnID){
    console.log("[VB - Log] Callback: " + returnID);
    id = returnID;
    console.log("[VB - Log] ID:" + id);
    if(id == 0){
      found = false;
    }else{
      found = true;
    }
  });
  if(found){
    if(parms[1]){
        bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
        AudioPlayer.playFile("../Audio/", parms, bot, id, function cb(text){
            if(text === "loud"){
              bot.sendMessage(msg.channel, "``` Volume over threshold of 2! Remains default (0.8) ```");
            }
        });
    }else {
      bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
      AudioPlayer.playFile("../Audio/", parms, bot, id, function cb(text){});
    }
  }else{
    bot.sendMessage(msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
  }
}

function cmdListAudio(msg,parms){
  var Page = 1;
  if(parms[0]){
    Page = parseInt(parms[0]);
  }


  var ResultsPerPage = 15;
  var Start = (Page * ResultsPerPage) - ResultsPerPage;
  var CurrentIndex = 0;

  var SendString = "``` === AUDIO CLIPS (Page: "+Page+")=== \n";
  AudioPlayer.listAll(walk, "../Audio/", function(name){
    CurrentIndex++;
    if(CurrentIndex >= Start)
    {
      if(CurrentIndex < Start + ResultsPerPage)
      {
        SendString = SendString + "-"+name+ "\n";
      }
    }

  }, function(){
    SendString = SendString + "```";
    bot.sendMessage(msg.channel, SendString);
  });

}

function cmdStop(msg, parms){
  var found = false;
  var id;
  VoiceManager.checkForUserInSameServer(bot, msg, function cb(returnID){
    console.log("[VB - Log] Callback: " + returnID);
    id = returnID;
    console.log("[VB - Log] ID:" + id);
    if(id == 0){
      found = false;
    }else{
      found = true;
    }
  });
  if(found){
    bot.sendMessage(msg.channel, "``` Playback stopped! ```");
    AudioPlayer.stopPlaying(bot, id);
  } else {
    bot.sendMessage(msg.channel, "``` You must be inside a channel that the bot is in to stop playback ```");
  }
}

function cmdSetChannel(msg){
  BotChat = msg.channel;
  bot.sendMessage(msg.channel, "```Setting Bot Text Channel to This```")
}
StartBot();
