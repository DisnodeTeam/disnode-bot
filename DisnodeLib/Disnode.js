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
    console.log("[Disnode] Loading Defaults for: " + name);
    self.config[name] = {};
    self.config[name] = config;
    self.saveConfig();
  }

  addDefaultManagerCommands(name, commands){
    var self = this;
    console.log("[Disnode] Loading Commands for: " + name);
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

  


}
module.exports = Disnode;
