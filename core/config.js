const Logging = require("./logging")
const jsonfile = require('jsonfile');
const async = require('async');
const fs = require('fs');
class Config{
  constructor(){
    Logging.DisnodeInfo("Config", "Constructor", "Started!")

  }

  EnableReload(plugin){
    var self =this;
    Logging.DisnodeInfo("Config", "EnableReload", "Enabling Reload for: " + plugin.name)
    var name = plugin.name;
    var className = name + ".js";
    var commandName = name + "-Commands.json";
    var configName = name + "-Config.json";
    var fullPath = plugin.path;

    var commandPath = fullPath + commandName;
    var configPath = fullPath + configName;

    fs.watch(commandPath, function(e) {
      self.Load(plugin);

      });

    fs.watch(configPath, function(e) {
        self.Load(plugin);

    });
  }

  Load(plugin){
    var self = this;
    return new Promise(function(resolve, reject) {

      Logging.DisnodeInfo("Config", "Load", "Loading Config for: " + plugin.name)
      console.log(plugin.server);
      var name = plugin.name;
      var className = name + ".js";
      var commandName = name + "-Commands.json";
      var configName = name + "-Config.json";
      var fullPath = plugin.path;

      var configFile = null;
      var commandFile = null;
      async.waterfall([

       function(callback) {
           Logging.DisnodeInfo("Config", "Load-"+name, "Checking for Command File");
           fs.stat( fullPath + commandName, function(err, stats) {
               if (err) {
                   Logging.DisnodeWarning("Config", "Load-"+name, "Failed to find Command File (" + fullPath + commandName+")");

                   callback();
                   return;
               } else {
                   Logging.DisnodeSuccess("Config", "Load-"+name, "Found Command File");
                   callback();
               }
           });

       },
       function(callback) { // Read File
         Logging.DisnodeInfo("Config", "Load-"+name, "Loading Command File");
           jsonfile.readFile(fullPath + commandName, function(err, obj) {
               if (err) {
                   callback();
                   Logging.DisnodeWarning("Config", "Load-"+name, "Failed to Load Command JSON File: " + err);
                   return;
               }

               if(!obj.commands){
                 callback();
                 Logging.DisnodeWarning("Config", "Load-"+name, "No Command Array found!: " + className);

                 return;
               }
               Logging.DisnodeSuccess("Config", "Load-"+name, "Loaded Command JSON File");
               commandFile = obj.commands;

               callback();
           });
       },

       function(callback) {
         Logging.DisnodeInfo("Config", "Load-"+name, "Checking for config file");

           fs.stat( fullPath + configName, function(err, stats) {
               if (err) {
                   Logging.DisnodeWarning("Config","Load-"+name, "Failed to find Config File (" + fullPath + configName+")");

                   callback();
                   return;
               } else {
                 Logging.DisnodeSuccess("Config", "Load-"+name, "Found Config File");

                   callback();
               }
           });

       },

       function(callback) { // Read File
         Logging.DisnodeInfo("Config", "Load-"+name, "Loading Config File");
           jsonfile.readFile(fullPath + configName, function(err, obj) {
               if (err) {
                   Logging.DisnodeWarning("Config", "Load-"+name, "Failed to Load Config JSON File: " + err);
                   callback();

                   return;
               }

               Logging.DisnodeSuccess("Config", "Load-"+name, "Loaded Config JSON File");
               configFile = obj;

               callback();
           });
       },

      ], function (err, result) {
        plugin.config = configFile;
        plugin.commands = commandFile;
        if(err){
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

}

module.exports = Config;
