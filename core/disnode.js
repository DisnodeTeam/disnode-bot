const DiscordBot = require('./bot');
const PluginManager = require ('./pluginmanager');
const CommandManager = require('./command');
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

        self.plugin = new PluginManager();
        return self.plugin.Load("./plugins");
      }).then(function(){
        self.command = new CommandManager();
        return self.command.Load('./plugins');
      }).then(function(){
        
      }).catch(function(err){
        console.log("[Disnode 'Start'] ERROR:", err);
      });

    }
    Stop() {
      var self = this;
      self.bot.Disconnect();
    }

    Restart() {
      var self = this;
      self.bot.Disconnect().then(function(){
        self.bot.Connect();
      }).catch(function(err){
        console.log("[Disnode 'Restart'] ERROR:", err);
      });

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
