"use strict"
class SayManager{
  constructor(options){
    this.options = options;
  }
  cmdAddSay(parsedMsg){
    var self = this;
    var command = parsedMsg.params[0];
    var say = parsedMsg.params[1];
    if(!command){
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, "Please Enter a Command (First Parameter)" );
    }
    if(!say){
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, "Please Enter a Say (Secound Parameter)" );
    }
    if(command && say){
      self.addSayCommand(command, say);
    }
  }
  addSayCommand(command, say){
    var self = this;
    if(self.options.disnode.ConfigManager){
      var config = self.options.disnode.ConfigManager.config;
      console.log(config);

      var newSayComand = {
        cmd: command,
        run: "cmdSay",
        context: "SayManager",
        desc: "null",
        usage: command,
        params: {
          sayText: say
        }
      }

      config.commands.push(newSayComand);
      self.options.disnode.ConfigManager.saveConfig();
      console.log("[SayManager] New Say Command Added!");

    }else{
      console.log("[SayManager] No Config Manager Loaded!");
    }
  }

  cmdSay(parsedMsg, params){
    var self = this;

    var final = params.sayText;
    if(final.includes("[Sender]")){
      final = final.replace("[Sender]", parsedMsg.msg.author.mention());
    }

    if(final.includes("[Param0]")){
      final = final.replace("[Param0]", parsedMsg.params[0]);
    }
    if(final.includes("[Param1]")){
      final = final.replace("[Param1]", parsedMsg.params[1]);
    }
    if(final.includes("[Param2]")){
      final = final.replace("[Param2]", parsedMsg.params[2]);
    }

    self.options.disnode.bot.sendMessage(parsedMsg.msg.channel,  final);
  }
}

function GetMsgOffCommand(cmdName, list){
  var found = null;
  for(var i=0;i<list.length;i++)
  {
    if(list[i].cmd == cmdName){
      found = list[i];
    }
  }

  return found;
}

module.exports = SayManager;
