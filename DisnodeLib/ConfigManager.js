"use strict"
const jsonfile = require('jsonfile');
const colors = require('colors');
class ConfigManager {

  constructor(options){
    this.config = {};
    this.path = options.path;

  }

  saveConfig(){
    var self = this;
    jsonfile.writeFile(self.path, self.config, {spaces: 2}, function(err) {
        console.error(err);
        console.log("[ConfigManager] Config Saved!".green);
    });
  }

  loadConfig(cb){
    var self = this;
    console.log("[ConfigManager] Loading Config: " + self.path);
    jsonfile.readFile(self.path, function(err, obj) {
      if(err){
        console.log(colors.red(err));
      }
      console.log("[ConfigManager] Config Loaded!".green);
      self.config = obj;
      //console.dir(obj);

      cb();
    });
  }
}

module.exports = ConfigManager;
