"use strict"
const jsonfile = require('jsonfile');
class ConfigManager {

  constructor(options){
    this.config = {};
    this.path = options.path;

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
    console.log("[ConfigManager]" + self.path);
    jsonfile.readFile(self.path, function(err, obj) {
      console.error(err);
      console.log("[ConfigManager] Config Loaded!");
      self.config = obj;
      //console.dir(obj);

      cb();
    });
  }
}

module.exports = ConfigManager;
