"use strict";
const EventEmitter = require("events");
const Discord = require( "discord.js");
const FS = require('fs');

const DisnodeAudioPlayer = require("./AudioPlayer.js");
<<<<<<< HEAD
const CommandHandler = require("./CommandHandler.js");
const VoiceManager = require("./VoiceManager.js");
=======
const DisnodeCommandHandler = require("./CommandHandler.js");
const DisnodeVoiceManager = require("./VoiceManager.js");

>>>>>>> origin/master

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

  enableVoiceManager(){
    var self = this;
    if(!self.voice){
      self.voice = {};
    }
    self.voice = new VoiceManager(self.bot);
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
      desc:"Plays an audio file.",
      usage:self.command.prefix + "play [filename] [volume]"});

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
  // - maxVolume: -1 (no Max), Value to restrict volume too
  // - defaultVolume: Default Play Volume
  enableAudioPlayer(options){
    // HACK: Set _this
    var _this = this;
    // Let Audioplayer, else you will get a null error later.
    _this.audioPlayer = {};

    if(!_this.voice){
      console.log("[WARN] Couldn't find a VoiceManager, (was this initialized before VoiceManager?) VoiceManager is required to join and leave voice channels to play audio on");
    }
    // Check if there is the path varible
    if(options.path){
      // If there is a path, set it
      _this.audioPlayer.path = options.path;
    }else{
      // Else set it to the default
      _this.audioPlayer.path = "./Audio/";
    }
    if(options.maxVolume){
      if(options.maxVolume == -1){
        _this.audioPlayer.maxVolume = 9999999;
      }else{
        _this.audioPlayer.maxVolume = options.maxVolume;
      }
    }else{
      _this.audioPlayer.maxVolume = 2.0;
    }
    if(options.defaultVolume){
      _this.audioPlayer.defaultVolume = options.defaultVolume;
    }else{
      _this.audioPlayer.defaultVolume = 0.8;
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

  cmdPlay(parsedMsg){
    var self = this;
    if(!self.audioPlayer && !self.audioPlayer.player){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Audio Player not Enabled! ```");
      return;
    }
    if(!self.voice){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` VoiceManager not Enabled! (VoiceManager is required for AudioPlayer) ```");
      return;
    }

    var found = false;
    var channelID;
    self.voice.checkForUserInSameServer(parsedMsg.msg, function cb(returnID){
      channelID = returnID;
      if(channelID == 0){
        found = false;
      }else{
        found = true;
      }
    });

    var fileName = parsedMsg.params[0];
    if(found){
      if(parsedMsg.params[1]){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play File: " + fileName + ".mp3, with a volume of " + parsedMsg.params[1] + " ```");
        self.audioPlayer.playFile(fileName, parsedMsg.params, self.audioPlayer.defaultVolume,self.audioPlayer.maxVolume, channelID,function(text){
          if(text === "loud"){
            self.bot.sendMessage(parsedMsg.msg.channel, "``` Volume over threshold of " + self.audioPlayer.maxVolume + "! Remains default (" + self.audioPlayer.defaultVolume +") ```");
          }
        });
      }else{
        self.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play File: " + fileName + ".mp3 ```");
        self.audioPlayer.playFile(fileName, parsedMsg.params, self.audioPlayer.defaultVolume, self.audioPlayer.maxVolume, channelID,function(text){};
      }
    }else{
      self.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
    }
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
