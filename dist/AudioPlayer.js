"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var walk = require('walk');
var fs = require("fs");

var AudioPlayer = function () {
	//Each of the Library files except Disnode.js are a class based file to keep it independent

	function AudioPlayer(options) {
		_classCallCheck(this, AudioPlayer);

		var self = this;
		var FS = require('fs');
		// Let Audioplayer, else you will get a null error later.
		self.audioPlayer = {};
		self.disnode = options.disnode;

		this.defaultConfig = {
			commands: [{
				"cmd": "list",
				"context": "AudioPlayer",
				"run": "cmdListAudio",
				"desc": "Displays list of Audio Files.",
				"usage": "list [page]"
			}, {
				"cmd": "play",
				"context": "AudioPlayer",
				"run": "cmdPlay",
				"desc": "Plays an audio file.",
				"usage": "play [filename] [volume]"
			}, {
				"cmd": "stop",
				"context": "AudioPlayer",
				"run": "cmdStop",
				"desc": "Stops all audio.",
				"usage": "stop"
			}]
		};
		// Check if there is the path varible
		if (options.path) {
			// If there is a path, set it
			self.path = options.path;
		} else {
			// Else set it to the default
			self.path = "./Audio/";
		}
		if (options.maxVolume) {
			if (options.maxVolume == -1) {
				self.maxVolume = 9999999;
			} else {
				self.maxVolume = options.maxVolume;
			}
		} else {
			self.maxVolume = 2.0;
		}
		if (options.defaultVolume) {
			self.defaultVolume = options.defaultVolume;
		} else {
			self.defaultVolume = 0.8;
		}

		self.bot = options.disnode.bot;
		self.DisnodeBOT = options.disnode;
		console.log("[AudioPlayer] Init Audio Player");
	}

	_createClass(AudioPlayer, [{
		key: "playFile",
		value: function playFile(name, parsedMsg, cb) {
			//Plays an audio file
			var self = this;
			var parms = parsedMsg.params;
			var found = false;
			var id;
			self.DisnodeBOT.VoiceManager.checkForUserInSameServer(parsedMsg.msg, function cb(returnID) {
				id = returnID;
				if (id == 0) {
					found = false;
				} else {
					found = true;
				}
			});

			if (found) {

				var connection;
				// sets up the variable and verify the voiceConnection it needs to use
				this.findConnection(id, function cb(c) {
					connection = c; //verified connection is sent back in the callback
				});
				var path = self.path + name;
				// START OF VOLUME CHECKING
				var volume = self.defaultVolume; //Default Volume
				connection.setVolume(volume); // sets the volume
				if (parms[1]) {
					// If there is a second parm
					if (parseFloat(parms[1])) {
						//can it be parsed to a float?
						if (parseFloat(parms[1]) <= self.maxVolume) {
							// checks to see if the float is less than then threshold
							volume = parseFloat(parms[1]); // if it is then set the volume to the parsed float
							connection.setVolume(volume); // actually sets the volume
						} else {
								// if the parsed float is over the threshold
								console.log("[AudioPlayer] Volume over threshold! Remains default");
								// Callback used for in execution for more info, loud is used as a keyword so the bot can use it's own message
								cb("loud");
							}
					} else {
						// if second parm not a float
						console.log("[AudioPlayer] Second Parms not Float");
					}
				} else {
					// if there is no second parm at all
					console.log("[AudioPlayer] No Volume Parm");
				}
				// END OF VOLUME CHECK
				console.log("[AudioPlayer] Playing Audio File");
				console.log("[AudioPlayer] --- Name: " + name);
				console.log("[AudioPlayer] --- Path: " + path + ".mp3");
				console.log("[AudioPlayer] --- Volume: " + volume);
				connection.playFile(path + ".mp3", volume, function cb(er) {
					console.dir(er);
				}); // plays the file with the verified connection
			} else {
					cb("notfound");
				}
		}
	}, {
		key: "stopPlaying",
		value: function stopPlaying(parsedMsg, cb) {
			// stops all audio playback in a voiceChannel
			var self = this;
			var found = false;
			var id;
			self.DisnodeBOT.VoiceManager.checkForUserInSameServer(parsedMsg.msg, function cb(returnID) {
				id = returnID;
				if (id == 0) {
					found = false;
				} else {
					found = true;
				}
			});
			if (found) {
				var connection;
				// sets up the variable and verify the voiceConnection it needs to use
				this.findConnection(id, function cb(c) {
					connection = c; //verified connection is sent back in the callback
				});
				// uses that verified connection to stop it's playback
				try {
					connection.stopPlaying();
				} catch (er) {
					console.log("[AudioPlayer] Error: " + err);
				}
			} else {
				cb("notfound");
			}
		}
	}, {
		key: "listAll",
		value: function listAll(path, callback, done) {
			var walker;
			walker = walk.walk(path);
			walker.on("file", function (root, fileStats, next) {
				var command = "play " + fileStats.name.substring(0, fileStats.name.indexOf("."));
				callback(command);
				next();
			});
			walker.on("errors", function (root, nodeStatsArray, next) {
				next();
			});
			walker.on("end", function () {
				done();
			});
		}
	}, {
		key: "findConnection",
		value: function findConnection(id, cb) {
			var self = this;
			// This function's job is to verify that the given id matches a voice connection and send what voiceConenction it uses through the callback
			/*
   	id is the  voice id of the voice channel to stop audio playback on
   	cb is the callback used to send the verified connection object back to the function that needs it
   */
			var i = 0; // number counting variable
			var f = false; // f is "found" basically used to stop number counting in the while loop
			while (!f) {
				// whie connection isn't found
				if (self.bot.voiceConnections[i].voiceChannel == id) {
					//Cycles through its voice connections for a matching id to the given id
					f = true; // we found a matching id
					var connection = this.bot.voiceConnections[i]; //sets up a temp variable to store the found id
					cb(connection); // sends that variable back via a callback
				} // this is if its not found
				i++; //adds numbers
				// there is no fail safe in this function because the connect should always be there as it is verified via the bot before it runs this
			}
			if (!f) cb(0); // this is a fallback just in case
		}
	}, {
		key: "cmdListAudio",
		value: function cmdListAudio(parsedMsg) {
			var self = this;
			var Page = 1;
			if (parsedMsg.params[0]) {
				Page = parseInt(parsedMsg.params[0]);
			}

			var ResultsPerPage = 15;
			var Start = Page * ResultsPerPage - ResultsPerPage;
			var CurrentIndex = 0;

			var SendString = "``` === AUDIO CLIPS (Page: " + Page + ")=== \n";
			self.listAll("./Audio/", function (name) {
				CurrentIndex++;
				if (CurrentIndex >= Start) {
					if (CurrentIndex < Start + ResultsPerPage) {
						SendString = SendString + "-" + name + "\n";
					}
				}
			}, function () {
				SendString = SendString + "```";
				self.disnode.bot.sendMessage(parsedMsg.msg.channel, SendString);
			});
		}
	}, {
		key: "cmdPlay",
		value: function cmdPlay(parsedMsg) {
			var self = this;

			var fileName = parsedMsg.params[0];
			self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play File: " + fileName + ".mp3 ```");
			self.playFile(fileName, parsedMsg, function (text) {
				if (text === "loud") {
					self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Volume over threshold of " + self.maxVolume + "! Remains default (" + self.defaultVolume + ") ```");
				}
				if (text === "notfound") {
					self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
				}
			});
		}
	}, {
		key: "cmdStop",
		value: function cmdStop(parsedMsg) {
			var self = this;

			self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Playback stopped! ```");
			self.stopPlaying(parsedMsg, function cb(text) {
				if (text === "notfound") {
					self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
				}
			});
		}
	}]);

	return AudioPlayer;
}();

module.exports = AudioPlayer;