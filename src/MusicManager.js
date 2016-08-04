"use strict"
const colors = require('colors');
const walk = require('walk');
const fs = require("fs");
const ytdl = require('ytdl-core');

class MusicManager{
  constructor(options){
    this.options = options;
    this.disnode = options.disnode;

    this.following = [];


    this.defaultConfig = {
      commands:[
				{
		      "cmd": "list",
		      "context": "MusicManager",
		      "run": "cmdListAudio",
		      "desc": "Displays list of Audio Files.",
		      "usage": "list [page]",
		    },
		    {
		      "cmd": "play",
		      "context": "MusicManager",
		      "run": "cmdPlay",
		      "desc": "Plays an audio file.",
		      "usage": "play [filename] [volume]",
		    },
        {
		      "cmd": "skip",
		      "context": "MusicManager",
		      "run": "cmdSkip",
		      "desc": "Displays list of Audio Files.",
		      "usage": "list [page]",
		    },
				{
		      "cmd": "stream",
		      "context": "MusicManager",
		      "run": "cmdStream",
		      "desc": "Plays an audio file.",
		      "usage": "play [url] [volume]",
		    },
				{
		      "cmd": "addsong",
		      "context": "MusicManager",
		      "run": "cmdAddSong",
		      "desc": "Adds a song",
		      "usage": "addsong [name] [url]",
		    },
		    {
		      "cmd": "stop",
		      "context": "MusicManager",
		      "run": "cmdStop",
		      "desc": "Stops all audio.",
		      "usage": "stop",
		    },
				{
          "cmd": "jv",
          "context": "MusicManager",
          "run": "cmdJoinVoice",
          "desc": "Joins the voice channel you are connected to.",
          "usage": "jv"
        },
        {
          "cmd": "lv",
          "context": "MusicManager",
          "run": "cmdLeaveVoice",
          "desc": "Leaves the voice channel you are connected to.",
          "usage": "lv",
        },
        {
          "cmd": "follow",
          "context": "MusicManager",
          "run": "cmdFollowUser",
          "desc": "Test Command that lists all params.",
          "usage": "follow [User]",
        },
        {
          "cmd": "unfollow",
          "context": "MusicManager",
          "run": "cmdUnFollowUser",
          "desc": "Test Command that lists all params.",
          "usage": "unfollow [parms]",
        }
			],
			songs: [],
      maxVolume: 3,
      defaultVolume: 0.8,
			resNoName : "```Please Enter a name for this song!```",
			resNoUrl : "```Please Enter a Youtube URL for this song!```",
			resSongAdded : "```[Song] Added!```",
      resFollow : "**Following: ** [Sender]",
      resUnFollow : "**Stop Following: ** [Sender]",
      resJoiningServer: "**Joining Server: ** [Server]",
      resNotInServer: "**Can't Join You! Try Joining a Channel First!**",
      resMaxVolume: "**Max Volume([MaxVolume]) Reached! Playing at: [DefaultVolume].**"
    };

    this.config = this.disnode.config.MusicManager || this.defaultConfig;

    if(options.voiceEvents == true){
       options.disnode.bot.on("voiceJoin", (c,u)=>this.OnVoiceJoin(c,u));
       options.disnode.bot.on("voiceLeave", (c,u)=>this.OnVoiceLeave(c,u));
    }
  }

  OnVoiceJoin(channel,user){
    if(this.following.includes(user.username)){
        this.JoinServer(channel);
    }
  }

  OnVoiceLeave(channel,user){
    if(this.following.includes(user.username)){
      this.LeaveServer(channel);
    }
  }

  playStream(connection, vol){
    var self = this;
    connection.playRunning = true;
    connection.setVolume(vol);
    var stream = ytdl(connection.queue[0], {audioonly: true});
    stream.on('end', function(){
      if(stream.length == 0){
        connection.playRunning = false;

      }else{
        connection.queue.splice(0,1);
        self.playLoop(connection);
        console.log("NEXT IN queue");
      }
    });
		connection.playRawStream(stream);
  }

  addUrl(url,connection, vol){
    var bot = this.disnode.bot;

    if(!connection.queue){connection.queue = [];}
    connection.queue.push(url);
    if(!connection.playRunning){
      this.playStream(connection,vol);
    }
  }

  JoinServer(channel){
    var self = this;
    this.disnode.bot.joinVoiceChannel(channel, function(err, connnection){
      if(err){
        console.log(err);
        return;
      }
    });
  }

  LeaveServer(channel){
    var self = this;
    this.disnode.bot.leaveVoiceChannel(channel, function(err, connnection){
      if(err){
        console.log(err);
        return;
      }
    });
  }

  cmdStream(parsedMsg){
    var self = this;
    var url = parsedMsg.params[0];
    var vol = this.config.defaultConfig || .8;
    if(parsedMsg.params[1]){
      if(parseFloat(parsedMsg.params[1]) != 'NaN'){
        vol = parseFloat(parsedMsg.params[1]);
      }
    }
    GetVolume(vol, this.config, function(err, res){
      if(!err){
        vol = res;

      }
      if(err == "MAX"){
        var shortcuts = [
          {shortcut: "[DefaultVolume]", data: self.config.defaultVolume},
          {shortcut: "[MaxVolume]", data: self.config.maxVolume},
          {shortcut: "[RequestedVolume]", data: vol}];
        self.disnode.sendResponse(parsedMsg, self.config.resMaxVolume, {parse: true, shortcuts: shortcuts})
      }
    });
    var channel = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

    if(channel){
      this.addUrl(url,channel,vol);
    }
    else{
      this.disnode.sendResponse(parsedMsg, "Not In Server!");
    }
  }

  cmdJoinVoice(parsedMsg){
    var self = this;
    var channel = parsedMsg.msg.author.voiceChannel;
    var shortcuts = [{
      shortcut: "[Server]",
      data: channel.name
    }];
    if(channel){
      this.JoinServer(channel);
      this.disnode.sendResponse(parsedMsg, this.config.resJoiningServer,{parse: true, shortcuts: shortcuts});
    }else{
      this.disnode.sendResponse(parsedMsg, this.config.resNotInServer,{parse: true});
    }
  }

  cmdLeaveVoice(parsedMsg){
    var channel = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections).voiceChannel;
    this.LeaveServer(channel);
  }

  cmdSkip(parsedMsg){
    var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

    if(connection){
      connection.queue.splice(0,1);

    }
  }

  cmdFollowUser(parsedMsg){
    var self = this;
    this.following.push(parsedMsg.msg.author.username);
    console.log(this.following);
    this.disnode.sendResponse(parsedMsg, this.config.resFollow,{parse: true});
  }

  cmdUnFollowUser(parsedMsg){
    var index = this.following.indexOf(parsedMsg.msg.author.username);

    this.following.splice(index,1);

    this.disnode.sendResponse(parsedMsg, this.config.resUnFollow,{parse: true});
  }

}

function GetVoiceConnectionViaMsg(msg, voiceConnections){
  var connection;

  var serverChannels = msg.server.channels;

  for (var i = 0; i < voiceConnections.length; i++) {
    var channel = voiceConnections[i].voiceChannel;

    if(serverChannels.includes(channel)){
      connection = voiceConnections[i];
    }
  }

  return connection;
}

function GetVolume(requestedVol, config, cb){
  var defaultVol = config.defaultVolume || 0.8;
  var maxVol = config.maxVolume || 1;

  if(requestedVol <= maxVol){

    cb(null,requestedVol) ;
  }else{
    cb("MAX", defaultVol);
  }
}

module.exports = MusicManager;
