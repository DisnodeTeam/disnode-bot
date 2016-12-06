const fs = require('fs');
const async = require('async');
class PluginManager{
  constructor(){

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

      var Classes = [];

      async.every(_ManagerFolders, function(folder, callback){
        var className = folder + ".js";
        var fullPath = path + "/"+ folder + "/" + className;
        async.waterfall([
          function(callback){
            fs.stat(fullPath, function(err, stats){
              if(err){
                console.log("[PluginManager 'Load'] Failed to find Class ("+className+") in: " + folder + "/" + className);
                callback(error, null);
                return;
              }else{
                console.log("[PluginManager 'Load'] Found Class "+className);
                callback(null);
              }
            });
          },
          function(callback){
            try{
              var NpmRequire = require("../" + fullPath);
              console.log("[PluginManager 'Load'] Imported "+className);
              callback(null, NpmRequire);
            }catch (e){
              console.log("[PluginManager 'Load'] Failed to Import "+className);
              callback(e, null);
            }
          },
          function(imported, callback){
            console.log("adding");
            Classes.push(imported);
            callback();
          },

        ], function(err, result){
          if(err){console.log(err);}
          callback();
        });
      }, function(err, res){

        console.log(Classes);
        resolve();
      });

    });

  }
}

module.exports = PluginManager;
