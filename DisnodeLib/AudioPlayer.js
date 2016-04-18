"use strict"
class AudioPlayer {
	constructor(bot, fs){
		this.bot = bot;
		this.fs = fs;
	}
	//when called it requires a msg (to check what server to play the audio on)
	playFile(msg, parms,path, bot){
		var connection = bot.internal.voiceConnection;
		console.log(path + parms[0] + ".mp3")
		connection.playFile(path + parms[0] + ".mp3", 1);
	}

	stopPlaying(msg, parms,bot){
		var connection = bot.internal.voiceConnection;
		connection.stopPlaying();
	}
}

module.exports.AudioPlayer = AudioPlayer;
