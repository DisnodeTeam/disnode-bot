const DiscordBot = require('./bot');
const jsonfile = require('jsonfile');
class Disnode {
    constructor(config) {
        this.botConfigPath = config;
    }

    Start() {
      var self = this;

      this.LoadBotConfig().then(function(){
        console.log("[Disnode 'Start'] Loaded Config");
        self.bot = new DiscordBot(self.botConfig.key)
      }).then(function(){
        console.log("[Disnode 'Start'] Connecting to Discord");
        return self.bot.Connect();
      }).then(function(){
        console.log("[Disnode 'Start'] Bot Connected!");
      }).catch(function(err){
        console.log("[Disnode 'Start'] ERROR:", err);
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
