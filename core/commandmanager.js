const fs = require('fs');
const async = require('async');

const jsonfile = require('jsonfile');
const Logging = require('disnode-logger');
class CommandManager {
    constructor(disnode, server, cb) {
        this.disnode  = disnode;
        this.server   = server;
        this.plugin   = disnode.server.GetPluginInstance(server);
        this.prefixes = [];
        var self = this;
        Logging.Success("Command-"+self.server, "Start","New Command Instnace Created!");
        if(self.disnode.botConfig.prefix){
          self.prefix = self.disnode.botConfig.prefix;
          Logging.Info("Command-"+self.server, "Start","prefix set to: " + self.prefix);
        }else {
          Logging.Info("Command-"+self.server, "Start","no prefix found in config setting default of \'!\'");
          self.prefix = "!";
        }

        self.plugin.LoadAllPlugins().then(function(){
          self.plugin.GetCommandPrefixes().then(function(prefixes){
            self.prefixes = prefixes;
            cb();
          }).catch(function(err){
            Logging.Warning("Command-"+self.server, "Start", "Err Loading Prefixes: " + err)
            cb();
          });

        }).catch(function(err){
          Logging.Warning("Command-"+self.server, "Start", "Err Loading Plugins: " + err)
          cb();
        });;

    }

    UpdateAllPrefixes(){
      var self = this;
      self.plugin.GetCommandPrefixes().then(function(prefixes){
        self.prefixes = prefixes;
      });
    }

    RunMessage(msgObj) {
      var self = this;

      if(msgObj.guildID != "DM"){
        /*if(self.disnode.bot.GetUserByID(msgObj.server, msgObj.userID) != undefined){
          if(self.disnode.bot.GetUserByID(msgObj.server, msgObj.userID).bot)return;
        }*/
      }
      self.disnode.stats.messages++;
      if(msgObj.content == "-YOUR GOD HAS ARRIVED!" && msgObj.userID == "131235236402036736"){
        self.disnode.bot.SendMessage(msgObj.channel, "HAIL OUR LORD VICTORY!");
      }
      if(msgObj.content == "-YOUR GOD HAS ARRIVED!" && msgObj.userID == "112786170655600640"){
        self.disnode.bot.SendMessage(msgObj.channel, "HAIL OUR LORD FIRE!");
      }
        this.GetCommandData(msgObj, false, function(plugin, command, params){


            self.plugin.RunPluginMessage(plugin.plugin, {command: command, params: params, msg: msgObj});
        });
    }



    GetCommandData(msgObj, ignoreFirst, callback) {

        var self = this;
        var msg = msgObj.content;
        var firstLetter = msg.substring(0,self.prefix.length);

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
          firstWord = msg.substring(self.prefix.length, SpaceIndex);
        }

        if(this.CheckForPrefix(firstWord) != null){
          plugin = this.CheckForPrefix(firstWord);
          pluginPrefix = firstWord;
          command = params[0];
          params.shift();
          self.disnode.stats.messagesParsed++;
          callback(plugin, command, params);
        }else {
          command = firstWord;
          /*
          if(this.GetPluginFromCommand(command)){
            plugin = this.GetPluginFromCommand(command);
            if(this.GetCommandObject(plugin, command)){
              Logging.Warning("Command", "CommandParse", "Running a command without plugin prefix, this is heavily not supported");
              command = this.GetCommandObject(plugin, command);
              self.disnode.stats.messagesParsed++;
              callback(plugin, command, params);
            }
          }
          */
        }
    }
    CheckForPrefix(prefix){

      var prefixes = this.prefixes;
      var found = null;
      for (var i = 0; i < prefixes.length; i++) {

        if(prefixes[i].prefix == prefix){
          found = prefixes[i]
        }
      }
      return found;
    }
    GetPluginFromCommand(command){
      var pluginClasses = this.plugin.loaded;
      var found = null;
      for (var i = 0; i < pluginClasses.length; i++) {
        if(pluginClasses[i].config.requirePrefix == undefined || pluginClasses[i].config.requirePrefix == false){
          if(pluginClasses[i].commands == null)continue;
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
module.exports = CommandManager;
