const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
const Logging = require('./logging')
class PluginManager {
    constructor(disnode, path) {
        this.loaded = [];
        this.launched = [];
        this.disnode = disnode;
        this.pluginPath = path;
        var self = this;
        Logging.AddRemoteVal("Instances", function(){return self.launched.length});
    }

    EnableReload(plugin){
      var self =this;

      Logging.DisnodeInfo("Plugin", "EnableReload", "Enabling Reload for: " + plugin.name)
      var name = plugin.name;
      var className = name + ".js";
      var commandName = name + "-Commands.json";
      var configName = name + "-Config.json";
      var fullPath = plugin.path;

      var filePath = fullPath + className;
      console.log(filePath);
      fs.watch(filePath, function(e) {

        for (var i = 0; i < self.loaded.length; i++) {
          if(self.loaded[i].name == name){
            self.loaded.splice(i, 1);
          }
        }

        for (var i = 0; i < self.launched.length; i++) {
          if(self.launched[i].class.name == name){
            self.launched.splice(i, 1);
          }
        }
        
        self.LoadPlugin(name);

        });


    }

    LoadPlugin(name){
      var self = this;
      var path = self.pluginPath;
      console.log(self.pluginPath);
      return new Promise(function(resolve, reject) {
          var fullPath = path + "/" + name + "/" ;
          var newPlugin = {name: name, path: fullPath};
          var importClass = null;

          var className = name + ".js";
          async.waterfall([
              // Check if class exists
              function(callback) {
                  Logging.DisnodeInfo("PluginManager", "Load-"+name, "Checking for class");
                  fs.stat(fullPath + className, function(err, stats) {
                      if (err) {
                          Logging.DisnodeError("PluginManager", "Load-"+name, "Failed to find Class (" + fullPath + className + ")");
                          callback(err);
                          return;
                      } else {
                          Logging.DisnodeSuccess("PluginManager", "Load-"+name, "Found Class");
                          callback();
                      }
                  });
              },
              // Attempt to import the class
              function(callback) {
                Logging.DisnodeInfo("PluginManager", "Load-"+name, "Trying to import class");
                  try {
                      var NpmRequire = require("../" + fullPath + className);
                      Logging.DisnodeSuccess("PluginManager", "Load-"+name, "Imported");
                      newPlugin.class = NpmRequire;
                      callback(null);
                  } catch (e) {
                      Logging.DisnodeError("PluginManager", "Load-"+name, "Failed to Import: " + className + " - '" + e  + "'");
                      callback(e, null);
                  }
              },
              function(callback) {
                Logging.DisnodeInfo("PluginManager", "Load-"+name, "Loading Config");
                self.disnode.config.Load(newPlugin).then(function(){
                  Logging.DisnodeSuccess("PluginManager", "Load-"+name, "Loaded Config!");
                  self.disnode.config.EnableReload(newPlugin);
                  callback();
                }).catch(callback);
              },
              // Finished Loading, adds class to array
              function(callback) {
                  if(newPlugin.config.run){

                    self.loaded.push(newPlugin);
                    Logging.DisnodeSuccess("PluginManager","Load-"+name, "Finished Loading");
                  }else {
                    Logging.DisnodeInfo("PluginManager","Load-"+name, "Plugin skipped run = false!");
                  }

                  //console.log(self.loaded);
                  callback();
              },
          ], function(err, result) {
              if(err){
                reject(err);
                return;
              }

              resolve(result);

          });
      });
    }

    Load() {
        var self = this;
        var path = self.pluginPath;
        return new Promise(function(resolve, reject) {
            if (!path) {
                reject("No Path!");
            }
            var _ManagerFolders = [];
            //Load Directories. Its sync since this Function is already
            //wrapped in a Promise
            _ManagerFolders = fs.readdirSync(path);
            if (!_ManagerFolders) {
                reject("Managers Null!")
            }
            Logging.DisnodeInfo("PluginManager", "Load", "Loading loaded");
            async.each(_ManagerFolders, function(folder, everyCB) {

              self.LoadPlugin(folder).then(function(result){everyCB(null, result);}).catch(everyCB);
            }, function(err, res) {
              for(var i=0;i<self.loaded.length;i++){
                self.EnableReload(self.loaded[i]);
              }
                Logging.DisnodeInfo("PluginManager", "Load", "Loaded " + self.loaded.length + " plugin(s)");
                resolve();
            });


        });
    }
    LauchStatic(){
      var self = this;
      return new Promise(function(resolve, reject) {
          Logging.DisnodeInfo("PluginManager", "LauchStatic", "Launching Static Managers.");
          async.each(self.loaded, function(plugin, callback) {
            if(plugin.config.static){
              Logging.DisnodeInfo("PluginManager", "LauchStatic-"+plugin.name, "Static Plugin Found. Launching");
              self.Launch(plugin.name, "STATIC").then(function() {
                  Logging.DisnodeSuccess("PluginManager", "LauchStatic-"+plugin.name, plugin.name + " launched!");
                  callback(null,plugin);
              }).catch(function(err){
                  Logging.DisnodeWarning("PluginManager", "LauchStatic-"+plugin.name, plugin.name + " Failed to Launch! - " + err);
                  callback(err);
              });
            }else{
              callback(null,plugin);
            }
          },function(err, result) {
            resolve();
          });
      });
    }
    Launch(managerName, server) {
        var self = this;
        return new Promise(function(resolve, reject) {
          Logging.DisnodeInfo("PluginManager", "Launch", "Lauching: " + managerName + " on: " + server)
            if (!managerName) {
                reject("[PluginManager 'Launch'] No Manager Name!")
            }
            var Manager = self.GetPluginFromLoaded(managerName);
            if (!Manager) {
                reject("[PluginManager 'Launch'] No Manager Found!")
            }
            var newInstance = new Manager.class(server);
            newInstance.server = server;
            newInstance.class = Manager;
            newInstance.disnode = self.disnode;
            self.launched.push(newInstance);
            resolve(newInstance);
        });
    }
    RunPluginMessage(pluginName, commandObj){
      var self = this;
      var serverID = commandObj.msg.server;

      var plugins = self.GetPluginsFromLaunched(pluginName, serverID);
      if(plugins.length != 0){
        for (var i = 0; i < plugins.length; i++) {
          self.RunCommandBind(plugins[i], commandObj);
        }
      }else{
        self.Launch(pluginName,serverID).then(function(newInstance){
          self.RunCommandBind(newInstance, commandObj);
        });
      }
    }
    RunCommandBind(plugin, command){
      if(!plugin[command.command.run]){
        Logging.DisnodeWarning("PluginManager", "RunCommandBind", "No Function Found for: " + command.command.run);
        return;
      }
      plugin[command.command.run](command);

    }
    GetPluginFromLoaded(name) {
        var self = this;
        for (var i = 0; i < self.loaded.length; i++) {
            if (self.loaded[i].name == name) {
                return self.loaded[i];
            }
        }
    }
    GetPluginsFromLaunched(name, server) {
        var self = this;
        var found = [];
        for (var i = 0; i < self.launched.length; i++) {
            if (self.launched[i].class.name == name ) {
              if(self.launched[i].server == server || self.launched[i].class.config.static){
                  found.push(self.launched[i]);
              }
            }
        }
        return found;
    }
}

module.exports = PluginManager;
