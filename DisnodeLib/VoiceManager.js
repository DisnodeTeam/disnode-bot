"use strict"
// Each VoiceManager manages one Voice Connection
class VoiceManager {
  constructor(bot){
    this.bot = bot;
    this.retry = true;
    console.log("[VoiceManager] Init.");
  }

  OnVoiceJoin(VoiceChannel, user){
    console.log("[VoiceManager] Voice join");
    console.log("[VoiceManager] |--- User ["+user+"] " + user.username);
    console.log("[VoiceManager] |--- Channel ["+VoiceChannel+"] " + VoiceChannel.name);
    if(user == this.follow){
      this.JoinChannelWithId(VoiceChannel);
    }
  }

  OnVoiceLeave(VoiceChannel, user){
    console.log("[VoiceManager] Voice Leave");
    console.log("[VoiceManager] |--- User ["+user+"] " + user.username);
    console.log("[VoiceManager] |--- Channel ["+VoiceChannel+"] " + VoiceChannel.name);
    if(user == this.follow){
        this.LeaveChannel(VoiceChannel);
    }
  }

  Follow(user){
    console.log("[VoiceManager] Follow enabaled for: " + user);
    this.follow = user;
  }

  UnFollow(){
    this.follow = "";
  }
  checkForUserInSameServer(msg, cb){
    var f = false;
    var returnid;
    this.bot.voiceConnections.forEach(function(value){
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

function GetServerIDByName(name, server){
  for (var i = 0; i < server.channels.length; i++) {
    var current = server.channels[i];
    if(current.type == "voice" && current.name == name){
      return current.id;
    }
  }

}

module.exports = VoiceManager;
