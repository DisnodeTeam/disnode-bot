const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
const Logging = require('./logging')
class PluginManager {
    constructor(disnode) {
        this.classes = [];
        this.launched = [];
        this.disnode = disnode;
    }

    Load(path) {
        var self = this;
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
            Logging.DisnodeInfo("PluginManager", "Load", "Loading Classes")



            async.every(_ManagerFolders, function(folder, everyCB) {

              var fullPath = path + "/" + folder + "/" ;
                var newPlugin = {name: folder, path: fullPath};
                var importClass = null;
                var className = folder + ".js";


                async.waterfall([

                    // Check if class exists
                    function(callback) {
                        Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Checking for class");
                        fs.stat(fullPath + className, function(err, stats) {
                            if (err) {
                                Logging.DisnodeError("PluginManager", "Load-"+folder, "Failed to find Class (" + fullPath + className + ")");
                                callback(err);
                                return;
                            } else {
                                Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Found Class");
                                callback();
                            }
                        });

                    },

                    // Attempt to import the class
                    function(callback) {
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Trying to import class");
                        try {
                            var NpmRequire = require("../" + fullPath + className);
                            Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Imported");

                            newPlugin.class = NpmRequire;
                            callback(null);
                        } catch (e) {
                            Logging.DisnodeError("PluginManager", "Load-"+folder, "Failed to Import: " + className + " - '" + e  + "'");

                            callback(e, null);
                        }
                    },



                    function(callback) {
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Loading Config");
                      self.disnode.config.Load(newPlugin).then(function(){
                        Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Loaded Config!");
                        self.disnode.config.EnableReload(newPlugin);
                        callback();
                      }).catch(callback);

                    },
                    // Finished Loading, adds class to array
                    function(callback) {

                        Logging.DisnodeSuccess("PluginManager","Load-"+folder, "Finished Loading");

                        self.classes.push(newPlugin);

                        //console.log(self.classes);
                        callback();
                    },


                ], function(err, result) {
                    everyCB(err, result); // Finish Waterfall
                });
            }, function(err, res) {
                Logging.DisnodeInfo("PluginManager", "Load", "Loaded " + self.classes.length + " plugin(s)");

                resolve();
            });
        });

    }

    LauchStatic(){
      var self = this;

      return new Promise(function(resolve, reject) {
          Logging.DisnodeInfo("PluginManager", "LauchStatic", "Launching Static Managers.");
          async.every(self.classes, function(plugin, callback) {

            if(plugin.config.static){
              Logging.DisnodeInfo("PluginManager", "LauchStatic-"+plugin.name, "Static Plugin Found. Launching");
              self.Launch(plugin.name, "STATIC").then(function() {
                  Logging.DisnodeSuccess("PluginManager", "LauchStatic-"+plugin.name, plugin.name + " launched!");
                  callback();
              }).catch(function(err){
                  Logging.DisnodeWarning("PluginManager", "LauchStatic-"+plugin.name, plugin.name + " Failed to Launch! - " + err);
                  callback(err);
              })
            }else{
              callback();
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
            newInstance.name = Manager.name;
            newInstance.parent = Manager;
            newInstance.config = Manager.config;
            newInstance.commands = Manager.commands;
            newInstance.disnode = self.disnode;
            self.launched.push(newInstance);
            resolve(newInstance);
        });
    }

    RunPluginMessage(pluginName, commandObj){

      var self = this;
      var serverID = commandObj.msg.channel.guild.id;
      var plugins = self.GetPluginsFromLaunched(pluginName, serverID);

      if(plugins.length != 0){
        for (var i = 0; i < plugins.length; i++) {
          self.RunCommandBind(plugins[i], commandObj);
        }

      }else{
        self.Launch(pluginName,commandObj.msg.channel.guild.id).then(function(newInstance){
          self.RunCommandBind(newInstance, commandObj);
        });
      }

    }

    RunCommandBind(plugin, command){
    

      plugin[command.command.run](command);
    }



    GetPluginFromLoaded(name) {
        var self = this;
        for (var i = 0; i < self.classes.length; i++) {
            if (self.classes[i].name == name) {
                return self.classes[i];
            }
        }
    }

    GetPluginsFromLaunched(name, server) {
        var self = this;
        var found = [];
        for (var i = 0; i < self.launched.length; i++) {
            if (self.launched[i].name == name ) {
              if(self.launched[i].server == server || self.launched[i].config.static){
                  found.push(self.launched[i]);
              }

            }
        }

        return found;
    }
}


module.exports = PluginManager;
