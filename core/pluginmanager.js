const fs = require('fs');
const async = require('async');
class PluginManager{
  constructor(){
    this.classes = [];
  }

  Load(path){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(!path){
        reject("No Path!");
      }

      var _ManagerFolders = [];

      //Load Directories. Its sync since this Function is already
      //wrapped in a Promise
      _ManagerFolders = fs.readdirSync(path);

      if(!_ManagerFolders){
        reject("Managers Null!")
      }

      console.log("[PluginManager 'Load'] Loading Classes");


      async.every(_ManagerFolders, function(folder, callback){

        var className = folder + ".js";
        var fullPath = path + "/"+ folder + "/" + className;

        async.waterfall([
          function(callback){

            fs.stat(fullPath, function(err, stats){
              if(err){
                console.log("[PluginManager 'Load'] Failed to find Class ("+className+") in: " + folder + "/" + className);
                callback(err);
                return;
              }else{
                console.log("[PluginManager 'Load'] Found Class "+className);
                callback();
              }
            });

          },

          function(callback){
            try{
              var NpmRequire = require("../" + fullPath);
              console.log("[PluginManager 'Load'] Imported "+className);
              callback(null, NpmRequire);
            }catch (e){
              console.log("[PluginManager 'Load'] Failed to Import: "+className, e);
              callback(e, null);
            }
          },

          function(imported, callback){
            console.log("[PluginManager 'Load'] Finished Loading: "+className);
            self.classes.push(imported);
            callback();
          },

        ], function(err, result){
          callback(err, result); // Finish Waterfall
        });
      }, function(err, res){
        console.log("[PluginManager 'Load'] Loaded " + self.classes.length + " plugin(s)");
        resolve();
      });
    });

  }
}

module.exports = PluginManager;
