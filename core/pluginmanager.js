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
    Logger.Info("PluginManager-"+this.server, "LoadAllPlugins", "Loading All Plugins!")
    var self = this;
    self.GetPluginFiles("./servers/"+self.server);
  }

  GetDefaultPlugins(){

  }

  GetServerPlugins(){

  }


  GetPluginFiles(path){
    var folders = fs.readdirSync(path);

    return new Promise(function(resolve, reject) {
      var Plugins = [];
      async.each(folders, function(_folder, cb){
        jsonfile.readFile(path + "/" + _folder + "/plugin.json", function(err,obj){
          if(!err){
            Plugins.push(obj);
            cb();
          }else{
            console.log(err);
          }
        })
      })
    }, function(){
      console.log(Plugins);
    });

  }


}

module.exports = PluginManager;
