"use strict"
class AudioPlayer { //Each of the Library files except Disnode.js are a class based file to keep it independent
	constructor(bot, fs,path){
		this.bot = bot;
		this.fs = fs;
		this.path = path;
		console.log("[AudioPlayer] Init Audio Player");
	}
	playFile(name, parms, defaultVolume, maxVolume, id, cb){ //Plays an audio file
		var self = this;
		console.log("[AudioPlayer] Playing Audio File");
		/*
			path is the directory where audio files are stored
			parms is the auto filtered paramaters from the message
			bot is the discord.client aka the acual bot
			id is the voice channel id of the voice channel to play a file on which should be found on the bot side
			cb is a callback function used to send information such as the volume being too loud with a keyword of "loud"
		*/
		var connection;
		// sets up the variable and verify the voiceConnection it needs to use
		this.findConection(id, function cb(c){
			connection = c; //verified connection is sent back in the callback
			console.log("FOUND!?!?");
		});
		var path = self.path + name;
		console.log(path + ".mp3"); // Console logs the full path to the audio file
		// START OF VOLUME CHECKING
		var volume = defaultVolume; //Default Volume
		connection.setVolume(volume); // sets the volume
		if(parms[1]){ // If there is a second parm
			if(parseFloat(parms[1])){ //can it be parsed to a float?
				if(parseFloat(parms[1]) <= maxVolume){ // checks to see if the float is less than then threshold
					volume = parseFloat(parms[1]); // if it is then set the volume to the parsed float
					console.log("[AudioPlayer] Set volume:" + volume); // logs the volume change
					connection.setVolume(volume); // actually sets the volume
				}else{ // if the parsed float is over the threshold
					console.log("[AudioPlayer] Volume over threshold! Remains default");
					// Callback used for in execution for more info, loud is used as a keyword so the bot can use it's own message
					cb("loud");
				}
			}else{ // if second parm not a float
				console.log("[AudioPlayer] Second Parms not Float");
			}
		}
		else{ // if there is no second parm at all
			console.log("[AudioPlayer] No Volume Parm");
		}
		// END OF VOLUME CHECK
		connection.playFile(path + ".mp3", volume); // plays the file with the verified connection
		console.log("Playing At: " + volume); //debug logs the volume
	}

	stopPlaying(id){ // stops all audio playback in a voiceChannel
		/*
			bot is the discord.client aka the acual bot
			id is the  voice id of the voice channel to stop audio playback on
		*/
		var connection;
		// sets up the variable and verify the voiceConnection it needs to use
		this.findConection(this.bot, id, function cb(c){
			connection = c; //verified connection is sent back in the callback
		});
		// uses that verified connection to stop it's playback
		try{
			connection.stopPlaying();
		}catch (er){
			console.log("[AudioPlayer] Error: " + err);
		}
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
	findConection(id, cb){
		// This function's job is to verify that the given id matches a voice connection and send what voiceConenction it uses through the callback
		/*
			id is the  voice id of the voice channel to stop audio playback on
			cb is the callback used to send the verified connection object back to the function that needs it
		*/
		var i = 0; // number counting variable
		var f = false; // f is "found" basically used to stop number counting in the while loop
		while(!f){ // whie connection isn't found
			if(this.bot.voiceConnections[i].voiceChannel == id){ //Cycles through its voice connections for a matching id to the given id
				f = true; // we found a matching id
				var connection = this.bot.voiceConnections[i]; //sets up a temp variable to store the found id
				cb(connection); // sends that variable back via a callback
			} // this is if its not found
			i++; //adds numbers
			// there is no fail safe in this function because the connect should always be there as it is verified via the bot before it runs this
		}
		if(!f)cb(0); // this is a fallback just in case
	}
}

module.exports = AudioPlayer;
