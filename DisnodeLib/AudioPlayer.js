"use strict"
class AudioPlayer {
	constructor(bot, fs){
		this.bot = bot;
		this.fs = fs;
	}
	playFile(path, parms, bot, id, cb){
		var connection;
		this.findConection(bot, id, function cb(c){
			connection = c;
		});
		console.log(path + parms[0] + ".mp3");
		var volume = 0.8;
		if(parms[1]){
			if(parseFloat(parms[1])){
				if(parseFloat(parms[1]) <= 3){
					volume = parseFloat(parms[1]);
					console.log("[AudioPlayer] Set volume:" + volume);
					connection.setVolume(volume);
				}else{
					console.log("[AudioPlay] Volume over threshold! Remains default");
					// Callback used for in execution for more info loud is used as a keyword so the bot can use it's own message
					cb("loud");
				}
			}else{
				console.log("[AudioPlay] Second Parms not Float");
			}
			var converted = parseFloat(parms[1]);

		}
		else{
			console.log("[AudioPlay] No Volume Parm");
		}
		connection.playFile(path + parms[0] + ".mp3", volume);
		console.log("Playing At: " + volume);
	}
	stopPlaying(bot, id){
		var connection;
		this.findConection(bot, id, function cb(c){
			connection = c;
		});
		connection.stopPlaying();
	}

	listAll(walk, path, callback, done){
		var walker;
		walker = walk.walk(path);
		walker.on("file", function(root, fileStats, next){
			var command = "play "+fileStats.name.substring(0,fileStats.name.indexOf("."));
			callback(command);
			next();
		});
		walker.on("errors", function (root, nodeStatsArray, next) {
			console.log(nodeStatsArray);
			next();
		});
		walker.on("end", function () {
			done();
			console.log("DONE");
		});
	}
	findConection(bot, id, cb){
		var i = 0;
		var f = false;
		while(!f){
			if(bot.voiceConnections[i].voiceChannel == id){
				f = true;
				var connection = bot.voiceConnections[i];
				cb(connection);
			}
			i++;
		}
		if(!f)cb(0);
	}
}

module.exports.AudioPlayer = AudioPlayer;
