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

      var instance = {
        id: guildID,
        plugins: {count: 0}, //Loaded plugin.json files
        instances: [], // Launched plugins
        prefixed: []
      };

      self.LoadPlugins(instance).then(function(){
        resolve();
      });

      self.guilds[guildID] = instance;
      self.guilds.count++;
    });


  }


  ///// ======== INSTANCED ====== /////


  LoadPlugins(guild){
    var self = this;
    return new Promise(function(resolve, reject) {

      Logger.Info("PluginManager", "LoadPlugins-"+guild.id, "Loading Plugins.")

      var guildPluginsPaths    = self.GetPluginsPath(guild.id);
      var defaultPluginsPaths  = self.GetPluginsPath();

      if(guildPluginsPaths.length != 0){
        Logger.Info("PluginManager", "LoadPlugins-"+guild.id, "Loading Guild Plugins("+guildPluginsPaths.length+")")

        guildPluginsPaths.forEach(function(pluginPath) {
          var pluginObject = self.ReadPluginFile(pluginPath);
          guild.plugins[pluginObject.id] = pluginObject;
          guild.plugins.count += 1;
        });
        Logger.Success("PluginManager", "LoadPlugins-"+guild.id, "Loaded Guild Plugins("+ guild.plugins.count+")")
      }

      Logger.Info("PluginManager", "LoadPlugins-"+guild.id, "Loading Default Plugins("+defaultPluginsPaths.length+")")

      defaultPluginsPaths.forEach(function(pluginPath) {
        var pluginObject = self.ReadPluginFile(pluginPath);
        if(pluginObject == null){return;}
        guild.plugins[pluginObject.id] = pluginObject;
        guild.plugins.count += 1;
      });
      Logger.Success("PluginManager", "LoadPlugins-"+guild.id, "Loaded Default Plugins("+ guild.plugins.count+")")
      resolve(guild.plugins);
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


  ReadPluginFile(pluginPath){

    if (!fs.existsSync(pluginPath + "/plugin.json")) {
      Logger.Warning("PluginManager", "ReadPluginFile", "Could not find plugin.json: " + pluginPath + "./plugin.json")
      return null;
    }

    var pluginFileRaw = fs.readFileSync(pluginPath + "/plugin.json");
    var jsonPluginFile = null;

    try{
      jsonPluginFile = JSON.parse(pluginFileRaw);
      return jsonPluginFile;
    }catch(err){
      Logger.Warning("PluginManager", "ReadPluginFile", "Error Reading Plugin File: " + pluginPath + " - " + err)
      return null
    }
  }

}

module.exports = PluginManager;
