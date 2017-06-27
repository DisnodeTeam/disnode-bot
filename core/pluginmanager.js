var Logger = require("disnode-logger");
const async = require('async');
const fs = require('fs-extra')
const jsonfile = require('jsonfile');
const Stopwatch = require('timer-stopwatch');
const merge = require('merge');
const http = require('https');
const unzip = require('unzip2');
var npmi = require('npmi');
var path = require('path');
const spawn = require('cross-spawn')
var timer = new Stopwatch();
/**
 * PluginManager Handle all Plugin Related Task
 * @constructor
 * @param {DisnodeObject} disnode - Disnode Refrence
 * @param {string} server - Server the PluginManager is on
 */
class PluginManager {
  constructor(disnode, server) {
    this.server = server;
    this.disnode = disnode;
    this.instances = [];
    this.plugins = [];

  }
  /**
   * Loads All Plugins for thie server (Core Plugins and Server Plugins
   */
  LoadAllPlugins() {
    var self = this;

    return new Promise(function(resolve, reject) {
      timer.start();
      self.instances.length = 0;
      self.plugins.length = 0;
      Logger.Info("PluginManager-" + self.server, "LoadAllPlugins", "Loading All Plugins!")

      async.waterfall([
        // Load Server Plugins
        function(cb) {
          self.GetPluginFiles("./servers/" + self.server, true).then(function(plugins) {

            if (!plugins) {
              cb();
              return
            }
            for (var i = 0; i < plugins.length; i++) {
              self.SetupEvents(plugins[i]);
              self.plugins.push(plugins[i]);
              self.LaunchPlugin(plugins[i].id, {})
            }
            cb();
          })
        },
        function(cb) {
          //Load Default Plugins

          self.GetPluginFiles("./plugins/", false).then(function(plugins) {

            if (!plugins) {
              cb();
              return
            }

            for (var i = 0; i < plugins.length; i++) {

              var alreadyAdded = false;
              //Run Check for alreadyAdded plugins
              for (var x = 0; x < self.plugins.length; x++) {

                if (self.plugins[x].id == plugins[i].id) {
                  alreadyAdded = true;
                }
              }

              if (!alreadyAdded) {
                self.SetupEvents(plugins[i]);
                self.plugins.push(plugins[i]);
                if (plugins[i].launch) {
                  self.LaunchPlugin(plugins[i].id, {})
                }
              }
            }
            cb();
          }).catch(cb);
        }
      ], function(err, res) {

        timer.stop();

        Logger.Success("PluginManager-" + self.server, "LoadAllPlugins", "Loaded " + self.plugins.length + " plugins in " + timer.ms + "ms!");
        timer.reset();
        resolve();
      })
    });
  }
  /**
   * Runs a Command to a plugin
   *
   * @param {string} pluginID - Plugin to run the command
   * @param {commandObject} commandObject - Command Object returned by CommandManager.js
   */
  RunPluginMessage(pluginID, commandObject) {

    var self = this;


    var plugin = self.GetInstanceByID(pluginID);

    if (!plugin) {
      self.LaunchPlugin(pluginID, commandObject).then(function(launched) {
        self.instances.push(launched);
        self.RunCommandBind(launched, commandObject);

      });
    } else {
      self.RunCommandBind(plugin, commandObject);

    }
  }
  /**
   * Launches a Plugin on a server
   * @param {string} pluginID - Plugin to launch
   * @param {commandObject} commandObject - Command Object returned by CommandManager.js
   */
  LaunchPlugin(pluginID, commandObject) {
    var self = this;
    Logger.Info("PluginManager-" + this.server, "LaunchPlugin", "Launching Plugin: " + pluginID);
    return new Promise(function(resolve, reject) {
      var pluginFile = self.GetPluginByID(pluginID);
      var _newPlugin = {};

      self.GetScriptRequire(pluginFile).then(function(requireClass) {
        pluginFile.disnode = self.disnode;
        pluginFile.pluginManager = self;
        pluginFile.server = self.server;
        _newPlugin = merge(new requireClass(), pluginFile);

        self.disnode.stats.pluginInstances++;
        return self.GetConfigFile(_newPlugin)
      }).then(function(config) {
        _newPlugin.config = config;
        return self.GetCommandFile(_newPlugin);
      }).then(function(commands) {
        _newPlugin.commands = commands;
        _newPlugin.Destory = function() {
          self.DestoryPlugin(_newPlugin.id);
        }
        if (_newPlugin.Init) {
          _newPlugin.Init(function() {

            resolve(_newPlugin);
          })
        } else {
          resolve(_newPlugin);
        }
      }).catch(function(err) {
        console.log(err);
        reject(err);
      })

    });
  }


  DestoryPlugin(pluginID) {
    var self = this;
    var i = self.instances.indexOf(pluginID);
    Logger.Success("PluginManager-" + this.server, "DestoryPlugin", "Destroyed Plugin Instance: " + pluginID);
    self.instances.splice(i, 1);
    self.disnode.stats.pluginInstances--;
  }
  /**
   * Runs a function in a plugin (bind)
   * @param {string} pluginID - Plugin to Run it
   * @param {commandObject} commandObject - Command Object returned by CommandManager.js
   */
  RunCommandBind(pluginID, commandObject) {

    var commandObj = this.GetCommandObject(pluginID, commandObject.command);


    if (!pluginID[commandObj.run]) {
      Logger.Warning("PluginManager-" + this.server, "RunCommandBind", "No Function Found for: " + commandObj.run);
      return;
    }
    if (commandObj.run == "default") {

      commandObject.params.unshift(commandObject.command);
    }

    if(commandObj.owner){
      if(commandObject.msg.author.id != this.disnode.bot.guilds[this.server].owner_id){

      }
    }

    pluginID[commandObj.run](commandObject);

  }
  RunPluginFunction(pluginId, toRun, commandObject) {
    var self = this;
    var plugin = self.GetInstanceByID(pluginId);
    if (!plugin) {
      self.LaunchPlugin(pluginId, commandObject).then(function(inst) {
        if (!inst[toRun]) {
          Logger.Warning("PluginManager-" + self.server, "RunPluginFunction", "No Function Found for: " + toRun);
          return;
        }


        inst[toRun](commandObject);
      });
      return;
    }
    if (!plugin[toRun]) {
      Logger.Warning("PluginManager-" + this.server, "RunPluginFunction", "No Function Found for: " + toRun);
      return;
    }


    plugin[toRun](commandObject);
  }
  SetupEvents(plugin) {
    var self = this;
    var bot = self.disnode.bot;
    var self = this;
    var bot = self.disnode.bot;

    if (plugin.events) {
      for (var i = 0; i < plugin.events.length; i++) {
        var cur = plugin.events[i];
        Logger.Success("PluginManager-" + self.server, "SetupEvents:" + plugin.id, "Listening for " + cur.event);
        bot.on(cur.event, function(data) {
          self.RunPluginFunction(plugin.id, cur.run, {
            msg: data
          })
        })
      }
    }



  }

  ChangePluginConfig(plugin, key, val) {
    var self = this;
    return new Promise(function(resolve, reject) {

      //Plugin to edit

      var pluginClass = self.GetPluginByID(plugin);

      //Check if plugin is in Core or already added to server
      if (!pluginClass.isServer) {

        self.AddServerPluginLocal(plugin)
          .then(function() {
            pluginClass = self.GetPluginByID(plugin);
            return self.GetConfigFile(pluginClass);
          })

          .then(function(obj) {
            var newConfig = obj;

            newConfig[key] = val;

            return self.SetConfigFile(pluginClass, newConfig);
          })

          .then(function() {
            return self.LoadAllPlugins();
          })

          .then(function() {
            var command = self.disnode.server.GetCommandInstance(self.server);
            command.UpdateAllPrefixes();
            resolve();
          }).catch(reject);


      } else {

        self.GetConfigFile(pluginClass)
          .then(function(obj) {
            var newConfig = obj;

            newConfig[key] = val;

            return self.SetConfigFile(pluginClass, newConfig);
          })

          .then(function() {
            return self.LoadAllPlugins();
          })

          .then(function() {
            var command = self.disnode.server.GetCommandInstance(self.server);
            command.UpdateAllPrefixes();
            resolve();
          }).catch(reject);

      }
    });

  }
  /**
   * Adds/Downloads a Plugin to a server Folder
   * @param {string} pluginID - Plugin to Download and Add
   * @param {function} cb - Callback when Done
   */
  AddServerPluginRemote(pluginId, cb) {
    var self = this;
    return new Promise(function(resolve, reject) {
      Logger.Info("PluginManager-" + self.server, "AddServerPluginRemote:" + pluginId, "Downloading Plugin");
      self.command = self.disnode.server.GetCommandInstance(self.server);
      self.MakeServerFolder();
      var newPath = "servers/" + self.server;

      var request = http.get("https://api.disnodeteam.com/plugins/download/" + pluginId, function(response) {
        response.on('data', function(chunk) {
          try {
              var data = JSON.parse(chunk);
              if (data.type && data.type == "ERR") {
                reject(data.data)
                return;
              }
          } catch (e) {

          }
        });
        response.pipe(unzip.Extract({
          path: newPath
        }));


        response.on("end", function() {
          Logger.Success("PluginManager-" + self.server, "AddServerPluginRemote:" + pluginId, "Downloaded Plugin!");
          setTimeout(function() {
            self.LoadAllPlugins().then(function() {
              self.InstallPluginRequirements(pluginId).then(function() {
                self.command.UpdateAllPrefixes();
                Logger.Success("PluginManager-" + self.server, "AddServerPluginRemote:" + pluginId, "Installed Plugin!");
                resolve();
              })

            });


          }, 1000);
        })

      });
    });
  }
  /**
   * Adds a plugin from the Core Folder
   * @param {string} pluginID - Plugin to Download and Add
   * @param {function} cb - Callback when Done
   */
  AddServerPluginLocal(pluginId) {
    var self = this;

    return new Promise(function(resolve, rejecy) {
      self.command = self.disnode.server.GetCommandInstance(self.server);
      self.MakeServerFolder();
      for (var i = 0; i < self.plugins.length; i++) {
        if (self.plugins[i].isServer) {
          return;
        }

        if (self.plugins[i].id == pluginId) {
          var newPath = self.plugins[i].path.replace("plugins/", "servers/" + self.server);
          console.log(newPath);

          fs.copy(self.plugins[i].path, newPath, function(err) {
            if (err) return console.error(err)
            setTimeout(function() {
              self.LoadAllPlugins().then(function() {
                self.command.UpdateAllPrefixes();
                resolve();
              });

            }, 1000);
          });
        }
      }
    });
  }

  /**
   * Removes a Plugin frome a server Folder
   * @param {string} pluginID - Plugin to Download and Add
   */
  RemoveServerPlugin(pluginId) {
    var self = this;
    self.MakeServerFolder();
    for (var i = 0; i < self.plugins.length; i++) {
      if (self.plugins[i].isServer == false) {

        return;
      }

      if (self.plugins[i].id == pluginId) {
        var newPath = self.plugins[i].path.replace("plugins/", "servers/" + this.server);

        fs.remove(self.plugins[i].path, err => {
          if (err) return console.error(err)
          this.LoadAllPlugins();

        })
      }

    }
  }

  InstallPluginRequirements(pluginId) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var pluginObj = self.GetPluginByID(pluginId);

      if (!pluginObj) {
        Logger.Warning("PluginManager-" + self.server, "InstallPluginRequirements:" + pluginId, "Failed to find PluginOBJ");

        resolve();
        return;

      }
      if (pluginObj.requirements) {
        Logger.Info("PluginManager-" + self.server, "InstallPluginRequirements:" + pluginObj.id, "Installing Requirements: " + pluginObj.requirements);

        if (process.platform == "linux") {
          var execString = "sudo";
          var args = ['npm', 'i'];
          for (var i = 0; i < pluginObj.requirements.length; i++) {
            args.push(pluginObj.requirements[i]);
          }

          var child = spawn.sync(execString, args, {
            stdio: 'inherit',
            env: process.env,
            cwd: __dirname
          });
        } else {
          var execString = "npm";
          var args = ['i'];
          for (var i = 0; i < pluginObj.requirements.length; i++) {
            args.push(pluginObj.requirements[i]);
          }

          var child = spawn.sync(execString, args, {
            stdio: 'inherit',
            env: process.env,
            cwd: __dirname
          });
        }



        if (child.error) {
          Logger.Error("PluginManager-" + self.server, "InstallPluginRequirements:" + pluginObj.id, "Error Installing Package: " + JSON.stringify(child.error));
        }
        Logger.Success("PluginManager-" + self.server, "InstallPluginRequirements:" + pluginObj.id, "Installed Requirements!");
        resolve();


      } else {
        resolve();
      }
    });
  }
  /**
   * Creates a server specific folder for plugins
   * @param {string} pluginID - Plugin to Download and Add
   */
  MakeServerFolder() {
    var dir = "./servers/" + this.server;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

  }
  /**
   * Gets a plugin object by ID
   * @param {string} pluginID - Plugin to Download and Add
   */
  GetPluginByID(pluginID) {
    for (var i = 0; i < this.plugins.length; i++) {
      if (this.plugins[i].id == pluginID) {
        return this.plugins[i]
      }
    }
  }
  /**
   * Gets a plugin instance object by ID
   * @param {string} pluginID - Plugin to Download and Add
   */
  GetInstanceByID(pluginID) {
    for (var i = 0; i < this.instances.length; i++) {

      if (this.instances[i].id == pluginID) {
        return this.instances[i]
      }
    }
  }
  /**
   * Gets all the plugin files (plugin.js) in a folder
   * @param {string} pluginID - Plugin to Download and Add
   */
  GetPluginFiles(path, isServer) {

    var self = this;
    return new Promise(function(resolve, reject) {
      var Plugins = [];
      var folders = ""
      try {
        folders = fs.readdirSync(path);
      } catch (e) {
        resolve();
      }


      async.each(folders, function(_folder, cb) {

        jsonfile.readFile(path + "/" + _folder + "/plugin.json", function(err, obj) {
          if (!err) {
            obj.path = path + "/" + _folder;
            obj.isServer = isServer;
            if (!obj.load) {
              Logger.Warning("PluginManager-" + self.server, "GetPluginFolders", "Not loading: " + _folder)
              cb();
              return
            }
            Plugins.push(obj);
            cb();
            return;
          } else {
            Logger.Warning("PluginManager-" + self.server, "GetPluginFolders", "Error Finding plugin.json file: " + _folder)
            cb();
            return;
          }
          cb();
        })

      }, function(err, res) {

        resolve(Plugins)
      })
    });

  }

  /**
   * Get all the prefixes
   * @param {string} pluginID - Plugin to Download and Add
   */
  GetCommandPrefixes() {
    var self = this;
    return new Promise(function(resolve, reject) {

      var prefix = [];

      async.each(self.plugins, function(plugin, cb) {

        self.GetConfigFile(plugin).then(function(config) {

          prefix.push({
            plugin: plugin.id,
            prefix: config.prefix
          });
          cb();
        }).catch(function(err) {

          cb(err);
        });
      }, function(err, res) {
        if (err) reject(err);

        resolve(prefix);
      })

    });
  }

  /**
   * Get all the prefixes
   * @param {string} pluginID - Plugin to Download and Add
   * @param {string} commandString - ?????
   */
  GetCommandObject(plugin, commandString) {
    var _cmds = plugin.commands || [];
    var _found;
    for (var i = 0; i < _cmds.length; i++) {
      if (_cmds[i].cmd == commandString) {
        _found = _cmds[i];
      }
    }

    if (_found) {
      return _found;
    } else {
      return {
        cmd: commandString,
        run: "default"
      }
    }
  }

  /**
   * Get a plugin's config file
   * @param {string} pluginID - Plugin to get config file for
   */
  GetConfigFile(plugin) {
    return new Promise(function(resolve, reject) {
      if (!plugin.configFile) {
        reject("No Config Set");
        return;
      }

      jsonfile.readFile(plugin.path + "/" + plugin.configFile, function(err, obj) {
        if (err) {
          reject(err);
          return
        }
        resolve(obj);
      });
    });
  }

  /**
   * Get a plugin's command file
   * @param {string} pluginID - Plugin to get command file for
   */
  GetCommandFile(plugin) {
    return new Promise(function(resolve, reject) {
      if (!plugin.commandsFile) {
        reject("No Command Set");
        return;
      }

      jsonfile.readFile(plugin.path + "/" + plugin.commandsFile, function(err, obj) {
        if (err) {
          console.log(err);
          reject(err);
          return
        }

        resolve(obj.commands);
      });
    });
  }

  /**
   * Write to a plugins's config
   * @param {string} pluginID - Plugin to set config file for
   * @param {object} config - Plugin to set config file for
   */
  SetConfigFile(plugin, config) {
    return new Promise(function(resolve, reject) {
      if (!plugin.configFile) {
        reject("No Config Set");
        return;
      }

      jsonfile.writeFile(plugin.path + "/" + plugin.configFile, config, function(err) {
        if (err) {
          reject(err);
          return
        }
        resolve();
      });
    });
  }
  /**
   * Write to a plugins's command file
   * @param {string} pluginID - Plugin to set config file for
   * @param {object} commands - Plugin to set command file for
   */
  SetCommandFile(plugin, commands) {
    return new Promise(function(resolve, reject) {
      if (!plugin.commandsFile) {
        reject("No Command Set");
        return;
      }

      jsonfile.writeFile(plugin.path + "/" + plugin.commandsFile, commands, function(err) {
        if (err) {
          console.log(err);
          reject(err);
          return
        }

        resolve();
      });
    });
  }
  /**
   * Get the plugin class from the plugin.json file
   * @param {string} pluginID - Plugin to get
   */
  GetScriptRequire(plugin) {
    return new Promise(function(resolve, reject) {
      if (!plugin.script) {
        reject("No Script Set");
        return;
      }

      var className = plugin.script;
      var path = plugin.path + "/" + className;
      async.waterfall([
        // Check if class exists
        function(callback) {
          Logger.Info("PluginManager", "Load-" + plugin.name, "Checking for class");
          fs.stat(path, function(err, stats) {
            if (err) {
              Logger.Error("PluginManager", "Load-" + plugin.name, "Failed to find Class (" + path + ")");
              callback(err);
              return;
            } else {
              Logger.Success("PluginManager", "Load-" + plugin.name, "Found Class");
              callback();
            }
          });
        },
        // Attempt to import the class
        function(callback) {
          Logger.Info("PluginManager", "Load-" + plugin.name, "Trying to import class");
          try {
            var NpmRequire = require("../" + path);

            Logger.Success("PluginManager", "Load-" + plugin.name, "Imported");

            callback(null, NpmRequire);
          } catch (e) {
            Logger.Error("PluginManager", "Load-" + plugin.name, "Failed to Import: " + className + " - '" + e + "'");
            callback(e, null);
          }
        },
      ], function(err, result) {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        resolve(result);

      });

    });
  }

}

module.exports = PluginManager;
