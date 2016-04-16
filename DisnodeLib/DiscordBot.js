"use strict";
var Discord = require("discord.js");

class DiscordBot{
  constructor(name, token){
    this.name = name;
    this.token = token;

  }

  SetOnReady(onReady){
    this.OnReady = onReady;
  }

  SetOnMessage(_OnMessage){
    this.OnMessage = _OnMessage;
  }

  Start(){
    console.log("["+this.name+"] Starting Bot...");
    this.client = new Discord.Client();
    this.client.loginWithToken(this.token);

    this.client.on("ready",this.OnReady);
    this.client.on("message", this.OnMessage);
    console.log(this.name);
  }
  SendMessage(channel, msg){
    this.client.sendMessage(channel,msg);
  }


}

module.exports.botObject = DiscordBot;
