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
			resNoName : "```Please Enter a name for this song!```",
			resNoUrl : "```Please Enter a Youtube URL for this song!```",
			resSongAdded : "```[Song] Added!```",
      resFollow : "**Following: ** [Sender]",
      resUnFollow : "**Stop Following: ** [Sender]"
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



module.exports = MusicManager;
