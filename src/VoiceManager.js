"use strict"
const colors = require('colors');
// Each VoiceManager manages one Voice Connection
class VoiceManager {
  constructor(options){
    this.bot = options.disnode.bot;

    this.defaultConfig = {
      commands:[
        {
          "cmd": "jv",
          "context": "VoiceManager",
          "run": "cmdJoinVoice",
          "desc": "Joins the voice channel you are connected to.",
          "usage": "jv"
        },
        {
          "cmd": "lv",
          "context": "VoiceManager",
          "run": "cmdLeaveVoice",
          "desc": "Leaves the voice channel you are connected to.",
          "usage": "lv",
        },
        {
          "cmd": "follow",
          "context": "VoiceManager",
          "run": "cmdFollow",
          "desc": "Test Command that lists all params.",
          "usage": "follow [User]",
        },
        {
          "cmd": "unfollow",
          "context": "VoiceManager",
          "run": "cmdUnfollow",
          "desc": "Test Command that lists all params.",
          "usage": "unfollow [parms]",
        },
      ]
    };



    if(options.voiceEvents == true){
        this.voiceEvents = true;
       options.disnode.bot.on("voiceJoin", (c,u)=>this.OnVoiceJoin(c,u));
       options.disnode.bot.on("voiceLeave", (c,u)=>this.OnVoiceLeave(c,u));
    }else{
      this.voiceEvents = false;
    }
    this.retry = true;

    this.disnode = options.disnode;
    console.log("[VoiceManager]".grey + " Init.".green);
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
      console.log(this.bot);
      this.disnode.bot.joinVoiceChannel(id);
      console.log(this.bot);
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
    this.currentChannel = "";

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

module.exports = VoiceManager;
