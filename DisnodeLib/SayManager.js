"use strict"
class SayManager(){
  constructor(options){
    this.options = options;
  }

  addSayCommand(command, say){
    if(options.ConfigManager){
      var config = ConfigManager.config;

      if(!config.SayCommands){
        config.SayCommands = [];
      }

      var newSayComand = {
        cmd: command,
        say: say
      }

      config.SayCommands.push(newSayComand);
      console.log("[SayManager] New Say Command Added!");

    }else{
      console.log("[SayManager] No Config Manager Loaded!");
    }
  }

  cmdSay(msg){
    var sayCommand = GetMsgOffCommand()
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
