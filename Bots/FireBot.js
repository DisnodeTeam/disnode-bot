var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");
var fs = require('fs');

var path = "C:/Users/Garrett/Desktop/FireBot/Audio/"
var bot = new Discord.Client();
var token = "";
var name = "";
var avatar = "";
var commandPrefix = "#";
var VoiceManager= new Disnode.VoiceManager(bot);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
var Commands = [
	{cmd:"test", run: cmdTest},
	{cmd:"dc", run: cmdDC},
	{cmd:"play", run: cmdPLAY},
	{cmd:"jv", run: cmdJV},
	{cmd:"lv", run: cmdLV},
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
function cmdPLAY(msg, parms){
			//checks to see if user is in a voice channel
		if (msg.author.voiceChannel){
			//checks to see if they are in the same channel
			bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
			//path is the path to the audio directory
			AudioPlayer.playFile(msg, parms,path, bot);
			
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

StartBot();