const DiscordBot = require('./bot');
const PluginManager = require ('./pluginmanager');
const CommandManager = require('./command');
const jsonfile = require('jsonfile');
const Logging = require('./logging')
class Disnode {
    constructor(config) {
        this.botConfigPath = config;
    }

    Start() {
      var self = this;

      this.LoadBotConfig().then(function(){
        Logging.DisnodeSuccess("Disnode", "Start", "Loaded Config");

        self.bot = new DiscordBot(self.botConfig.key)

      }).then(function(){
        Logging.DisnodeInfo("Disnode", "Start", "Connecting to Discord");

        return self.bot.Connect();

      }).then(function(){

      Logging.DisnodeSuccess("Disnode", "Start", "Connected to Discord");
      Logging.DisnodeInfo("Disnode", "Start", "Loading Plugins");
        self.plugin = new PluginManager();
        return self.plugin.Load("./plugins");

      }).then(function(){
          Logging.DisnodeSuccess("Disnode", "Start", "Plugins Loaded!");
          self.bot.client.on("message",(msg)=>self.OnMessage(msg));

        return self.plugin.Launch("TestPlugin")
      }).catch(function(err){
        Logging.DisnodeError("Disnode", "Start", err);
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
        Logging.DisnodeError("Disnode", "Restart", err);

      });

    }

    LoadBotConfig() {
      var self = this;

      return new Promise(function(resolve, reject) {
        if (!self.botConfigPath) {
          Logging.DisnodeWarning("Disnode", "LoadBotConfig", " No Bot Config Path Set!")

            reject(" No Bot Config Path Set");
        }
        Logging.DisnodeInfo("Disnode", "LoadBotConfig", " Loading Config!")

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

    OnMessage (msg){
      if(this.command){
        this.command.RunMessage(msg);
      }else{
        console.log("No Command");
      }
    }
}

module.exports = Disnode;
