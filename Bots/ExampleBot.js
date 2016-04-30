//This is provided to give you an example of how a Disnode bot is layed out.
var Discord = require("Discord.js");
//we start out with the discord.js library
//then we add the disnode library
var Disnode = require("../DisnodeLib/Disnode.js");
//If you want Wolfram support you will heed to have a Wolfram API Key
var wolframapi = require('wolfram-alpha').createClient("");

//If you only want a chat bot these next few lines wont matter they are used to instatiate voice manager and AudioPlayer
var VoiceManager= new Disnode.VoiceManager(bot);
var AudioPlayer= new Disnode.AudioPlayer(bot, fs);
//also start loading the YouTube downloader for mp3 support
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "C:/Users/Garrett/Desktop/FireBot/libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
  "outputPath": "C:/Users/Garrett/Desktop/FireBot/Audio/", // Where should the downloaded and encoded files be stored?
  "youtubeVideoQuality": "highest", // What video quality should be used?
  "queueParallelism": 2, // How many parallel downloads/encodes should be started?
  "progressTimeout": 1000 // How long should be the interval of the progress reports
});
var ytManager = new Disnode.YoutubeManager(YD);