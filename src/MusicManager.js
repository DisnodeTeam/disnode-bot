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
		      "cmd": "clearqueue",
		      "context": "MusicManager",
		      "run": "cmdClearQueue",
		      "desc": "Stopps and Clears all URLS's in Queue",
		      "usage": "clearqueue",
		    },
		    {
		      "cmd": "resume",
		      "context": "MusicManager",
		      "run": "cmdResume",
		      "desc": "Resumes Connection",
		      "usage": "resume",
		    },
        {
		      "cmd": "pause",
		      "context": "MusicManager",
		      "run": "cmdPause",
		      "desc": "Pauses Connection",
		      "usage": "resume",
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
      resMaxVolume: "**Max Volume([MaxVolume]) Reached! Playing at: [DefaultVolume].**",
      resResume: "**Resuming the queue!**",
      resAddedToQueue: "**Added to the queue!**",
      resPause: "**Pausing the queue!**",
      resClearQueue: "**Clearing the queue!**"
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
    connection.ytStream = ytdl(connection.queue[0], {audioonly: true});
    connection.ytStream.on('end', function(){
      if(connection.queue.length == 0){
        connection.playRunning = false;

      }else{
        self.playStream(connection);
        //connection.ytStream.destory();
      }
    });
    connection.queue.splice(0,1);
		connection.playRawStream(connection.ytStream);
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

  cmdPause(parsedMsg){
    var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

    if(connection){
      connection.pause();
      this.disnode.sendResponse(parsedMsg, this.config.resPause);
    }else{
      this.disnode.sendResponse(parsedMsg, this.config.resNotInServer);
    }
  }

  cmdResume(parsedMsg){
    var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

    if(connection){
      connection.resume();
      this.disnode.sendResponse(parsedMsg, this.config.resResume,{parse: true});
    }else{
      this.disnode.sendResponse(parsedMsg, this.config.resNotInServer,{parse: true});
    }
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
          {shortcut: "[RequestedVolume]", data: vol}
        ];
        self.disnode.sendResponse(parsedMsg, self.config.resMaxVolume, {parse: true, shortcuts: shortcuts})
      }
    });
    var channel = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

    if(channel){
      var shortcutsAdd = [
        {shortcut: "[url]", data: url},
        {shortcut: "[channel]", data: channel.voiceChannel.name},
        {shortcut: "[vol]", data: vol},
      ];
      this.addUrl(url,channel,vol);
      this.disnode.sendResponse(parsedMsg, self.config.resAddedToQueue, {parse: true, shortcuts: shortcutsAdd});
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
      this.playStream(connection,0.8);
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

  cmdClearQueue(parsedMsg){
    var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

    if(connection){
      connection.queue = [];
      connection.stopPlaying();
      this.disnode.sendResponse(parsedMsg, this.config.resClearQueue);
    }else{
      this.disnode.sendResponse(parsedMsg, this.config.resNotInServer);
    }
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
