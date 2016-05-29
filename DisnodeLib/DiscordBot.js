"use strict";
const EventEmitter = require("events");
const Discord = require( "discord.js");
const FS = require('fs');

const DisnodeAudioPlayer = require("./AudioPlayer.js");

class DiscordBot extends EventEmitter{
  constructor(key){
    super();

    this.key = key;
  }

  startBot(){
    var self = this;

    this.bot = new Discord.Client();


    this.bot.loginWithToken(this.key);

    this.bot.on("ready", () => this.botReady())
    this.bot.on("message", (msg) => this.botRawMessage(msg));


    this.botInit();

  }

  botInit()
  {
    var self = this;
    this.emit("Bot_Init");

  }

  botReady(){
    var self = this;
    self.emit("Bot_Ready");
    console.log("TESD");
  }

  botRawMessage(msg){
    this.emit("Bot_RawMessage", msg);
  }
  botMessage(parsedMsg){
    this.emit("Bot_Message", parsedMsg);
  }

  // Enables Audio Player (Takes options obs)
  // Options For AudioPlayer
  // - path: Path of audio files
  // - volumeRestrict: -1 (no Restrict), Value to restrict volume too
  // - defaultVolume: Default Play Volume
  enableAudioPlayer(options){
    // HACK: Set _this
    var _this = this;
    // Let Audioplayer, else you will get a null error later.
    _this.audioPlayer = {};

    // Check if there is the path varible
    if(options.path){
      // If there is a path, set it
      _this.audioPlayer.path = options.path;
    }else{
      // Else set it to the default
      _this.audioPlayer.path = "./Audio";
    }

    //Create Audio Player
    _this.audioPlayer.player = new DisnodeAudioPlayer(_this.bot, FS);


  }
}
module.exports = DiscordBot;
