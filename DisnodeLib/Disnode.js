"use strict";
const EventEmitter = require("events");
const Discord = require( "discord.js");
const jsonfile = require('jsonfile');
const colors = require('colors');

class Disnode extends EventEmitter{
  constructor(key, configPath){
    super();

    this.key = key;
    this.configPath = configPath;
    this.config = {};
  }

  startBot(){
    var self = this;

    this.bot = new Discord.Client();


    this.bot.loginWithToken(this.key);

    this.bot.on("ready", () => this.botReady())
    this.bot.on("message", (msg) => this.botRawMessage(msg));


    this.botInit();

  }

  saveConfig(){
    var self = this;
    jsonfile.writeFile(self.configPath, self.config, {spaces: 2}, function(err) {
        console.error(err);
        console.log("[Disnode] Config Saved!".green);
    });
  }

  loadConfig(cb){
    var self = this;
    console.log("[Disnode] Loading Config: " + self.configPath);
    jsonfile.readFile(self.configPath, function(err, obj) {
      if(err){
        console.log(colors.red(err));
      }
      console.log("[Disnode] Config Loaded!".green);
      self.config = obj;
      cb();
    });
  }

  addDefaultManagerConfig(name,config){
    var self = this;
    console.log("[Disnode] Loading Defaults for: " + name);
    self.config[name] = {};
    self.config[name] = config;
    self.saveConfig();
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
    if(self.CommandHandler){
      self.CommandHandler.RunMessage(msg);
    }
    this.emit("Bot_RawMessage", msg);
  }

  addManager(data){
    var self = this;
    var path;
    var option = data.options;
    option.disnode = self;

    if(data.path){
      path = data.path;
    }else{
      path = "./"+data.name+".js";
    }



    self[data.name] = {};
    self[data.name].package = require(path);
    self[data.name] = new self[data.name].package(option);

    if(!self.config[data.name] && self[data.name].defaultConfig){
      self.addDefaultManagerConfig([data.name],self[data.name].defaultConfig);
    }

    if(self.CommandHandler){
      this.CommandHandler.AddContext(self[data.name], data.name);
    }

  }
  postLoad(){
    var self = this;
    if(self.CommandHandler){
      this.CommandHandler.AddContext(self, "disnode");
    }
    //console.dir(self.YoutubeManager);
  }

  //TO-DO: Remove / Outdated
  addDefaultCommands(){
    var self = this;
    if(!self.CommandHandler.list){
      self.CommandHandler.list = [];
    }
    self.CommandHandler.UpdateList(self.CommandHandler.list);
  }

  //TO-DO: Remove / Outdated
  enableBotCommunication(options){
    var self = this;
    if(!self.communication){
      self.communication = {};
    }

    self.communication.manager = new DisnodeBotCommunication(self.bot.user.id);
    self.communication.manager.Start();
  }

  cmdWA(parsedMsg){
    var self = this;
    if(!self.Wolfram){
      self.bot.sendMessage(parsedMsg.msg.channel, "Wolfram is not enabled on this bot");
      return;
    }

    var wolfmsg;
  	self.bot.sendMessage(parsedMsg.msg.channel, "``` Waiting on Wolfram API Q: " + parsedMsg.params[0] +" Options: " + parsedMsg.params[1] + " " + parsedMsg.params[2] + " ```", function(err, sent) {
  		wolfmsg = sent;
  		console.log(err);
  	});
  	self.Wolfram.makeRequest(parsedMsg.params, "img", function(text){
      if(text === "NO_QUESTION"){
        console.log("[Wolfram] No Question!");
        self.bot.updateMessage(wolfmsg, "```You didn't put a question in for wolfram to answer!```");
      }else if(text === "LOOKUP_ERROR"){
        self.bot.updateMessage(wolfmsg, "```There was an error when looking up your question sorry!```");
      }else{
        self.bot.updateMessage(wolfmsg, text);
      }
  	});
  }
  cmdCLEVER(parsedMsg){
    var self = this;
    if(!self.CleverManager){
      self.bot.sendMessage(parsedMsg.msg.channel, "Cleverbot is not enabled on this bot");
      return;
    }

    if(parsedMsg.params[0] == "new"){
      self.CleverManager.cb = new Cleverbot;
      self.bot.sendMessage(parsedMsg.msg.channel, "```Cleverbot has been Refreshed```");
    }else{
      if(self.CleverManager.enabled){
        self.CleverManager.enabled = false;
        self.bot.sendMessage(parsedMsg.msg.channel, "```Cleverbot is no longer active```");
      }else {
        self.CleverManager.enabled = true;
        self.bot.sendMessage(self.CleverManager.channelid, parsedMsg.params[0]);

      }
    }
  }
  cleverMessage(msg){
    var self = this;
    if(!self.CleverManager){
      return;
    }

    if(msg.author.name == self.bot.user.username){
      if(self.CleverManager.enabled && msg.channel.id == self.CleverManager.channelid){
        setTimeout(function f(){
          self.CleverManager.sendMsg(msg.content,function cb(reply){
            self.bot.sendMessage(msg.channel, reply);
          });
        }, 1500);
      }
    }
  }
  cmdTest(parsedMsg){
    var self = this;

    self.bot.sendMessage(parsedMsg.msg.channel, "Test Command: " + parsedMsg.params);
  }
  cmdHelp(parsedMsg){
    var self = this;

    var SendString = "``` === HELP === \n";
    for (var i = 0; i < self.CommandHandler.list.length; i++) {
  		var cmd = self.CommandHandler.list[i];
  		//cmd.cmd, cmd.desc,cmd.usage
      SendString = SendString + "-"+self.CommandHandler.prefix+cmd.cmd+" : "+cmd.desc+" - " + self.CommandHandler.prefix+ cmd.usage + "\n";
  		SendString = SendString + "\n";
  	}
  	SendString = SendString + "```";
  	self.bot.sendMessage(parsedMsg.msg.channel, SendString);
  }
  cmdPlay(parsedMsg){
    var self = this;
    if(!self.AudioPlayer){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Audio Player not Enabled! ```");
      return;
    }
    if(!self.VoiceManager){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` VoiceManager not Enabled! (VoiceManager is required for AudioPlayer) ```");
      return;
    }

    var fileName = parsedMsg.params[0];
    self.bot.sendMessage(parsedMsg.msg.channel, "``` Attempting to Play File: " + fileName + ".mp3 ```");
    self.AudioPlayer.playFile(fileName, parsedMsg,function(text){
      if(text === "loud"){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` Volume over threshold of " + self.AudioPlayer.maxVolume + "! Remains default (" + self.AudioPlayer.defaultVolume +") ```");
      }
      if(text === "notfound"){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
      }
    });
  }
  cmdStop(parsedMsg){
    var self = this;
    if(!self.AudioPlayer){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Audio Player not Enabled! ```");
      return;
    }
    if(!self.VoiceManager){
      self.bot.sendMessage(parsedMsg.msg.channel, "``` VoiceManager not Enabled! (VoiceManager is required for AudioPlayer) ```");
      return;
    }

    self.bot.sendMessage(parsedMsg.msg.channel, "``` Playback stopped! ```");
    self.AudioPlayer.stopPlaying(parsedMsg, function cb(text){
      if(text === "notfound"){
        self.bot.sendMessage(parsedMsg.msg.channel, "``` You must be inside a channel that the bot is in to request a File ```");
      }
    });
  }
  cmdJoinVoice(parsedMsg){
    var self = this;
  	if(parsedMsg.msg.author.voiceChannel){
  		var id = parsedMsg.msg.author.voiceChannel;
  		self.VoiceManager.JoinChannelWithId(id);
  		self.bot.sendMessage(parsedMsg.msg.channel, "``` Joined the channel you are in! ```");
  	}else {
  		self.bot.sendMessage(parsedMsg.msg.channel, "``` You are not in a voice Channel ```");
  	}

  }
  cmdLeaveVoice(parsedMsg){
    var self = this;
    if (parsedMsg.msg.author.voiceChannel){
  		var id = parsedMsg.msg.author.voiceChannel;
      self.VoiceManager.LeaveChannel(id);
      self.bot.sendMessage(parsedMsg.msg.channel, "``` Left the channel you are in! ```");
    }else {
  		self.bot.sendMessage(parsedMsg.msg.channel, "``` You are not in a voice Channel ```");
  	}
  }

  cmdFollow(parsedMsg){
    var self = this;
    if(self.VoiceManager){
      if(self.VoiceManager.voiceEvents){
        self.VoiceManager.Follow(parsedMsg.msg.author);
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
    if(self.VoiceManager){
      if(self.VoiceManager.voiceEvents){
        self.VoiceManager.Follow(parsedMsg.msg.author);
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
    self.AudioPlayer.listAll("./Audio/", function(name){
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

  cmdTestConfig(parsedMsg){
    var self = this;
    self.bot.sendMessage(parsedMsg.msg.channel, "Test Worked!");
  }



}
module.exports = Disnode;
