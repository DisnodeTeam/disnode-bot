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
    timer.start();
    Logger.Info("PluginManager-"+this.server, "LoadAllPlugins", "Loading All Plugins!")
    var self = this;


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
    })
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
            obj.path = path;
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


}

module.exports = PluginManager;
