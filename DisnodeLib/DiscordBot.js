"use strict";
const EventEmitter = require("events");
const Discord = require( "discord.js");
const FS = require('fs');

const DisnodeAudioPlayer = require("./AudioPlayer.js");
const DisnodeCommandHandler = require("./CommandHandler.js");
const DisnodeVoiceManager = require("./VoiceManager.js");


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
  }

  botRawMessage(msg){
    var self = this;
    if(self.command && self.command.handler){
      self.command.handler.RunMessage(msg);
    }
    this.emit("Bot_RawMessage", msg);
  }

  enableCommandHandler(options){
    var self = this;

    if(!self.command){
      self.command = {};
    }

    if(options.list){
      self.command.list = options.list;
    }else{
      self.command.list = [];
    }

    this.command.handler = new DisnodeCommandHandler(options.prefix, self.command.list);
  }

  addDefaultCommands(){
    var self = this;
    if(!self.command.list){
      self.command.list = [];
    }

    self.command.list.push({cmd:"test",
      run: (msg) => this.cmdTest(msg),
      desc:"Test Command that lists all params.",
      usage:self.command.prefix + "test [parms]"});

    self.command.list.push({cmd:"play",
      run: (msg) => this.cmdPlay(msg),
      desc:"Test Command that lists all params.",
      usage:self.command.prefix + "test [parms]"});

    self.command.list.push({cmd:"follow",
      run: (msg) => this.cmdFollow(msg),
      desc:"Test Command that lists all params.",
      usage:self.command.prefix + "test [parms]"});

    self.command.list.push({cmd:"unfollow",
      run: (msg) => this.cmdUnfollow(msg),
      desc:"Test Command that lists all params.",
      usage:self.command.prefix + "test [parms]"});

    self.command.handler.UpdateList(self.command.list);
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
      _this.audioPlayer.path = "./Audio/";
    }

    //Create Audio Player
    _this.audioPlayer.player = new DisnodeAudioPlayer(_this.bot, FS, this.audioPlayer.path);
  }

  enableVoiceManager(options){
    var self = this;
    if(!self.voice){
      self.voice = {};
    }
    self.voice.manager = new DisnodeVoiceManager(self.bot);

    if(options.voiceEvents){
      self.voice.voiceEvents = true;
      self.bot.on("voiceJoin", (c,u)=>self.voice.manager.OnVoiceJoin(c,u));
      self.bot.on("voiceLeave", (c,u)=>self.voice.manager.OnVoiceLeave(c,u));
    }
  }

  cmdTest(parsedMsg){
    var self = this;
    self.bot.sendMessage(parsedMsg.msg.channel, "TEST!!!!!!");
  }

  cmdPlayer(parsedMsg){
    var self = this;
    if(!self.audioPlayer && !self.audioPlayer.player){
      self.bot.sendMessage(parsedMsg.channel, "``` Audio Player not Enabled! ```");
      return;
    }

    var fileName = parsedMsg.params[0];
    self.audioPlayer.playFile(fileName, parsedMsg.params,channelID,function(){

    });

  }

  cmdFollow(parsedMsg){
    var self = this;
    if(self.voice && self.voice.manager){
      if(self.voice.voiceEvents){
        self.voice.manager.Follow(parsedMsg.msg.author);
        console.log("[VoiceManager - CmdFollow ] Following: " + parsedMsg.msg.author.username);
        self.bot.sendMessage(parsedMsg.msg.channel, "```Following: " + parsedMsg.msg.author.username+"```")
      }else{
        console.log("[VoiceManager - CmdFollow ] Voice events no enabled!");
      }
    }else{
      console.log("[VoiceManager - CmdFollow ] No Manager set!");
    }
  }

  cmdUnfollow(parsedMsg){
    var self = this;
    if(self.voice && self.voice.manager){
      if(self.voice.voiceEvents){
        self.voice.manager.Follow(parsedMsg.msg.author);
        console.log("[VoiceManager - cmdUnfollow ] Unfollow: " + parsedMsg.msg.author.username);
        self.bot.sendMessage(parsedMsg.msg.channel, "```Unfollow: " + parsedMsg.msg.author.username+"```")
      }else{
        console.log("[VoiceManager - cmdUnfollow ] Voice events no enabled!");
      }
    }else{
      console.log("[VoiceManager - cmdUnfollow ] No Manager set!");
    }
  }



}
module.exports = DiscordBot;
