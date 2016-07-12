"use strict"
class SayManager{
  constructor(options){
    this.options = options;


    this.defaultConfig = {
      responses:{
        errEnterCommand: "Please Enter a Command (First Parameter)",
        errEnterSay: "Please Enter a Say (Secound Parameter)"
      },
      commands:[
        {
          "cmd": "addSay",
          "context": "SayManager",
          "run": "cmdAddSay",
          "desc": "Tests Context Calling!",
          "usage": "testcontext"
        },
      ]
    };

    this.config = this.options.disnode.config.SayManager;
  }
  cmdAddSay(parsedMsg){
    var self = this;
    var command = parsedMsg.params[0];
    var say = parsedMsg.params[1];
    if(!command){
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, self.config.responses.errEnterCommand );
    }
    if(!say){
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, self.config.responses.errEnterSay );
    }
    if(command && say){
      self.addSayCommand(command, say);
    }
  }
  addSayCommand(command, say){
    var self = this;
      var config = self.options.disnode.config;

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
      self.options.disnode.saveConfig();
      console.log("[SayManager] New Say Command Added!");


  }

  cmdSay(parsedMsg, params){
    var self = this;


    var printText = self.options.disnode.parseString(params.sayText,parsedMsg);
    self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, printText);
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
