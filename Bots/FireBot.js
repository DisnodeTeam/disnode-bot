var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");
var fs = require('fs');

var path = "../Audio/"
var bot = new Discord.Client();
var token = "";
var name = "";
var avatar = "";
var commandPrefix = "#";
var VoiceManager= new Disnode.VoiceManager(bot);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
var Commands = [
	{cmd:"test", 	run: cmdTest,	desc: "Test Command"},
	{cmd: "help",      run: cmdHelp,       desc: "List All Commands",     usage:commandPrefix+"help"},
	{cmd:"dc", 		run: cmdDC,		desc: "Disconnects the bot for shutdown",	usage:commandPrefix+"dc [Only FireGamer3 may use this command]"},
	{cmd:"play", 	run: cmdPLAY,	desc: "Play audio clip",					usage:commandPrefix+"play [FileName ('-' instead of spaces.)]"},
	{cmd:"jv", 		run: cmdJV,		desc: "Joins voice channel",				usage:commandPrefix+"jv [Voice Channel Name ('-' instead of spaces.)]"},
	{cmd:"lv", 		run: cmdLV,		desc: "Leaves voice channel",				usage:commandPrefix+"lv [Voice Channel Name ('-' instead of spaces.)]"},
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
		bot.sendMessage(msg.channel, "``` Playing File: " + parms[0] + ".mp3 ```");
		AudioPlayer.playFile(path, parms, bot);
		
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