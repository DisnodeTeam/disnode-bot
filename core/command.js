const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
class Command{
  constructor(){
    this.commands = [];
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

      console.log("[CommandManager 'Load'] Loading Command");


      async.every(_ManagerFolders, function(folder, callback){

        var className = folder + "-Commands.json";
        var fullPath = path + "/"+ folder + "/" + className;

        async.waterfall([

          function(callback){ //Check if file exists

            fs.stat(fullPath, function(err, stats){
              if(err){
                console.log("[CommandManager 'Load'] Failed to find Command File ("+className+") in: " + folder + "/" + className);
                callback(err);
                return;
              }else{
                console.log("[CommandManager 'Load'] Found Command File: "+className);
                callback();
              }
            });

          },

          function(callback){ // Read File
            jsonfile.readFile(fullPath, function(err, obj) {
              if(err){
                  callback(err, null);
                  return;
              }
              console.log("[CommandManager 'Load'] Loaded JSON File: "+className);
              callback(null, obj);
            });
          },

          function(imported, callback){ // Get Command
            if(imported.commands){
              self.commands.push({
                plugin: folder,
                commands: imported.commands
              });
              console.log("[CommandManager 'Load'] Finished Loading: "+className);
              callback();
            }else{
              callback("No Command Array");
            }
          },


        ], function(err, result){
          if(err){
            console.log("[CommandManager 'Load'] Error:", err);
          }
          callback(err, result); // Finish Waterfall
        });
      }, function(err, res){
        console.log("[CommandManager 'Load'] Loaded "+ self.commands.length +" plugin(s) commands");
        resolve();
      });
    });
  }
}

module.exports = Command;
