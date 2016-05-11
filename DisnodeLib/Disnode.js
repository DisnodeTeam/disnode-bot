/*
  This is the core file for disnode. it brings all of the other library files into one and allows anything referencing
  disnode to call each file
*/
var CommandHandler = require("./CommandHandler.js").CommandHandler;
module.exports.CommandHandler = CommandHandler;

var VoiceManager = require("./VoiceManager.js").VoiceManager;
module.exports.VoiceManager = VoiceManager;

var CommonCommands = require("./CommonCommands.js");
module.exports.CommonCommands = CommonCommands;

var AudioPlayer = require("./AudioPlayer.js").AudioPlayer;
module.exports.AudioPlayer = AudioPlayer;

var YoutubeManager = require("./YoutubeManager.js").Downloader;
module.exports.YoutubeManager = YoutubeManager;

var Wolfram = require("./Wolfram.js").Wolfram;
module.exports.Wolfram = Wolfram;

var MiniGameComp = require("./MiniGameComp.js").MiniGameComp;
module.exports.MiniGameComp = MiniGameComp;
