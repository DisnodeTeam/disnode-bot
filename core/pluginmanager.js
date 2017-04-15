var Logger     = require("disnode-logger");
const async    = require('async');
const fs       = require('fs');
const jsonfile = require('jsonfile');

class PluginManager{
  constructor(disnode){
    this.disnode   = disnode;
    this.instances = [];
    this.plugins   = [];
    this.PluginFolder ="./Plugins";
  }

  WatchPluginFolder(){

  }

  LoadPlugins(){
    var self = this;

    Logger.Info("PluginManager", "LoadPlugins", "Loading Plugins...");

    var _plugins = self.GetPluginFolders();

    Logger.Info("PluginManager", "LoadPlugins", "Plugin Folders Found: " + _plugins.length);

    return new Promise(function(resolve, reject) {
      async.each(_plugins, function(pluginName, everyCB) {
        //Run 'LoadPlugin' for each found pluginName
        self.LoadPlugin(pluginName).then(function(result){
          //Once Done return result (plugin)
          everyCB(null, result);
        }).catch(everyCB);

      }, function(err, res) {
        if(err){
          reject(err);
          return;
        }
        resolve();
        return;
      });
    });

  }

  LoadPlugin(pluginName){
    var self = this;
    Logger.Info("PluginManager", "LoadPlugin", "Loading Plugin: " + pluginName);

    return new Promise(function(resolve, reject) {

      var newPlugin = {
        name: pluginName
      };

      async.waterfall([
        function(cb){
          self.CheckForPluginClass(newPlugin,cb)
        },
        function(cb){
          self.LoadPluginClass(newPlugin,cb)
        },
      ], function (err, result) {
        if(err){
          reject(err);
          return;
        }
        resolve(result);
        return;
      });
    });
  }

  UnloadPlugin(){

  }

  //Util Functions



  // Load Functions

  GetPluginFolders(){
    return fs.readdirSync(this.PluginFolder);
  }

  CheckForPluginClass(plugin, callback){

    var self = this;
    var path = self.PluginFolder + "/" + plugin.name + "/"+plugin.name+".js";

    Logger.Info("PluginManager", "CheckForPluginClass-"+plugin.name, "Checking for class");
    fs.stat(path, function(err, stats) {
        if (err) {
            Logger.Error("PluginManager", "CheckForPluginClass-"+plugin.name, "Failed to find Class (" + path + ")");
            callback(err);
            return;
        }
        Logger.Success("PluginManager", "CheckForPluginClass-"+plugin.name, "Found Class");

        plugin.classPath = path;
        plugin.path      = self.PluginFolder + "/" + plugin.name + "/";

        callback(null);
    });

  }

  LoadPluginClass(plugin, callback){
    var self = this;

    Logger.Info("PluginManager", "LoadPluginClass-"+plugin.name, "Loading Class");

    try{
      var _require = require("../" + plugin.classPath);
      Logger.Success("PluginManager", "LoadPluginClass-"+plugin.name, "Imported Class");
      callback(null, _require);
      return;
    }catch(err){
      Logger.Error("PluginManager", "LoadPluginClass-"+plugin.name, "Failed to Import Class: " + err);
      callback(err, null);
      return;
    }
  }

  GetPluginJsonFiles(){

  }

  LoadPluginJsonFiles(){

  }

  RegisterWithCommand(){

  }

}

module.exports = PluginManager;
