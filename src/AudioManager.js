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
		self.connections = [];
		self.queue = [];
		self.skipVotes = [];
		self.ytdlStreams = [];
		self.defaultConfig = {
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
        },
        {
          "cmd": "queue",
          "context": "AudioManager",
          "run": "cmdListQueue",
          "desc": "Lists the queue for the channel that you are in.",
          "usage": "queue",
        }
			],
			songs: [],
			resNoName : "```Please Enter a name for this song!```",
			resNoUrl : "```Please Enter a Youtube URL for this song!```",
			resSongAdded : "```[Song] Added!```",

		}
		if(options.voiceEvents == true){
      self.voiceEvents = true;
     	options.disnode.bot.on("voiceJoin", (c,u)=>this.OnVoiceJoin(c,u));
      options.disnode.bot.on("voiceLeave", (c,u)=>this.OnVoiceLeave(c,u));
    }else{
      self.voiceEvents = false;
    }
    self.retry = true;
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
	getVolume(parms){
		var self = this;
		if(parms[1]){ // If there is a second parm
			if(parseFloat(parms[1])){ //can it be parsed to a float?
				if(parseFloat(parms[1]) <= self.maxVolume){ // checks to see if the float is less than then threshold
					volume = parseFloat(parms[1]); // if it is then set the volume to the parsed float
					return volume;// actually sets the volume
				}else{ // if the parsed float is over the threshold
					console.log("[AudioManager]".grey + " Volume over threshold! Remains default".red);
				}
			}else{ // if second parm not a float
				console.log("[AudioManager]".grey + " Second Parms not Float".red);
			}
		}
		else{ // if there is no second parm at all
			console.log("[AudioManager]".grey + " No Volume Parm".red);
		}
		return self.defaultVolume;
	}
	checkForQueue(id){
		var self = this;
		for(var i = 0,len = self.queue.length; i < len; i++){
			if(self.queue[i].id == id){
				return;
			}
		}
		self.queue.push({id:id,list:[]});
	}
	checkStream(id){
		var self = this;
		for(var i = 0, len = self.ytdlStreams.length; i < len; i++){
			if(self.ytdlStreams[i].ID = id){
				self.ytdlStreams[i].Stream.destroy();
				self.ytdlStreams.splice(i,1);
			}
		}
	}
	playNextQueueItem(id){
		var self = this;
		for(var i = 0, len = self.queue.length; i < len; i++){
			if(self.queue[i].id == id){
				if(self.queue[i].list.length > 0){
					var url = self.queue[i].list[0].url;
					var vid = self.queue[i].list[0].id;
					var volume = self.queue[i].list[0].volume;
					self.queue[i].list.splice(0,1);
					self.checkStream(id);
					self.playStream(url,vid,volume,function(text){});
				}
			}
		}
	}
	playFile(name, voiceID, volume, cb){ //Plays an audio file
		var self = this;
		self.checkForQueue(voiceID);
		var song = self.getSong(name);
		if(!song){
			cb("nosong");
			return;
		}

		var connection;


		// sets up the variable and verify the voiceConnection it needs to use
		this.findConnection(voiceID, function cb(c){
			connection = c; //verified connection is sent back in the callback
		});
		if(connection.playing){
			for(var i = 0, len = self.queue.length; i < len; i++){
				if(self.queue[i].id == voiceID){
					for(var d = 0, len = self.queue[i].list.length; d < len; i++){
						if(self.queue[i].list[d].url == song.url){
							cb("foundurl");
							return;
						}
					}
					self.queue[i].list.push({url:song.url,id:voiceID,colume:volume});
					cb("queue");
					return;
				}
			}
		}
		self.checkStream(voiceID);
		connection.setVolume(volume); // sets the volume
		console.log("[AudioManager]".grey + " Streaming Audio File".cyan);
		console.log("[AudioManager]".grey + " --- Volume: " + colors.cyan(volume));
		var streamUrl = song.url;
		var str = ytdl(streamUrl);
		self.ytdlStreams.push({ID:voiceID,Stream:str});
		connection.playRawStream(str,{},function(err,intent){
			intent.on("end",function () {
				self.playNextQueueItem(voiceID);
			});
		});

	}

	playStream(streamUrl, voiceID, volume, cb){ //Plays an audio file
		var self = this;
		var connection;
		self.checkForQueue(voiceID);
		// sets up the variable and verify the voiceConnection it needs to use
		this.findConnection(voiceID, function cb(c){
			connection = c; //verified connection is sent back in the callback
		}); // sets the volume
		if(connection.playing){
			for(var i = 0, len = self.queue.length; i < len; i++){
				if(self.queue[i].id == voiceID){
					for(var d = 0, len = self.queue[i].list.length; d < len; i++){
						if(self.queue[i].list[d].url == song.url){
							cb("foundurl");
							return;
						}
					}
					self.queue[i].list.push({url:song.url,id:voiceID,colume:volume});
					cb("queue");
					return;
				}
			}
		}
		connection.setVolume(volume);
		self.checkStream(voiceID);
		console.log("[AudioManager]".grey + " Streaming Audio File".cyan);
		console.log("[AudioManager]".grey + " --- Volume: " + colors.cyan(volume));
		var str = ytdl(streamUrl);
		self.ytdlStreams.push({ID:voiceID,STREAM:str});
		connection.playRawStream(str,{},function(err,intent){
			intent.on("end",function () {
				self.playNextQueueItem(voiceID);
			});
		});
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
				self.checkStream(id);
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
			var parms = parsedMsg.params;
			var found = false;
			var volume = self.getVolume(parms);
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
				self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
				return;
			}
	    self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play Song: " + fileName +"```");
	    self.playFile(fileName,id,volume,function(text){
				if(text === "nosong"){
					self.disnode.sendResponse(parsedMsg,"No Song Found!");
				}
				if(text === "queue"){
					self.disnode.sendResponse(parsedMsg,"``` Bot is playing a song, but your song was added to the queue.```");
				}
				if(text === "foundurl"){
					self.disnode.sendResponse(parsedMsg,"``` Bot is playing a song, but your song is already in the queue.```");
				}
	    });
	  }

		cmdStream(parsedMsg){
	    var self = this;
	    var url = parsedMsg.params[0];
			var parms = parsedMsg.params;
			var volume = self.getVolume(parms);
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
				self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
				return;
			}
	    self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Streaming... ```");
	    self.playStream(url, parsedMsg,function(text){
				if(text === "queue"){
					self.disnode.sendResponse(parsedMsg,"``` Bot is playing a song, but your song was added to the queue.```");
				}
				if(text === "foundurl"){
					self.disnode.sendResponse(parsedMsg,"``` Bot is playing a song, but your song is already in the queue.```");
				}
			});
	  }
		cmdListQueue(parsedMsg){
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
			if(!found){
				self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to list the Queue ```");
				return;
			}
			console.dir(self.queue.list);
			var sendString = "Queue:\n";
			for(var i = 0, len = self.queue.length; i < len; i++){
				var index = i;
				if(self.queue[i].id == id){
					for(var f = 0, len = self.queue[index].list.length; f < len; i++){
						sendString += f + ". URL:" + self.queue[index].list[f].url + "\n";
					}
				}
			}
			self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` " + sendString + " ```");
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
