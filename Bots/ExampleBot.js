//This is provided to give you an example of how a Disnode bot is layed out.

var Discord = require("Discord.js"); //we start out with the discord.js library
var Disnode = require("../DisnodeLib/Disnode.js"); //then we add the disnode library

var wolframapi = require('wolfram-alpha').createClient("API KEY HERE"); //If you want Wolfram support you will heed to have a Wolfram API Key
var wimageid = "img"; //this is a param that wolfram will use to look for images
var wolfram = new Disnode.Wolfram(wolframapi); //sets up the Wolfram class

//If you only want a chat bot these next few lines wont matter they are used to instatiate voice manager and AudioPlayer
var VoiceManager= new Disnode.VoiceManager(bot);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
//also start loading the YouTube downloader for mp3 support
var YoutubeMp3Downloader = require('youtube-mp3-downloader');
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "../libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
  "outputPath": "../Audio/", // Where should the downloaded and encoded files be stored?
  "youtubeVideoQuality": "highest", // What video quality should be used?
  "queueParallelism": 2, // How many parallel downloads/encodes should be started?
  "progressTimeout": 1000 // How long should be the interval of the progress reports
});
var ytManager = new Disnode.YoutubeManager(YD); //sets up the YT downloader class

var fs = require('fs'); //other dependency
var walk = require('walk'); //other dependency
//setting up th bot
var path = "../audio/"; //path is the path to the audio directory for all audio files
var bot = new Discord.Client(); //assigns the bot variable
var token = "DISCORD BOT TOKEN HERE"; //bot token for bot login
var commandPrefix = "!"; // prefix for your command e.g. !command

var Commands = [ //here is where we list the commands and their executing functions
  {cmd:"helloworld",run: helloWorld,desc: "Hello World Command",usage:commandPrefix+"helloworld"},
  {cmd: "help",run: cmdHelp,desc: "List All Commands",usage:commandPrefix+"help"},
  //below is how a command works
  //{cmd:"command",run: afunction,desc: "Description",usage:commandPrefix+"command"},
];
var CommandHandler = new Disnode.CommandHandler(commandPrefix, Commands); //calls the commandhandler with the commands and your set prefix
// The next few lines just setup functions for the bot

function StartBot(){
	bot.loginWithToken(token);
	bot.on("ready", OnBotReady);
	bot.on("message", OnBotMessage);
	bot.on('voiceJoin', OnVoiceJoin);
	bot.on('voiceLeave', OnVoiceLeave);
}

var OnBotReady = function(){
	console.log("[General] Ready");
}
var OnBotMessage = function(msg){
	console.log("[FB - MSG] " + msg.content);
	CommandHandler.RunMessage(msg);
}
var OnVoiceJoin = function(channel, user){
	console.log("[Voice] User: " + user.name + " joined the voice channel: " + channel);
	VoiceManager.OnVoiceJoin(channel, user);
}
var OnVoiceLeave = function(channel, user){
	console.log("[Voice] User: " + user.name + " left the voice channel: " + channel);
	VoiceManager.OnVoiceLeave(channel, user);
}

function helloWorld(msg){ //this is the function that will be called when the command !helloworld is used
  console.log("Hello World"); //logs Hello World to the console
  bot.sendMessage(msg.channel, "Hello World"); // sends hello world to the channel the msg was sent in
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
