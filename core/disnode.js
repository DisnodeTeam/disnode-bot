const DiscordBot = require('./bot');
const jsonfile = require('jsonfile');
class Disnode {
    constructor(config) {
        this.botConfigPath = config;
    }

    Start() {
      var self = this;

      this.LoadBotConfig().then(function(){
        console.log(self.botConfig);
      }).catch(function(err){
        console.log("ERROR:", err);
      });

    }

    Stop() {

    }

    Restart() {

    }

    LoadBotConfig() {
      var self = this;

      return new Promise(function(resolve, reject) {
        if (!self.botConfigPath) {
            console.log("[Disnode 'LoadBotConfig'] No Bot Config Path Set!");
            reject(" No Bot Config Path Set");
        }

        console.log("[Disnode 'LoadBotConfig'] Loading Config!");

        self.botConfig = {}; // Creates/Clears Object.

        jsonfile.readFile(self.botConfigPath, function(err, obj) {
            if(err){
              reject(err) // If Error Call Catch for Promise
            }
            self.botConfig = obj;
            resolve(); // If Loaded Call Resolve for promise
        });
      });
    }
}

module.exports = Disnode;
