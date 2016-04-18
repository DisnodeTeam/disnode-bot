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
