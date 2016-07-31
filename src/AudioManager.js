"use strict"
const colors = require('colors');
const walk = require('walk');
const fs = require("fs");
const ytdl = require('ytdl-core');
class AudioManager { //Each of the Library files except Disnode.js are a class based file to keep it independent
	constructor(options){
		var self = this;
    // Let AudioManager, else you will get a null error later.
    self.AudioManager = {};
		self.disnode = options.disnode;
		this.connections = [];
		this.queue = [];
		this.defaultConfig = {
			commands:[
				{
		      "cmd": "list",
		      "context": "AudioManager",
		      "run": "cmdListAudio",
		      "desc": "Displays list of Audio Files.",
		      "usage": "list [page]",
		    },
		    {
		      "cmd": "play",
		      "context": "AudioManager",
		      "run": "cmdPlay",
		      "desc": "Plays an audio file.",
		      "usage": "play [filename] [volume]",
		    },
				{
		      "cmd": "stream",
		      "context": "AudioManager",
		      "run": "cmdStream",
		      "desc": "Plays an audio file.",
		      "usage": "play [url] [volume]",
		    },
				{
		      "cmd": "addsong",
		      "context": "AudioManager",
		      "run": "cmdAddSong",
		      "desc": "Adds a song",
		      "usage": "addsong [name] [url]",
		    },
		    {
		      "cmd": "stop",
		      "context": "AudioManager",
		      "run": "cmdStop",
		      "desc": "Stops all audio.",
		      "usage": "stop",
		    },
				{
          "cmd": "jv",
          "context": "AudioManager",
          "run": "cmdJoinVoice",
          "desc": "Joins the voice channel you are connected to.",
          "usage": "jv"
        },
        {
          "cmd": "lv",
          "context": "AudioManager",
          "run": "cmdLeaveVoice",
          "desc": "Leaves the voice channel you are connected to.",
          "usage": "lv",
        },
        {
          "cmd": "follow",
          "context": "AudioManager",
          "run": "cmdFollow",
          "desc": "Test Command that lists all params.",
          "usage": "follow [User]",
        },
        {
          "cmd": "unfollow",
          "context": "AudioManager",
          "run": "cmdUnfollow",
          "desc": "Test Command that lists all params.",
          "usage": "unfollow [parms]",
        }
			],
			songs: [],
			resNoName : "```Please Enter a name for this song!```",
			resNoUrl : "```Please Enter a Youtube URL for this song!```",
			resSongAdded : "```[Song] Added!```",

		}
		if(options.voiceEvents == true){
        this.voiceEvents = true;
       options.disnode.bot.on("voiceJoin", (c,u)=>this.OnVoiceJoin(c,u));
       options.disnode.bot.on("voiceLeave", (c,u)=>this.OnVoiceLeave(c,u));
    }else{
      this.voiceEvents = false;
    }
    this.retry = true;
    // Check if there is the path varible
		self.path = options.path || "./Audio/";

    if(options.maxVolume){
      if(options.maxVolume == -1){
        self.maxVolume = 9999999;
      }else{
        self.maxVolume = options.maxVolume;
      }
    }else{
      self.maxVolume = 2.0;
    }
    if(options.defaultVolume){
      self.defaultVolume = options.defaultVolume;
    }else{
      self.defaultVolume = 0.8;
    }

		self.bot = options.disnode.bot;
		self.config = options.disnode.config.AudioManager;
		console.log("[AudioManager]".grey + " Init AudioManager".green);
	}
	playFile(name, parsedMsg, cb){ //Plays an audio file
		var self = this;
		var parms = parsedMsg.params;
		var found = false;
		var id;
		self.checkForUserInSameServer(parsedMsg.msg, function cb(returnID){
			id = returnID;
			if(id == 0){
				found = false;
			}else{
				found = true;
			}
		});

		if(!found){
			cb("notfound");
			return;
		}

		var song = self.getSong(name);
		if(!song){
			self.disnode.sendResponse(parsedMsg,"No Song Found!");
			return;
		}

		var connection;


		// sets up the variable and verify the voiceConnection it needs to use
		this.findConnection(id, function cb(c){
			connection = c; //verified connection is sent back in the callback
		});
		// START OF VOLUME CHECKING
		var volume = self.defaultVolume; //Default Volume
		connection.setVolume(volume); // sets the volume
		if(parms[1]){ // If there is a second parm
			if(parseFloat(parms[1])){ //can it be parsed to a float?
				if(parseFloat(parms[1]) <= self.maxVolume){ // checks to see if the float is less than then threshold
					volume = parseFloat(parms[1]); // if it is then set the volume to the parsed float
					connection.setVolume(volume); // actually sets the volume
				}else{ // if the parsed float is over the threshold
					console.log("[AudioManager]".grey + " Volume over threshold! Remains default".red);
					// Callback used for in execution for more info, loud is used as a keyword so the bot can use it's own message
					cb("loud");
				}
			}else{ // if second parm not a float
				console.log("[AudioManager]".grey + " Second Parms not Float".red);
			}
		}
		else{ // if there is no second parm at all
			console.log("[AudioManager]".grey + " No Volume Parm".red);
		}
		// END OF VOLUME CHECK
		console.log("[AudioManager]".grey + " Streaming Audio File".cyan);
		console.log("[AudioManager]".grey + " --- Volume: " + colors.cyan(volume));
		var stream = ytdl(song.url);
		connection.playRawStream(stream);

	}

	playStream(streamUrl,parsedMsg, cb){ //Plays an audio file
		var self = this;
		var parms = parsedMsg.params;
		var found = false;
		var id;
		self.checkForUserInSameServer(parsedMsg.msg, function cb(returnID){
			id = returnID;
			if(id == 0){
				found = false;
			}else{
				found = true;
			}
		});

		if(!found){
			cb("notfound");
			return;
		}

		var connection;
		// sets up the variable and verify the voiceConnection it needs to use
		this.findConnection(id, function cb(c){
			connection = c; //verified connection is sent back in the callback
		});
		// START OF VOLUME CHECKING
		var volume = self.defaultVolume; //Default Volume
		connection.setVolume(volume); // sets the volume
		if(parms[1]){ // If there is a second parm
			if(parseFloat(parms[1])){ //can it be parsed to a float?
				if(parseFloat(parms[1]) <= self.maxVolume){ // checks to see if the float is less than then threshold
					volume = parseFloat(parms[1]); // if it is then set the volume to the parsed float
					connection.setVolume(volume); // actually sets the volume
				}else{ // if the parsed float is over the threshold
					console.log("[AudioManager]".grey + " Volume over threshold! Remains default".red);
					// Callback used for in execution for more info, loud is used as a keyword so the bot can use it's own message
					cb("loud");
				}
			}else{ // if second parm not a float
				console.log("[AudioManager]".grey + " Second Parms not Float".red);
			}
		}
		else{ // if there is no second parm at all
			console.log("[AudioManager]".grey + " No Volume Parm".red);
		}
		// END OF VOLUME CHECK
		console.log("[AudioManager]".grey + " Streaming Audio File".cyan);
		console.log("[AudioManager]".grey + " --- Volume: " + colors.cyan(volume));
		var stream = ytdl(streamUrl);
		connection.playRawStream(stream);
	}

	stopPlaying(parsedMsg, cb){ // stops all audio playback in a voiceChannel
		var self = this;
		var found = false;
		var id;
		self.checkForUserInSameServer(parsedMsg.msg, function cb(returnID){
			id = returnID;
			if(id == 0){
				found = false;
			}else{
				found = true;
			}
		});
		if(found){
			var connection;
			// sets up the variable and verify the voiceConnection it needs to use
			this.findConnection(id, function cb(c){
				connection = c; //verified connection is sent back in the callback
			});
			// uses that verified connection to stop it's playback
			try{
				connection.stopPlaying();
			}catch (er){
				console.log("[AudioManager]".grey + colors.red(" Error: " + err));
			}
		}else{
			cb("notfound");
		}
}


	listAll(callback, done){
		var self = this;
		for (var i = 0; i < self.config.songs.length; i++) {
			var song = self.config.songs[i];
			callback(song);
		}
		done();
	}
	findConnection(id, cb){
		var self = this;
		var f = false;
		for (var i = 0, len = self.connections.length; i < len; i++) {
			if(self.connections[i].voiceChannel == id){
				var connection = self.connections[i];
				cb(connection);
				return;
			}
		}
		// This function's job is to verify that the given id matches a voice connection and send what voiceConenction it uses through the callback
		/*
			id is the  voice id of the voice channel to stop audio playback on
			cb is the callback used to send the verified connection object back to the function that needs it
		*/
		var i = 0; // number counting variable
		while(!f){ // whie connection isn't found
			if(self.bot.voiceConnections[i].voiceChannel == id){ //Cycles through its voice connections for a matching id to the given id
				f = true; // we found a matching id
				var connection = this.bot.voiceConnections[i]; //sets up a temp variable to store the found id
				cb(connection); // sends that variable back via a callback
			} // this is if its not found
			i++; //adds numbers
			// there is no fail safe in this function because the connect should always be there as it is verified via the bot before it runs this
		}
		if(!f)cb(0); // this is a fallback just in case
	}
	getSong(songName){
		var self = this;

		for (var i = 0; i < self.config.songs.length; i++) {
			if(self.config.songs[i].name === songName){
				return self.config.songs[i];
			}
		}
	}

	  OnVoiceJoin(VoiceChannel, user){
	    console.log("[VoiceManager]".grey + " Voice Join".cyan);
	    console.log("[VoiceManager]".grey + " |--- User ["+ colors.cyan(user) +"] " + colors.cyan(user.username));
	    console.log("[VoiceManager]".grey + " |--- Channel ["+ colors.cyan(VoiceChannel) +"] " + colors.cyan(VoiceChannel.name));
	    if(user == this.follow){
	      this.JoinChannelWithId(VoiceChannel);
	    }
	  }

	  OnVoiceLeave(VoiceChannel, user){
	    console.log("[VoiceManager]".grey + " Voice Leave".cyan);
	    console.log("[VoiceManager]".grey + " |--- User ["+ colors.cyan(user) +"] " + colors.cyan(user.username));
	    console.log("[VoiceManager]".grey + " |--- Channel ["+ colors.cyan(VoiceChannel) +"] " + colors.cyan(VoiceChannel.name));
	    if(user == this.follow){
	        this.LeaveChannel(VoiceChannel);
	    }
	  }

	  Follow(user){
	    console.log("[VoiceManager]".grey + colors.cyan(" Follow enabaled for: " + user));
	    this.follow = user;
	  }

	  UnFollow(){
	    this.follow = "";
	  }
	  checkForUserInSameServer(msg, cb){
	    var f = false;
	    var returnid;
	    this.bot.voiceConnections.forEach(function(value){
	      if(value.voiceChannel == msg.author.voiceChannel){
	        f = true;
	        returnid = value.voiceChannel
	        cb(returnid);
	      }
	    });
	    if(!f){
	      cb(0);
	    }
	  }

	  JoinChannel(name, server){
	    var id = GetServerIDByName(this.bot, name, server);
	    if(id){
	      console.log("[VoiceManager]".grey + colors.green(" Found Server: " + id));
	      this.currentChannel = id;
	      this.disnode.bot.joinVoiceChannel(id);
				this.findConnection(id, function cb(connection){
					if (connection != 0){
						this.connections.push(connection);
					}
				});
	    }else{
	      console.log("[VoiceManager]".grey + colors.red(" Failed to Find Server: " + id));
	      if(this.retry == true){
	        var nameConvert = name.replace(/-/g, " ");
	        this.retry = false;
	        this.JoinChannel(nameConvert, server)

	      }
	    }
	  }

	  JoinChannelWithId(id,cb){
	    this.disnode.bot.joinVoiceChannel(id,cb);
	  }

	  LeaveChannel(id){
	    this.disnode.bot.leaveVoiceChannel(id);
			for (var i = 0, len = this.connections.length; i < len; i++) {
				if(this.connections[i].voiceChannel == id){
					this.connections.splice(i,1);
				}
			}
	  }
		cmdListAudio(parsedMsg){
			var self = this;
			var Page = 1;
			if(parsedMsg.params[0]){
				Page = parseInt(parsedMsg.params[0]);
			}


			var ResultsPerPage = 15;
			var Start = (Page * ResultsPerPage) - ResultsPerPage;
			var CurrentIndex = 0;

			var SendString = "``` === AUDIO CLIPS (Page: "+Page+")=== \n";
			self.listAll(function(song){
				CurrentIndex++;
				if(CurrentIndex >= Start)
				{
					if(CurrentIndex < Start + ResultsPerPage)
					{
						SendString = SendString + "-"+song.name+ "\n";
					}
				}

			}, function(){
				SendString = SendString + "```";
				self.disnode.bot.sendMessage(parsedMsg.msg.channel, SendString);
			});

		}

		cmdPlay(parsedMsg){
	    var self = this;

	    var fileName = parsedMsg.params[0];
	    self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play Song: " + fileName +"```");
	    self.playFile(fileName, parsedMsg,function(text){
	      if(text === "loud"){
	        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Volume over threshold of " + self.maxVolume + "! Remains default (" + self.defaultVolume +") ```");
	      }
	      if(text === "notfound"){
	        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
	      }
	    });
	  }

		cmdStream(parsedMsg){
	    var self = this;

	    var url = parsedMsg.params[0];
	    self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Streaming... ```");
	    self.playStream(url, parsedMsg,function(text){
	      if(text === "loud"){
	        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Volume over threshold of " + self.maxVolume + "! Remains default (" + self.defaultVolume +") ```");
	      }
	      if(text === "notfound"){
	        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
	      }
	    });
	  }

		cmdAddSong(parsedMsg){
			var self = this;
			var list = self.config.songs;
			var name = parsedMsg.params[0];
			var url = parsedMsg.params[1];
			if(!name){
				var res = self.config.resNoName;
				self.disnode.sendResponse(parsedMsg,res);
				return;
			}

			if(!url){
				var res = self.config.resNoUrl;
				self.disnode.sendResponse(parsedMsg,res);
					return;
			}
			var shortcuts = [{
				shortcut: "[Song]",
				data: name
			}];
			var res = self.config.resSongAdded;
			self.disnode.sendResponse(parsedMsg,res,{parse: true, shortcuts: shortcuts});
			self.config.songs.push({name:name,url:url});
			self.disnode.saveConfig();
		}

	  cmdStop(parsedMsg){
	    var self = this;

	    self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Playback stopped! ```");
	    self.stopPlaying(parsedMsg, function cb(text){
	      if(text === "notfound"){
	        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
	      }
	    });
	  }
	  cmdJoinVoice(parsedMsg){
	    var self = this;
	  	if(parsedMsg.msg.author.voiceChannel){
	  		var id = parsedMsg.msg.author.voiceChannel;
	  		self.JoinChannelWithId(id);
	  		self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Joined the channel you are in! ```");
	  	}else {
	  		self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You are not in a voice Channel ```");
	  	}

	  }
	  cmdLeaveVoice(parsedMsg){
	    var self = this;
	    if (parsedMsg.msg.author.voiceChannel){
	  		var id = parsedMsg.msg.author.voiceChannel;
	      self.LeaveChannel(id);
	      self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Left the channel you are in! ```");
	    }else {
	  		self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You are not in a voice Channel ```");
	  	}
	  }

	  cmdFollow(parsedMsg){
	    var self = this;
	      if(self.voiceEvents){
	        self.Follow(parsedMsg.msg.author);
	        console.log("[VoiceManager - CmdFollow ]".grey + colors.cyan(" Following: " + parsedMsg.msg.author.username));
	        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "```Following: " + parsedMsg.msg.author.username+"```")
	      }else{
	        console.log("[VoiceManager - CmdFollow ]".grey + " Voice events no enabled!".red);
	      }
	  }

	  cmdUnfollow(parsedMsg){
	    var self = this;
	      if(self.voiceEvents){
	        self.Follow(parsedMsg.msg.author);
	        console.log("[VoiceManager - cmdUnfollow ]".grey + colors.cyan(" Unfollow: " + parsedMsg.msg.author.username));
	        self.bot.sendMessage(parsedMsg.msg.channel, "```Unfollow: " + parsedMsg.msg.author.username+"```")
	      }else{
	        console.log("[VoiceManager - cmdUnfollow ]".grey + " Voice events no enabled!".red);
	      }
	  }


	}

	function GetServerIDByName(name, server){
	  for (var i = 0; i < server.channels.length; i++) {
	    var current = server.channels[i];
	    if(current.type == "voice" && current.name == name){
	      return current.id;
	    }
	  }
}

module.exports = AudioManager;
