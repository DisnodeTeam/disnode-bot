"use strict";
// This Class Takes all Messages Begining with one of the pre-set
// command starts (Set on Setup of this Class) and runs them against all the commands
// for that bot, and passes in the params (spaces define parm)

class CommandHandler{
  constructor(bot,commandStarter,commandList){
    this.bot = bot;
    this.commandStarter = commandStarter;
    this.commandList = commandList;
  }

  OnMessage(msgObject){
    var message = msgObject.content;
    var channel = msgObject.channel;

    var hasSpace = function(){
      if(message.indexOf(" ") != -1)
        return true;
      else {
        return false;
      }
    }

    var command;

    if(hasSpace){
      command = message.substring(0,message.indexOf(" "));
    }else{
      command = message;
    }

    runCommand(command, this.commandList);

  }
}

function runCommand(cmd, list, msg){
  var found = false;
  for (var i = 0; i < list.length; i++) {
    var current = list[i];
    if (cmd == current.cmd) {
      found = true;
      current.run(msg);
    }
  }
}
