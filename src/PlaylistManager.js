"use strict"

class PlayListManager{
  constructor(options){

    this.defaultConfig = {
      defaultSaying: "Default Saying",
      responses:{
        printSay: "[Sender] Says: [Saying]"
      },
      commands:[
        {
          cmd: "testManager",
          run: "cmdTest",
          context: "TestManager",
          usage: "testManager",
          desc: "Default Manager Test Command"
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
    if(options.saying){
      self.saying = options.saying;
    }else{
      self.saying = self.config.defaultSaying;
    }
  }
  cmdTest(parsedMsg){
    var self = this;
    var parse = self.disnode.parseString;
    //Adds Shortcut for Saying
    var customShortCuts = [{shortcut:"[Saying]", data: self.saying}];

    self.disnode.bot.sendMessage(parsedMsg.msg.channel,
      parse(self.saying,parsedMsg,customShortCuts));
  }
}
module.exports = PlayListManager;
