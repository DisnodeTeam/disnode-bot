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
  /**
   * [startBot Starts the botr]
   */
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
        if(err != null){
          console.error(err);
        }
        console.log("[Disnode]".grey + " Config Saved!".green);
    });
  }

  loadConfig(cb){
    var self = this;
    console.log("[Disnode]".grey + " Loading Config: " + self.configPath);
    jsonfile.readFile(self.configPath, function(err, obj) {
      if(err != null){
        console.log(colors.red(err));
        console.log("[Disnode]".grey + " Config Failed To Load. No Commmands will be loaded!".red);
        console.log("[Disnode]".grey + " -- Make Sure to create a botconfig with proper JSON!".red);
        return;
      }
      console.log("[Disnode]".grey + " Config Loaded!".green);
      if(!obj.commands){
        obj.commands = [];
      }
      self.config = obj;
      cb();
    });
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
    if(self.CleverManager){
      self.CleverManager.cleverMessage(msg);
    }
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
    if(self.CommandHandler){
      this.CommandHandler.AddContext(self[data.name], data.name);
    }
    if(!self.config[data.name] && self[data.name].defaultConfig){
      self.addDefaultManagerConfig([data.name],self[data.name].defaultConfig);
    }else{

    }
    if(self.config[data.name]){
      if(self.config[data.name].commands){
        self.addDefaultManagerCommands(data.name, self.config[data.name].commands);
      }
    }
  }

  addDefaultManagerConfig(name,config){
    var self = this;
    console.log("[Disnode]".grey + " Loading Defaults for: ".cyan + colors.cyan(name));
    self.config[name] = {};
    self.config[name] = config;
    self.saveConfig();
  }

  addDefaultManagerCommands(name, commands){
    var self = this;
    console.log("[Disnode]".grey + " Loading Commands for: ".cyan + colors.cyan(name));
    for (var i = 0; i < commands.length; i++) {
      if(self.CommandHandler){
        self.CommandHandler.AddCommand(commands[i]);
      }

    }

  }
  postLoad(){
    var self = this;
    if(self.CommandHandler){
      this.CommandHandler.AddContext(self, "disnode");
    }
    //console.dir(self.YoutubeManager);
  }

  sendResponse(parsedMsg,text,options){
    var self = this;
    var sendText = text;
    var channel = parsedMsg.msg.channel;
    var sentMsg;
    if(options.parse){
      sendText = self.parseString(sendText,parsedMsg,options.shortcuts);
    }
    if(options.mention){
      sendText = sendText + parsedMsg.msg.author.mention();
    }

    self.bot.sendMessage(channel, sendText, function(err,msg){
      if(err){
        console.error(err);
        return;
      }
      sentMsg = msg;
      if(options.timeout){
        self.bot.deleteMessage(sentMsg, {wait: options.timeout},function(err){
          if(err){
            console.error(err);
            return;
          }
        });
      }
    });


  }

  parseString(raw,parsedMsg, customShortCuts){
    var final = raw;

    if(customShortCuts){
      for (var i = 0; i < customShortCuts.length; i++) {
        var cur = customShortCuts[i];
        if(final.includes(cur.shortcut)){
          final = final.replace(cur.shortcut, cur.data);
        }
      }
    }

    if(final.includes("[Sender]")){
      final = final.replace("[Sender]", parsedMsg.msg.author.mention());
    }

    //TODO: Change to Dynamic Params
    if(final.includes("[Param0]")){
      final = final.replace("[Param0]", parsedMsg.params[0]);
    }
    if(final.includes("[Param1]")){
      final = final.replace("[Param1]", parsedMsg.params[1]);
    }
    if(final.includes("[Param2]")){
      final = final.replace("[Param2]", parsedMsg.params[2]);
    }
    if(final.includes("[Param3]")){
      final = final.replace("[Param3]", parsedMsg.params[3]);
    }
    if(final.includes("[Param4]")){
      final = final.replace("[Param4]", parsedMsg.params[4]);
    }
    if(final.includes("[Param5]")){
      final = final.replace("[Param5]", parsedMsg.params[5]);
    }

    return final;
  }
}
module.exports = Disnode;
