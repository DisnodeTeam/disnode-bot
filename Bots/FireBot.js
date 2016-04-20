var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");
var fs = require('fs');
var walk = require('walk')
var YoutubeMp3Downloader = require('youtube-mp3-downloader');

var wimageid = "img";
var wolframapi = require('wolfram-alpha').createClient("");

var path = "C:/Users/Garrett/Desktop/FireBot/Audio/";
var bot = new Discord.Client();
var token = "";
var name = "";
var avatar = "";
var commandPrefix = "#";

var VoiceManager= new Disnode.VoiceManager(bot);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
var wolfram= new Disnode.Wolfram(wolframapi);
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "C:/Users/Garrett/Desktop/FireBot/libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
  "outputPath": "C:/Users/Garrett/Desktop/FireBot/Audio/", // Where should the downloaded and encoded files be stored?
  "youtubeVideoQuality": "highest", // What video quality should be used?
  "queueParallelism": 2, // How many parallel downloads/encodes should be started?
  "progressTimeout": 1000 // How long should be the interval of the progress reports
});
var ytManager = new Disnode.YoutubeManager(YD);

var Commands = [
	{cmd:"test", 	run: cmdTest,		desc: "Test Command"},
	{cmd: "help",   run: cmdHelp,       desc: "List All Commands",     					usage:commandPrefix+"help"},
	{cmd:"dc", 		run: cmdDC,			desc: "Disconnects the bot for shutdown",		usage:commandPrefix+"dc [Only FireGamer3 may use this command]"},
	{cmd:"play", 	run: cmdPLAY,		desc: "Play audio clip",						usage:commandPrefix+"play [FileName ('-' instead of spaces.)]"},
	{cmd:"jv", 		run: cmdJV,			desc: "Joins voice channel",					usage:commandPrefix+"jv [Voice Channel Name ('-' instead of spaces.)]"},
	{cmd:"lv", 		run: cmdLV,			desc: "Leaves voice channel",					usage:commandPrefix+"lv [Voice Channel Name ('-' instead of spaces.)]"},
	{cmd:"wa", 		run: cmdWA,			desc: "Pulls Information from Wolfram Alpha",	usage:commandPrefix+"wa [option1 option2] [Options: int (e.g. 1,2,3) or " + wimageid + " for imgaes]"},
	{cmd: "yt",     run: cmdDownloadYT, desc: "Download Youtube Clip", 					usage:commandPrefix+"yt [Video ID] [Command/Clip Name]"},
	{cmd: "stop",   run: cmdStop,       desc: "Stop Audio Clip",      					usage:commandPrefix+"stop"},
	{cmd: "list",   run: cmdListAudio,  desc: "List All Audio Clips",  					usage:commandPrefix+"list"},	
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
	console.log("FireBot is Ready to take in commands!");
}
var OnBotMessage = function(msg){
	console.log("[MSG] " + msg.content);
	CommandHandler.RunMessage(msg);
}
var OnVoiceJoin = function(channel, user){
	VoiceManager.OnVoiceJoin(channel, user);
}
var OnVoiceLeave = function(channel, user){
	VoiceManager.OnVoiceLeave(channel, user);
}

function cmdTest(msg){
	bot.sendMessage(msg.channel, "``` Test Complete ```");
}
function cmdDC(msg, parms){
	if (msg.author.name =="FireGamer3"){
		bot.sendMessage(msg.channel, "``` Disconnecting ```");
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
	if (msg.author.voiceChannel){
		if(parms[1]){
			if(parseInt(parms[1]) <= 2){
				bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
				AudioPlayer.playFile(path, parms, bot);
			}else {
				bot.sendMessage(msg.channel, "``` Volume too loud! (over 2) ```");
			}
		}else {
			bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
			AudioPlayer.playFile(path, parms, bot);
		}
	}else {
		bot.sendMessage(msg.channel, "``` You are not in a voice Channel ```");
	}
}
function cmdJV(msg, parms){
	if (msg.author.voiceChannel){
		VoiceManager.JoinChannelWithId(msg.author.voiceChannel);
	}
}
function cmdLV(msg){
	if (msg.author.voiceChannel){
		
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
	AudioPlayer.listAll(walk, "./Audio/", function(name){
		SendString = SendString + "-" + commandPrefix + name+ "\n";
		console.log(name);
	}, function(){
		SendString = SendString + "```";
		bot.sendMessage(msg.channel, SendString);
	});
}
function cmdStop(msg, parms){
		//checks to see if user is in a voice channel
	if (bot.voiceConnection){
		//checks to see if they are in the same channel
		bot.sendMessage(msg.channel, "``` Stopping Audio Playback```");
		//path is the path to the audio directory
		AudioPlayer.stopPlaying(bot);
	}else {
		bot.sendMessage(msg.channel, "``` Bot is not connected to a voice channel ```");
	}
}
StartBot();