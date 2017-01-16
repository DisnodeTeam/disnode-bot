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

                var className = folder + ".js";
                var commandName = folder + "-Commands.json";
                var configName = folder + "-Config.json";
                var fullPath = path + "/" + folder + "/" ;

                var importClass = null;
                var configFile = null;
                var commandFile = null;

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

                            importClass = NpmRequire;
                            callback(null);
                        } catch (e) {
                            Logging.DisnodeError("PluginManager", "Load-"+folder, "Failed to Import: " + className + " - '" + e  + "'");

                            callback(e, null);
                        }
                    },
                     //Check if command file exists
                    function(callback) {
                        Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Checking for Command File");
                        fs.stat( fullPath + commandName, function(err, stats) {
                            if (err) {
                                Logging.DisnodeWarning("PluginManager", "Load-"+folder, "Failed to find Command File (" + fullPath + commandName+")");

                                callback();
                                return;
                            } else {
                                Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Found Command File");
                                callback();
                            }
                        });

                    },

                    function(callback) { // Read File
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Loading Command File");
                        jsonfile.readFile(fullPath + commandName, function(err, obj) {
                            if (err) {
                                callback();
                                Logging.DisnodeWarning("PluginManager", "Load-"+folder, "Failed to Load Command JSON File: " + err);
                                return;
                            }

                            if(!obj.commands){
                              callback();
                              Logging.DisnodeWarning("PluginManager", "Load-"+folder, "No Command Array found!: " + className);

                              return;
                            }
                            Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Loaded Command JSON File");
                            commandFile = obj.commands;

                            callback();
                        });
                    },

                    function(callback) {
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Checking for config file");

                        fs.stat( fullPath + configName, function(err, stats) {
                            if (err) {
                                Logging.DisnodeWarning("PluginManager","Load-"+folder, "Failed to find Config File (" + fullPath + configName+")");

                                callback();
                                return;
                            } else {
                              Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Found Config File");

                                callback();
                            }
                        });

                    },

                    function(callback) { // Read File
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Loading Config File");
                        jsonfile.readFile(fullPath + configName, function(err, obj) {
                            if (err) {
                                Logging.DisnodeWarning("PluginManager", "Load-"+folder, "Failed to Load Config JSON File: " + err);
                                callback();

                                return;
                            }

                            Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Loaded Config JSON File");
                            configFile = obj;

                            callback();
                        });
                    },
                    // Finished Loading, adds class to array
                    function(callback) {

                        Logging.DisnodeSuccess("PluginManager","Load-"+folder, "Finished Loading");

                        self.classes.push({
                            name: folder,
                            class: importClass,
                            commands: commandFile,
                            config: configFile
                        });

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
            newInstance.config = Manager.config;
            newInstance.commands = Manager.commands;
            newInstance.disnode = self.disnode;
            self.launched.push(newInstance);
            resolve(newInstance);
        });
    }

    RunPluginMessage(pluginName, commandObj){
      console.log("RUN PLUGIN MESSAGE");
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
      console.log("RUN BIND " + plugin.server + " - " + command.command);

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
