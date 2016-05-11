var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");
var fs = require('fs');
var jsf = require('jsonfile');
var walk = require('walk')
var YoutubeMp3Downloader = require('youtube-mp3-downloader');

var MoneyTick;
var AutoSave;
var expTick;
var wimageid = "img";
var wolframapi = require('wolfram-alpha').createClient("");

var path = "../Audio/";
var bot = new Discord.Client();
var token = "";
var name = "";
var avatar = "";
var commandPrefix = "#";
var VoiceConn = [];
var UserDB = [];

var VoiceManager= new Disnode.VoiceManager(bot);
var MiniGame = new Disnode.MiniGameComp(bot, fs);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
var wolfram= new Disnode.Wolfram(wolframapi);
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "../libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
  "outputPath": "../Audio/", // Where should the downloaded and encoded files be stored?
  "youtubeVideoQuality": "highest", // What video quality should be used?
  "queueParallelism": 2, // How many parallel downloads/encodes should be started?
  "progressTimeout": 1000 // How long should be the interval of the progress reports
});
var ytManager = new Disnode.YoutubeManager(YD);

var Commands = [
	{cmd:"test",run: cmdTest,desc: "Test Command",usage:commandPrefix+"test"},
	{cmd: "help",run: cmdHelp,desc: "List All Commands",usage:commandPrefix+"help"},
	{cmd:"dc",run: cmdDC,desc: "Disconnects the bot for shutdown",usage:commandPrefix+"dc [Only FireGamer3 may use this command]"},
	{cmd:"play",run: cmdPLAY,desc: "Play audio clip",usage:commandPrefix+"play [FileName]"},
	{cmd:"jv",run: cmdJV,desc: "Joins voice channel",usage:commandPrefix+"jv"},
	{cmd:"lv",run: cmdLV,desc: "Leaves voice channel",usage:commandPrefix+"lv"},
	{cmd:"wa",run: cmdWA,desc: "Pulls Information from Wolfram Alpha",usage:commandPrefix+"wa [option1 option2] [Options: int (e.g. 1,2,3) or " + wimageid + " for imgaes]"},
	{cmd: "yt",run: cmdDownloadYT,desc: "Download Youtube Clip",usage:commandPrefix+"yt [Video ID] [Command/Clip Name]"},
	{cmd: "stop",run: cmdStop,desc: "Stop Audio Clip",usage:commandPrefix+"stop"},
	{cmd: "list",run: cmdListAudio,desc: "List All Audio Clips",usage:commandPrefix+"list"},
	{cmd: "add",run: cmdADD,desc: "Shows the Oauth2 link",usage:commandPrefix+"add"},
	{cmd: "game",run: cmdGAME,desc: "Set the bot's current game",usage:commandPrefix+"game [game] only FireGamer3 allowed"},
  {cmd: "fg",run: cmdFG,desc: "FireBot Game (mini game)",usage:commandPrefix+"fg"},
];
var CommandHandler = new Disnode.CommandHandler(commandPrefix, Commands);

function StartBot(){
	bot.loginWithToken(token);
	bot.on("ready", OnBotReady);
	bot.on("message", OnBotMessage);
	bot.on('voiceJoin', OnVoiceJoin);
	bot.on('voiceLeave', OnVoiceLeave);

  UserDB = jsf.readFileSync("UserDB.json");
}

var OnBotReady = function(){
	console.log("[FB - General] Ready");
}
var OnBotMessage = function(msg){
	console.log("[FB - MSG] " + msg.content);
	CommandHandler.RunMessage(msg);
}
var OnVoiceJoin = function(channel, user){
	console.log("[FB - Voice] User: " + user.name + " joined the voice channel: " + channel);
	VoiceManager.OnVoiceJoin(channel, user);
}
var OnVoiceLeave = function(channel, user){
	console.log("[FB - Voice] User: " + user.name + " left the voice channel: " + channel);
	VoiceManager.OnVoiceLeave(channel, user);
}

function cmdTest(msg){
	bot.sendMessage(msg.channel, "``` Test: " + bot.voiceConnections + "  ```");

}
function cmdDC(msg, parms){
	if (msg.author.name =="FireGamer3"){
		bot.sendMessage(msg.channel, "``` Disconnecting ```");
    clearInterval(MoneyTick);
    clearInterval(expTick);
    clearInterval(AutoSave);
    jsf.writeFileSync("UserDB.json", UserDB);
		bot.logout();
	}else {
		bot.sendMessage(msg.channel, "I can't let you do that! " + msg.author);
	}
}
function cmdHelp(msg){
	var SendString = "``` === HELP === \n";
	Disnode.CommonCommands.Help(Commands,msg,[],function(cmd,desc,use){
		SendString = SendString + "-"+commandPrefix+cmd+" : "+desc+" - " + use + "\n";
		SendString = SendString + " ---------------------------- \n";
	});
	SendString = SendString + "```";
	bot.sendMessage(msg.channel, SendString);
}
function cmdPLAY(msg, parms){
  console.log("[FB - Log] Parms: "+ parms[0] + " " + parms[1]);
  var found = false;
  var id;
  VoiceManager.checkForUserInSameServer(bot, msg, function cb(returnID){
    console.log("[FB - Log] Callback: " + returnID);
    id = returnID;
    console.log("[FB - Log] ID:" + id);
    if(id == 0){
      found = false;
    }else{
      found = true;
    }
  });
  if(found){
    if(parms[1]){
        bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
        AudioPlayer.playFile(path, parms, bot, id, function cb(text){
            if(text === "loud"){
              bot.sendMessage(msg.channel, "``` Volume over threshold of 2! Remains default (0.8) ```");
            }
        });
    }else {
      bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
      AudioPlayer.playFile(path, parms, bot, id, function cb(text){});
    }
  }else{
    bot.sendMessage(msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
  }
}
function cmdJV(msg, parms){
	if (msg.author.voiceChannel){
		id = msg.author.voiceChannel;
		VoiceManager.JoinChannelWithId(id);
		VoiceConn.push(id);
		bot.sendMessage(msg.channel, "``` Joined the channel you are in! [Debug] " + VoiceConn + "```");
	}else {
		bot.sendMessage(msg.channel, "``` You are not in a voice Channel ```");
	}
}
function cmdLV(msg){
	if (msg.author.voiceChannel){
		id = msg.author.voiceChannel;
		VoiceConn.forEach(function(value){
				if (value = id){
					VoiceManager.LeaveChannel(id);
					VoiceConn.splice(VoiceConn.indexOf(id), 1);
					bot.sendMessage(msg.channel, "``` left the channel you are in! [Debug] " + VoiceConn +"```");
				}
		});
	}
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
function cmdDownloadYT(msg) {
	var Mess = msg.content;

	var firstSpace =Mess.indexOf(" ");
	var link = Mess.substring(firstSpace + 1, Mess.indexOf(" ", firstSpace + 1));
	var file = Mess.substring(Mess.indexOf(" ",Mess.indexOf(link)) + 1,Mess.length);

	var progressMessage;



	bot.sendMessage(msg.channel, "``` Video Code: "+link+" Command Name: "+file+"```" );
	bot.sendMessage(msg.channel, "``` Downloading... ```", function(err, sent) {
		progressMessage = sent;
		console.log(err);
	});

	ytManager.SetOnFinished(function(data){
		bot.updateMessage(progressMessage, "``` Finished. Use '#play "+file+"'```");
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
function cmdListAudio(msg,parms){
	var SendString = "``` === AUDIO CLIPS === \n";
	AudioPlayer.listAll(walk, path, function(name){
		SendString = SendString + "-" + commandPrefix + name+ "\n";
		console.log(name);
	}, function(){
		SendString = SendString + "```";
		bot.sendMessage(msg.channel, SendString);
	});
}
function cmdStop(msg, parms){
  var found = false;
  var id;
  VoiceManager.checkForUserInSameServer(bot, msg, function cb(returnID){
    console.log("[FB - Log] Callback: " + returnID);
    id = returnID;
    console.log("[FB - Log] ID:" + id);
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
function cmdADD(msg) {
	bot.sendMessage(msg.channel, "Here, " + msg.author + " this is the link to add me to your server! https://discordapp.com/oauth2/authorize?&client_id=169998277847023617&scope=bot&permissions=0");
}
function cmdGAME(msg,parms) {
		if (msg.author.name =="FireGamer3"){
		bot.sendMessage(msg.channel, "``` Setting game to:  " + parms[0] + "```");
		bot.setPlayingGame(parms[0], function(error){});
	}else {
		bot.sendMessage(msg.channel, "I can't let you do that! " + msg.author);
	}
}
function cmdFG(msg,parms){
  var f = false;
  var index;
  MiniGame.CheckDB(msg, UserDB, function cb(found, id){
    if(found){
      f = true;
      index = id;
    }else {
      f = false;
    }
  });
  if(!f){
    bot.sendMessage(msg.channel, "``` Adding to UserDB:\n id: " + msg.author.id + "\n Cash: $" + 1000 + "\n XP: " + 0 + "\n LV:" + 1 + "\n HP:" + 10 + "\n Attack:" + 1 + " ```");
    MiniGame.AddUser(msg.author.id,1000,0,1,10,1, function cb(callback){
      UserDB.push(callback);
      console.dir(UserDB);
    });
  }else if(f){
    if(!parms[0]){
      var lvup = (10 * UserDB[index].lvl) - UserDB[index].exp;
      bot.sendMessage(msg.channel, "``` You were found in UserDB:\n id: " + UserDB[index].id + "\n Cash: $" + UserDB[index].cash + "\n XP: " + UserDB[index].exp + "\n Xp to next LV: " + lvup + "\n LV:" + UserDB[index].lvl + "\n HP:" + UserDB[index].hp + "\n Attack:" + UserDB[index].atk + " ```");
    }else if(parms[0] == "fight"){
      bot.sendMessage(msg.channel, "``` Fights will come soon ```");
    }
  }
}
StartBot();
var SetupInts = function (){
  MoneyTick = setInterval(function() {
    UserDB.forEach(function(obj){
      obj.cash = obj.cash + 10;
    });
  }, 60000);
  expTick = setInterval(function() {
    UserDB.forEach(function(obj){
      obj.exp = obj.exp + 1;
      var lvup = 10 * obj.lvl;
      if(obj.exp == lvup){
        obj.exp = 0;
        obj.lvl = obj.lvl + 1;
        obj.hp = obj.hp + 10;
        obj.atk++;
      }
    });
  }, 60000);
  AutoSave = setInterval(function() {
    jsf.writeFileSync("UserDB.json", UserDB);
    console.log("[FB - JSON] UserDB.json Auto Saved!");
  }, 300000);
};
SetupInts();
