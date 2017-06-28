const Logger     = require("disnode-logger");
const async      = require('async');
const fs         = require('fs-extra')
const jsonfile   = require('jsonfile');
const Stopwatch  = require('timer-stopwatch');
const merge      = require('merge');
const http       = require('https');
const unzip      = require('unzip2');
const npmi       = require('npmi');
const path       = require('path');
const spawn      = require('cross-spawn')



var timer = new Stopwatch();
/**
 * PluginManager Handle all Plugin Related Task
 * @constructor
 * @param {DisnodeObject} disnode - Disnode Refrence
 * @param {string} server - Server the PluginManager is on
 */
class PluginManager {
  constructor(disnode) {
    this.disnode = disnode;
    this.guilds = {count: 0};
  }


  NewInstance(guildID){
    var self = this;
    return new Promise(function(resolve, reject) {


      Logger.Info("PluginManager","NewInstance","New Intance: " + guildID);
      var newInstance = new GuildInstance(guildID, self)

      newInstance.LoadPlugins().then(function(){
        resolve();
      });

      self.guilds[guildID] = newInstance;
      self.guilds.count++;
    });


  }

}

class GuildInstance{
  constructor(guildID, parent){
    this.id =guildID;
    this.parent = parent;
    this.disnode = parent.disnode;
    this.plugins = {count: 0}, //Loaded plugin.json files
    this.instances = [], // Launched plugins
    this.prefixes = {count: 0 };
  }

  LoadPlugins(){
    var self = this;
    return new Promise(function(resolve, reject) {

      Logger.Info("PluginManager", "LoadPlugins-"+self.id, "Loading Plugins.")

      var guildPluginsPaths    = self.GetPluginsPath(self.id);
      var defaultPluginsPaths  = self.GetPluginsPath();

      if(guildPluginsPaths.length != 0){
        Logger.Info("PluginManager", "LoadPlugins-"+self.id, "Loading Guild Plugins("+guildPluginsPaths.length+")")

        guildPluginsPaths.forEach(function(pluginPath) {

          var pluginObject = self.GeneratePluginObject(pluginPath);
          if(pluginObject == null){return;}
          self.plugins[pluginObject.id] = pluginObject;
          self.plugins.count += 1;
        });
        Logger.Success("PluginManager", "LoadPlugins-"+self.id, "Loaded Guild Plugins("+ self.plugins.count+")")
      }

      Logger.Info("PluginManager", "LoadPlugins-"+self.id, "Loading Default Plugins("+defaultPluginsPaths.length+")")

      defaultPluginsPaths.forEach(function(pluginPath) {
        var pluginObject = self.GeneratePluginObject(pluginPath);
        if(pluginObject == null){return;}
        self.plugins[pluginObject.id] = pluginObject;
        self.plugins.count += 1;
      });
      Logger.Success("PluginManager", "LoadPlugins-"+self.id, "Loaded Default Plugins("+ self.plugins.count+")")
      self.LoadPrefixes();
      Logger.Success("PluginManager", "LoadPlugins-"+self.id, "Loaded Prefixes("+ self.prefixes.count+")")
      resolve(self.plugins);
    });
  }

  GetPluginsPath(guildID = null){
    var path = "./"
    if(guildID != null){
      path += "servers/"+guildID
    }else{
      path += "plugins/"
    }

    if (!fs.existsSync(path)) {
      return [];
    }

    var Plugins = fs.readdirSync(path);
    var finalPaths = [];
    for (var i = 0; i < Plugins.length; i++) {
      //Filters files since those will have a `.` suffix
      if(Plugins[i].indexOf('.') == -1){
        finalPaths.push(path + "/" + Plugins[i]);
      }
    }
    return finalPaths;
  }

  GeneratePluginObject(pluginPath){
    var plugin = {};
    var files = this.ReadJSONFiles(pluginPath);
    if(!files){
      return null;
    }

    if(files.Commands){
      files.Commands = files.Commands.commands;
    }

    plugin = files['plugin'];

    merge(plugin, files)


    return plugin;

  }

  ReadJSONFiles(pluginPath){
    var files = null;
    try{
      files = fs.readdirSync(pluginPath);
    }catch(err){
      return;
    }

    if(!files || files.length == 0){return;}

    var returnData = {};
    files.forEach(function(file){
      if(!file.includes('.json')){
        return;
      }

      var filePath = pluginPath + '/' + file;
      var fileName = file.substring(0, file.indexOf('.json'));

      var fileContents = fs.readFileSync(filePath);
      var fileJSON = null;

      try{
        fileJSON = JSON.parse(fileContents);
        returnData[fileName] = fileJSON;
      }catch(err){
        Logger.Warning("PluginManager", "ReadJSONFiles", "Error Reading Plugin File: " + fileName + " - " + err)
      }

    });

    return returnData;
  }

  LoadPrefixes(){
    var self = this;
    for (var prop in self.plugins) {

      if(prop == "count"){continue}
      if (!self.plugins.hasOwnProperty(prop)) {
        continue;
      }
      var plugin = self.plugins[prop];

      if(!plugin.Config){continue}
      self.prefixes[plugin.Config.prefix] = plugin.id;

      self.prefixes.count ++;
    }

  }
  RunMessage(msgObject){
    var self = this;
    var fullText = msgObject.content;
    var prefixLength = self.disnode.botConfig.prefix.length;
    var commandText = fullText.substring(prefixLength);
    var params = commandText.split(' ');

    // Clean up params
    var openQuote = false;


    for (var index in params){

      var param = params[index];

      if(param == ''){
        params.split(index, 1);
      }

    }

    var pluginPrefix = params[0];
    var pluginID = self.prefixes[pluginPrefix];
    var plugin   = self.plugins[pluginID];

    if(!plugin){
      return;
    }

    params.splice(0,1);
    var commandText = params[0];
    var command = self.GetCommand(pluginID, commandText) || {cmd: "_default", run: "default"};

    var sendObject = {command: command, msg: msgObject};

    LaunchPlugin(pluginID).then(function(instance){
      if(!instnace[command.run]){
        return;
      }

      instance[command.run](sendObject);
    });
  }

  LaunchPlugin(pluginID){
    var self = this;
    return new Promise(function(resolve, reject) {
      
    });
  }


  GetCommand(pluginID, command){
    var plugin = this.plugins[pluginID];
    if(!plugin.Commands){return null;}
    for (var i = 0; i < plugin.Commands.length; i++) {
      if(plugin.Commands[i].cmd == command){
        return plugin.Commands[i]
      }
    }
    return null;
  }

}

module.exports = PluginManager;
