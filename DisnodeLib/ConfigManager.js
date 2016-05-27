"use strict"
class ConfigManager{
  constructor(cfgPath, jsonfile){
    this.cfgPath = cfgPath;
    this.jsonfile = jsonfile;
    this.Config = [];
    this.loadConfig();
  }
  loadConfig(){
    this.Config = this.jsonfile.readFileSync(this.cfgPath);
  }
  saveConfig(){
    this.jsonfile.writeFileSync(this.cfgPath, this.Config);
  }
  newCfgItem(n,v){ //n = Name v = Value
    this.Config.push({name:n,value:v});
    this.saveConfig();
  }
}

module.exports.ConfigManager = ConfigManager;
