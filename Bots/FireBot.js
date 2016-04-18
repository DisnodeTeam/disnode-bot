var Disnode = require("../DisnodeLib/Disnode.js");
var Discord = require("Discord.js");

var bot = new Discord.Client();
var token = "";
var name = "";
var avatar = "";
var commandPrefix = "#";
var VoiceManager= new Disnode.VoiceManager(bot);
var Commands = [
	{cmd:"test", run: cmdTest},
	{cmd:"dc", run: cmdDC},
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

StartBot();