"use strict"
// Each VoiceManager manages one Voice Connection
class VoiceManager {
  constructor(bot){
    this.bot = bot;
    this.retry = true;
  }
  SetOnVoiceJoin(onVoiceJoin){
    this.onVoiceJoin = onVoiceJoin;
  }
  SetOnVoiceLeave(onVoiceLeave){
    this.onVoiceLeave = onVoiceLeave;
  }

  Follow(user){
    this.follow = true;
  }

  UnFollow(){
    this.follow = true;
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
      if(this.retry){
        var nameConvert = name.replace(/-/g, " ");
        console.log(nameConvert);
        this.JoinChannel(nameConvert, server)
        this.retry = false;
        console.log("RETRY!");
      }
    }
  }

  LeaveChannel(id){
    this.bot.leaveVoiceChannel(currentChannel);
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
