"use strict";
const EventEmitter = require("events");
const Discord = require( "discord.js");
const FS = require('fs');
const Cleverbot = require('cleverbot-node');

const DisnodeAudioPlayer = require("./AudioPlayer.js");
const CommandHandler = require("./CommandHandler.js");
const DisnodeVoiceManager = require("./VoiceManager.js");
const DisnodeBotCommunication = require("./BotCommunication.js");
const CleverManager = require("./CleverManager.js");

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
    self.cleverMessage(msg);
    if(self.command && self.command.handler){
      self.command.handler.RunMessage(msg);
    }
    this.emit("Bot_RawMessage", msg);
  }
  enableCleverManager(options){
    var self = this;
    console.log("[Cleverbot] Init");
    if(!self.clever){
      self.clever = {};
    }
    if(options.channelid){
      self.clever.channelid = options.channelid;
    }else{
      self.clever.channelid = "185614233168248833"
    }
    self.clever.bot = new Cleverbot;
    self.clever.enabled = false;
    self.clever.manager = new CleverManager(self.clever.bot);
    Cleverbot.prepare(function(){});
  }
  enableCommandHandler(options){
    var self = this;

    if(!self.command){
      self.command = {};
    }
    if(options.prefix){
      self.command.prefix = options.prefix;
    }else{
      self.command.prefix = "!"
    }
    if(options.list){
      self.command.list = options.list;
    }else{
      self.command.list = [];
    }

    this.command.handler = new CommandHandler(self.command.prefix, self.command.list);
  }

  addDefaultCommands(){
    var self = this;
    if(!self.command.list){
      self.command.list = [];
    }

    self.command.list.push({cmd:"test", run: (msg) => this.cmdTest(msg), desc:"Test Command that lists all params.", usage:self.command.prefix + "test [parms]"});
    self.command.list.push({cmd:"help", run: (msg) => this.cmdHelp(msg), desc:"Displays Help.", usage:self.command.prefix + "help"});
    self.command.list.push({cmd:"clever", run: (msg) => this.cmdCLEVER(msg), desc:"Cleverbot.", usage:self.command.prefix + "clever [Phrase, or new to refresh cleverbot]"});
    self.command.list.push({cmd:"list", run: (msg) => this.cmdListAudio(msg), desc:"Displays list of Audio Files.", usage:self.command.prefix + "list [page]"});
    self.command.list.push({cmd:"jv", run: (msg) => this.cmdJoinVoice(msg), desc:"Joins the voice channel you are connected to.", usage:self.command.prefix + "jv"});
    self.command.list.push({cmd:"lv", run: (msg) => this.cmdLeaveVoice(msg), desc:"Leaves the voice channel you are connected to.", usage:self.command.prefix + "lv"});
    self.command.list.push({cmd:"play", run: (msg) => this.cmdPlay(msg), desc:"Plays an audio file.", usage:self.command.prefix + "play [filename] [volume]"});
    self.command.list.push({cmd:"stop", run: (msg) => this.cmdStop(msg), desc:"Stops all audio.", usage:self.command.prefix + "stop"});
    self.command.list.push({cmd:"follow", run: (msg) => this.cmdFollow(msg), desc:"Test Command that lists all params.", usage:self.command.prefix + "follow [parms]"});
    self.command.list.push({cmd:"unfollow", run: (msg) => this.cmdUnfollow(msg), desc:"Test Command that lists all params.", usage:self.command.prefix + "unfollow [parms]"});

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
    _this.audioPlayer.player = new DisnodeAudioPlayer(_this.bot, FS, _this, this.audioPlayer.path);
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

  enableBotCommunication(options){
    var self = this;
    if(!self.communication){
      self.communication = {};
    }

    self.communication.manager = new DisnodeBotCommunication(self.bot.user.id);
    self.communication.manager.Start();
  }
  cmdCLEVER(parsedMsg){
    var self = this;
    if(parsedMsg.params[0] == "new"){
      self.clever.bot = new Cleverbot;
      this.bot.sendMessage(parsedMsg.msg.channel, "```Cleverbot has been Refreshed```");
    }else{
      if(self.clever.enabled){
        self.clever.enabled = false;
        this.bot.sendMessage(parsedMsg.msg.channel, "```Cleverbot is no longer active```");
      }else {
        self.clever.enabled = true;
        self.bot.sendMessage(self.clever.channelid, parsedMsg.params[0]);

      }
    }
  }
  cleverMessage(msg){
    var self = this;
    if(!self.clever){
      return;
    }

    if(msg.author.name == self.bot.user.username){
      if(self.clever.enabled && msg.channel.id == self.clever.channelid){
        setTimeout(function f(){
          self.clever.manager.sendMsg(msg.content,function cb(reply){
            self.bot.sendMessage(msg.channel, reply);
          });
        }, 1000);
      }
    }
  }
  cmdTest(parsedMsg){
    var self = this;
    self.bot.sendMessage(parsedMsg.msg.channel, "TEST!!!!!!");
  }
  cmdHelp(parsedMsg){
    var self = this;
    var SendString = "``` === HELP === \n";
    for (var i = 0; i < self.command.list.length; i++) {
  		var cmd = self.command.list[i];
  		//cmd.cmd, cmd.desc,cmd.usage
      SendString = SendString + "-"+self.command.prefix+cmd.cmd+" : "+cmd.desc+" - " + cmd.usage + "\n";
  		SendString = SendString + "\n";
  	}
  	SendString = SendString + "```";
  	self.bot.sendMessage(parsedMsg.msg.channel, SendString);
  }
  cmdPlay(parsedMsg){
    var self = this;
    if(!self.audioPlayer && !self.audioPlayer.player){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Audio Player not Enabled! ```");
      return;
    }
    if(!self.voice && !self.voice.manager){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` VoiceManager not Enabled! (VoiceManager is required for AudioPlayer) ```");
      return;
    }

    var fileName = parsedMsg.params[0];
    self.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play File: " + fileName + ".mp3 ```");
    self.audioPlayer.player.playFile(fileName, parsedMsg, parsedMsg.params, self.audioPlayer.defaultVolume, self.audioPlayer.maxVolume,function(text){
      if(text === "loud"){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` Volume over threshold of " + self.audioPlayer.maxVolume + "! Remains default (" + self.audioPlayer.defaultVolume +") ```");
      }
      if(text === "notfound"){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
      }
    });
  }
  cmdStop(parsedMsg){
    var self = this;
    if(!self.audioPlayer && !self.audioPlayer.player){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Audio Player not Enabled! ```");
      return;
    }
    if(!self.voice && !self.voice.manager){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` VoiceManager not Enabled! (VoiceManager is required for AudioPlayer) ```");
      return;
    }

    self.bot.sendMessage(parsedMsg.msg.channel, "``` Playback stopped! ```");
    self.audioPlayer.player.stopPlaying(parsedMsg, function cb(text){
      if(text === "notfound"){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
      }
    });
  }
  cmdJoinVoice(parsedMsg){
    var self = this;
  	if(parsedMsg.msg.author.voiceChannel){
  		var id = parsedMsg.msg.author.voiceChannel;
  		self.voice.manager.JoinChannelWithId(id);
  		self.bot.sendMessage(parsedMsg.msg.channel, "``` Joined the channel you are in! ```");
  	}else {
  		bot.sendMessage(parsedMsg.msg.channel, "``` You are not in a voice Channel ```");
  	}

  }
  cmdLeaveVoice(parsedMsg){
    var self = this;
    if (parsedMsg.msg.author.voiceChannel){
  		var id = parsedMsg.msg.author.voiceChannel;
      self.voice.manager.LeaveChannel(id);
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Left the channel you are in! ```");
    }else {
  		bot.sendMessage(parsedMsg.msg.channel, "``` You are not in a voice Channel ```");
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
  cmdListAudio(parsedMsg){
    var self = this;
    var Page = 1;
    if(parsedMsg.params[0]){
      Page = parseInt(parsedMsg.params[0]);
    }


    var ResultsPerPage = 15;
    var Start = (Page * ResultsPerPage) - ResultsPerPage;
    var CurrentIndex = 0;

    var SendString = "``` === AUDIO CLIPS (Page: "+Page+")=== \n";
    self.audioPlayer.player.listAll("./Audio/", function(name){
      CurrentIndex++;
      if(CurrentIndex >= Start)
      {
        if(CurrentIndex < Start + ResultsPerPage)
        {
          SendString = SendString + "-"+name+ "\n";
        }
      }

    }, function(){
      SendString = SendString + "```";
      self.bot.sendMessage(parsedMsg.msg.channel, SendString);
    });

  }



}
module.exports = DiscordBot;
