const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
const Logging = require('disnode-logger');
class Command {
    constructor(disnode) {
        //test
        this.disnode = disnode;
        if(this.disnode.botConfig.prefix){
          this.prefix = this.disnode.botConfig.prefix;
          Logging.Info("Command", "Start","prefix set to: " + this.prefix);
        }else {
          Logging.Info("Command", "Start","no prefix found in config setting default of \'!\'");
          this.prefix = "!";
        }
    }



    RunMessage(msgObj) {
      var self = this;
        this.GetCommandData(msgObj, false, function(plugin, command, params){
            self.RunChecks(msgObj,command);
            self.disnode.plugin.RunPluginMessage(plugin.name, {command: command, params: params, msg: msgObj});
        });
    }

    RunChecks(msg,command){
      var self = this;
      if(!command){
        return;
      }
      if(command.whitelist){
        command.userAllowed = false;
        for (var i = 0; i < command.whitelist.length; i++) {
          if(msg.userID == command.whitelist[i]){
            command.userAllowed = true;
          }
        }
      }

      if(command.roles){
        command.roleAllowed = false;
        for (var i = 0; i < command.roles.length; i++) {
          var userRoles = self.disnode.bot.GetUserRoles(msg.server, msg.userID);
          for (var j = 0; j < userRoles.length; j++) {
            if(userRoles[j] == command.roles[i]){
              command.roleAllowed = true;
            }
          }
        }
      }
    }

    GetCommandData(msgObj, ignoreFirst, callback) {
        var self = this;
        var msg = msgObj.message;
        var firstLetter = msg.substring(0, 1);
        var params = GetParams(msg);
        var firstWord;
        var pluginPrefix;
        var plugin;
        var command;
        if(firstLetter != this.prefix && !ignoreFirst){
          return;
        }
        var SpaceIndex = msg.length;
        if( msg.indexOf(" ") != -1){
          SpaceIndex = msg.indexOf(" ");
        }

        if(ignoreFirst){
          firstWord = msg.substring(0, SpaceIndex);
        }else{
          firstWord = msg.substring(1, SpaceIndex);
        }
        if(this.CheckForPrefix(firstWord) != null){
          plugin = this.CheckForPrefix(firstWord);
          pluginPrefix = firstWord;
          command = params[0];
          if(this.GetCommandObject(plugin, command)){
              params.shift();
            command = this.GetCommandObject(plugin, command);
            callback(plugin, command, params);
          }else{
            callback(plugin, {"cmd":command, "run":"default"}, params);
          }
        }else {
          command = firstWord;
          if(this.GetPluginFromCommand(command)){
            plugin = this.GetPluginFromCommand(command);
            if(this.GetCommandObject(plugin, command)){
              Logging.Warning("Command", "CommandParse", "Running a command without plugin prefix, this is heavily not supported and is in beta.");
              command = this.GetCommandObject(plugin, command);
              callback(plugin, command, params);
            }
          }
        }
    }
    CheckForPrefix(prefix){
      var pluginClasses = this.disnode.plugin.loaded;
      var found = null;
      for (var i = 0; i < pluginClasses.length; i++) {
        if(pluginClasses[i].config.prefix == prefix){
          found = pluginClasses[i];
        }
      }
      return found;
    }
    GetPluginFromCommand(command){
      var pluginClasses = this.disnode.plugin.loaded;
      var found = null;
      for (var i = 0; i < pluginClasses.length; i++) {
        if(pluginClasses[i].config.requirePrefix == undefined || pluginClasses[i].config.requirePrefix == false){
          for (var j = 0; j < pluginClasses[i].commands.length; j++) {
            if(pluginClasses[i].commands[j].cmd == command){
              found = pluginClasses[i];
              break;
            }
          }
        }
        if(found != null)break;
      }
      return found;
    }
    GetCommandObject(plugin, command){
      var found = null;
    if(plugin.commands){
      for (var i = 0; i < plugin.commands.length; i++) {
        if( plugin.commands[i].cmd == command){
          found = plugin.commands[i];
        }
      }
    }
      return found;
    }
}
function CheckSpace(toCheck){
  if(toCheck.indexOf(" ") != -1){
    return true;
  }
  else{
    return false;
  }
}
function GetParams(raw){
  var parms = [];
  var lastSpace = -1;
  var end = false;
  while(!end){
    var BeginSpace = raw.indexOf(" ", lastSpace);
    var EndSpace = -1;
    if(BeginSpace != -1){
       EndSpace = raw.indexOf(" ", BeginSpace + 1);
       if(EndSpace == -1){
         EndSpace = raw.length;
         end = true;
       }
       var param = raw.substring(BeginSpace + 1, EndSpace);
       var containsQuoteIndex = param.indexOf('"');
       var BeginQuote = -1;
       var EndQuote = -1;
       if(containsQuoteIndex != -1){
         BeginQuote = raw.indexOf('"', BeginSpace);
         EndQuote = raw.indexOf('"', BeginQuote + 1);
         if(EndQuote != -1){
           BeginSpace = BeginQuote;
           EndSpace = EndQuote;
           param = raw.substring(BeginSpace + 1, EndSpace);
         }
       }
       lastSpace = EndSpace;
       if(param != ""){
         parms.push(param);
       }else{
       }
    }else{
      end = true;
    }
  }
  return parms;
}
module.exports = Command;
