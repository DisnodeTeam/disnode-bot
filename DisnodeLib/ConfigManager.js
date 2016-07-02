"use strict"
const jsonfile = require('jsonfile');
class ConfigManager {

  constructor(path){
    this.config = {};
    this.path = path;

  }

  saveConfig(){
    var self = this;
    jsonfile.writeFile(self.path, self.config, {spaces: 2}, function(err) {
        console.error(err);
        console.log("[ConfigManager] Config Saved!");
    });
  }

  loadConfig(cb){
    var self = this;

    jsonfile.readFile(self.path, function(err, obj) {
      console.log("[ConfigManager] Config Loaded!");
      self.config = obj;
      console.dir(obj );

      cb();
    });
  }
}

module.exports = ConfigManager;
