"use strict"

class HelpManager{
  constructor(options){

    this.defaultConfig = {
      commands:[
        {
          "cmd": "help",
          "context": "HelpManager",
          "run": "cmdHelp",
          "desc": "Displays Help.",
          "usage": "help"
        }
      ]
    }

    var self = this;
    //Created Class Varables for Disnode and Options
    self.disnode = options.disnode;
    self.options = options;
    // Loads Config.
    self.config = self.disnode.config.TestManager;
    //Defaults if saying isn't provided

  }

  cmdHelp(parsedMsg){
    var self = this;

    var SendString = "``` === HELP === \n";
    for (var i = 0; i < self.disnode.CommandHandler.list.length; i++) {
      var cmd = self.disnode.CommandHandler.list[i];
      //cmd.cmd, cmd.desc,cmd.usage
      SendString = SendString + "-"+self.disnode.CommandHandler.prefix+cmd.cmd+" : "+cmd.desc+" - " + self.disnode.CommandHandler.prefix+ cmd.usage + "\n";
      SendString = SendString + "\n";
    }
    SendString = SendString + "```";
    self.disnode.bot.sendMessage(parsedMsg.msg.channel, SendString);
  }

}
module.exports = HelpManager;
