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
    this.instances = {}, // Launched plugins
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
          if(!pluginObject.load){return;}
          self.plugins[pluginObject.id] = pluginObject;
          self.plugins.count += 1;



        });
        Logger.Success("PluginManager", "LoadPlugins-"+self.id, "Loaded Guild Plugins("+ self.plugins.count+")")
      }

      Logger.Info("PluginManager", "LoadPlugins-"+self.id, "Loading Default Plugins("+defaultPluginsPaths.length+")")

      defaultPluginsPaths.forEach(function(pluginPath) {
        var pluginObject = self.GeneratePluginObject(pluginPath);
        if(pluginObject == null){return;}
          if(!pluginObject.load){return;}
        self.plugins[pluginObject.id] = pluginObject;
        self.plugins.count += 1;

      });
      Logger.Success("PluginManager", "LoadPlugins-"+self.id, "Loaded Default Plugins("+ self.plugins.count+")")
      self.LoadPrefixes();
      Logger.Success("PluginManager", "LoadPlugins-"+self.id, "Loaded Prefixes("+ self.prefixes.count+")")
      self.LaunchOnStart().then(function(){
          resolve(self.plugins);
      })
    });
  }

  LaunchOnStart(){
    var self = this;

    return new Promise(function(resolve, reject) {
      async.eachSeries(self.plugins, function(plugin, cb){
        if(plugin.launchOnStart){
          self.LaunchPlugin(plugin.id).then(function(){
            cb();
          });
        }else{
          cb();
        }
      },function(err){
        resolve();
      });
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
    var plugin = {path: pluginPath};
    if(pluginPath.includes("./servers/")){
      plugin.isServer = true;
    }

    var files = this.ReadJSONFiles(pluginPath);
    if(!files){
      return null;
    }


    merge(plugin, files['plugin'])
    delete files['plugin'];
    merge(plugin, files)

    if(plugin.commands){
      plugin.commands = plugin.commands.commands;
    }

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

      if(fileName.includes('Commands')){
        fileName = "commands";
      }
      if(fileName.includes('Config')){
        fileName = "config";
      }

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

      if(!plugin.config){continue}
      self.prefixes[plugin.config.prefix] = plugin.id;

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
    var command = self.GetCommand(pluginID, commandText) || {cmd: "_default", run: "default", isDefault: true};
    if(!command.isDefault ){
      params.splice(0,1);
    }
    var sendObject = {command: command, msg: msgObject, params: params};

    self.LaunchPlugin(pluginID).then(function(instance){

      if(!instance[command.run]){
        return;
      }

      instance[command.run](sendObject);
    });
  }

  LaunchPlugin(pluginID, commandObject) {
    var self = this;
    Logger.Info("PluginManager-" + self.id, "LaunchPlugin", "Requesting Plugin: " + pluginID);
    return new Promise(function(resolve, reject) {

      if(self.instances[pluginID]){
        resolve(self.instances[pluginID]); return;
      }
      Logger.Info("PluginManager-" + self.id, "LaunchPlugin", "Launching New Plugin: " + pluginID);
      var pluginFile = self.plugins[pluginID];
      var _newPlugin = {};

      self.GetScriptRequire(pluginFile).then(function(requireClass) {
        pluginFile.disnode = self.disnode;
        pluginFile.pluginManager = self;
        pluginFile.server = self.id;
        pluginFile.guildId = self.id;
        _newPlugin = merge(new requireClass(), pluginFile);

        self.disnode.stats.pluginInstances++;

        _newPlugin.Destory = function() {
          self.DestoryPlugin(_newPlugin.id);
        }
        if (_newPlugin.Init) {
          _newPlugin.Init(function() {
            self.instances[_newPlugin.id] = _newPlugin;
            resolve(_newPlugin);
          })
        } else {
          resolve(_newPlugin);
          self.instances[_newPlugin.id] = _newPlugin;
        }

      }).catch(function(err) {
        console.log(err);
        reject(err);
      })
    });
  }

  DestoryPlugin(pluginID) {
    var self = this;

    Logger.Success("PluginManager-" + self.id, "DestoryPlugin", "Destroyed Plugin Instance: " + pluginID);
    delete self.instances[pluginID];
    self.disnode.stats.pluginInstances--;
  }
  GetCommand(pluginID, command){
    var plugin = this.plugins[pluginID];

    if(!plugin.commands){return null;}
    for (var i = 0; i < plugin.commands.length; i++) {
      if(plugin.commands[i].cmd == command){
        return plugin.commands[i]
      }
    }
    return null;
  }
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

}

module.exports = PluginManager;
