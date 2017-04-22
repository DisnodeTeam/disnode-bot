var Logger     = require("disnode-logger");
const async    = require('async');
const fs       = require('fs');
const jsonfile = require('jsonfile');
var Stopwatch = require('timer-stopwatch');

var timer = new Stopwatch();
class PluginManager{
  constructor(disnode, server){
    this.server    = server;
    this.disnode   = disnode;
    this.instances = [];
    this.plugins   = [];
  }

  LoadAllPlugins(){
    var self = this;
    return new Promise(function(resolve, reject) {
      timer.start();
      Logger.Info("PluginManager-"+self.server, "LoadAllPlugins", "Loading All Plugins!")



      async.waterfall([
        // Load Server Plugins
        function(cb){
          self.GetPluginFiles("./servers/"+self.server, true).then(function(plugins){

            for (var i = 0; i < plugins.length; i++) {
              self.plugins.push(plugins[i]);

            }
            cb();
          });
        },
        function(cb){
        //Load Default Plugins
          self.GetPluginFiles("./plugins/",false).then(function(plugins){

            for (var i = 0; i < plugins.length; i++) {

              var alreadyAdded = false;
              //Run Check for alreadyAdded plugins
              for (var x = 0; x < self.plugins.length; x++) {

                if(self.plugins[x].id == plugins[i].id){
                  alreadyAdded = true;
                }
              }

              if(!alreadyAdded){
                self.plugins.push(plugins[i]);
              }
            }
            cb();
          });
        }
      ], function(err, res){
        timer.stop();
        Logger.Success("PluginManager-"+self.server, "LoadAllPlugins", "Loaded "+ self.plugins.length + " plugins in " + timer.ms + "ms!");
        timer.reset();
        resolve();
      })
    });
  }

  RunPluginMessage(plugin, commandObject){
    console.log("LAUCNING: " + plugin);
  }

  GetDefaultPlugins(){

  }

  GetServerPlugins(){

  }


  GetPluginFiles(path, isServer){
    var folders = fs.readdirSync(path);
    var self = this;
    return new Promise(function(resolve, reject) {
      var Plugins = [];
      async.each(folders, function(_folder, cb){

        jsonfile.readFile(path + "/" + _folder + "/plugin.json", function(err,obj){
          if(!err){
            obj.path = path + "/" + _folder;
            obj.isServer = isServer;

            Plugins.push(obj);
            cb();
            return;
          }else{
            Logger.Warning("PluginManager-"+self.server, "GetPluginFolders", "Error Finding plugin.json file: " + _folder)
            cb();
            return;
          }
          cb();
        })

      }, function(err, res){

        resolve(Plugins)
      })
    });

  }


  GetCommandPrefixes(){
    var self = this;
    return new Promise(function(resolve, reject) {

      var prefix = [];
      console.log(self.plugins);
      async.each(self.plugins, function(plugin,cb){
        console.log("Running EACH!");
        self.GetConfigFile(plugin).then(function(config){

          prefix.push({plugin: plugin.id, prefix: config.prefix});
          cb();
        })
      }, function(err, res){
        if (err) console.error(err);

        resolve(prefix);
      })

    });
  }

  GetConfigFile(plugin){
    return new Promise(function(resolve, reject) {
      if(!plugin.configFile){
        reject("No Config Set");
        return;
      }

      jsonfile.readFile(plugin.path + "/"+plugin.configFile, function(err, obj){
        if(err){
          reject(err);
          return
        }
        resolve(obj);
      });
    });
  }


}

module.exports = PluginManager;
