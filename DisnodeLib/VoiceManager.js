"use strict"
// Each VoiceManager manages one Voice Connection
class VoiceManager {
  constructor(bot){
    this.bot = bot;
    this.retry = true;
  }

  OnVoiceJoin(VoiceChannel, user){
    if(user.username == this.follow){
      this.JoinChannelWithId(VoiceChannel);
    }
  }

  OnVoiceLeave(VoiceChannel, user){
    if(user.username == this.follow){
        this.LeaveChannel(VoiceChannel);
    }
  }

  Follow(user){
    this.follow = user;
  }

  UnFollow(){
    this.follow = "";
  }
  checkForUserInSameServer(bot, msg, cb){
    var f = false;
    var returnid;
    bot.voiceConnections.forEach(function(value){
      console.log("[VoiceManager] VoiceConnection: "+ value.voiceChannel);
      if(value.voiceChannel == msg.author.voiceChannel){
        console.log("[VoiceManager] VoiceMatch: "+ value.voiceChannel + " " + msg.author.voiceChannel);
        f = true;
        returnid = value.voiceChannel
        console.log("[VoiceManager] Return ID: "+ returnid);
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
      console.log("[VoiceManager] Found Server: " + id);
      this.currentChannel = id;
      console.log(this.bot);
      this.bot.joinVoiceChannel(id);
      console.log(this.bot);
    }else{
      console.log("[VoiceManager] Failed to Find Server: " + id);
      if(this.retry == true){
        var nameConvert = name.replace(/-/g, " ");
        console.log(nameConvert);
        this.retry = false;
        this.JoinChannel(nameConvert, server)

      }
    }
  }

  JoinChannelWithId(id,cb){
    this.bot.joinVoiceChannel(id,cb);
  }

  LeaveChannel(id){
    this.bot.leaveVoiceChannel(id);
    this.currentChannel = "";

  }


}

function GetServerIDByName(bot, name, server){
  for (var i = 0; i < server.channels.length; i++) {
    var current = server.channels[i];
    if(current.type == "voice" && current.name == name){
      return current.id;
    }
  }

}

module.exports.VoiceManager = VoiceManager;
