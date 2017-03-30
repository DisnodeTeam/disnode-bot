const DiscordBot = require('./bot');
const PluginManager = require ('./pluginmanager');
const CommandManager = require('./command');
const ConfigManager = require('./config');
const DBManager = require("./db")
const Communication = require("./communication");
const jsonfile = require('jsonfile');
const Logging = require("disnode-logger");
const async = require('async');

class Disnode {
    constructor(config) {
        this.botConfigPath = config;
    }

    Start() {
      var self = this;
      async.waterfall([
        // Load Config and Init bot
        function(callback) {

          Logging.Info("Disnode", "Start", "Loading Config");
          self.LoadBotConfig().then(function(){
            self.bot = new DiscordBot(self.botConfig.key, self);
            Logging.Success("Disnode", "Start", "Loaded Config");
            callback();
          }).catch(callback);
        },
        function(callback) {
          Logging.Info("Disnode", "Start", "Setting Communication Server");
          self.communication = new Communication(self);
          Logging.Info("Disnode", "Start", "Starting Communication Server");
          self.communication.StartClient().then(function(){
            Logging.Success("Disnode", "Start", "Started Communication Server");
            callback();
          });
        },
        // Connect to Discord
        function(callback) {
          Logging.Info("Disnode", "Start", "Connecting to Discord");
          self.bot.Connect().then(function(){
            Logging.Success("Disnode", "Start", "Connected to Discord");
            callback();
          });
        },
        function(callback) {
          Logging.Info("Disnode", "Start", "Binding Events");
          self.bot.bindOnMessage((data) => self.OnMessage(data));
          callback();
        },
        // Create Command Handler
        function(callback) {
          Logging.Info("Disnode", "Start", "Loading Config Manager");
          self.config = new ConfigManager();

          callback();
        },
        // Load Functions
        function(callback) {
          Logging.Info("Disnode", "Start", "Loading Plugins");
          self.plugin = new PluginManager(self, "./plugins");
          self.plugin.Load().then(function(){
            Logging.Success("Disnode", "Start", "Plugins Loaded!");
            callback();
          }).catch(callback);
        },
        // Launch Static Plugins
        function(callback) {
          Logging.Info("Disnode", "Start", "Launching static plugins");
          self.plugin.LauchStatic().then(function(){
            Logging.Success("Disnode", "Start", "Static Plugins Launched!");
            callback();
          }).catch(callback);
        },
        // Bind Events

        // Create Command Handler
        function(callback) {
          Logging.Info("Disnode", "Start", "Loading Command Handler");
          self.command = new CommandManager(self);
          callback();
        },

        function(callback) {
          if(self.botConfig.db.use_db){
            Logging.Info("Disnode", "Start", "Loading DB Manager");
            self.DB = new DBManager(self);
            Logging.Info("Disnode", "Start", "Connecting to DB...");
            self.DB.Init(self.botConfig.db).then(function(){
              Logging.Success("Disnode", "Start", "DB Connected!");
              callback();
            }).catch(callback);
          }else {
            Logging.Info("Disnode", "Start", "Loading of DB skipped because user wished not to use DB");
          }
        },

      ], function (err, result) {
          if(err){
            Logging.Error("Disnode", "Start", err)
          }
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
        Logging.Error("Disnode", "Restart", err);

      });

    }

    LoadBotConfig() {
      var self = this;

      return new Promise(function(resolve, reject) {
        if (!self.botConfigPath) {
          //Logging.DisnodeWarning("Disnode", "LoadBotConfig", " No Bot Config Path Set!")
            reject(" No Bot Config Path Set");
        }
        //Logging.DisnodeInfo("Disnode", "LoadBotConfig", " Loading Config!")

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
        Logging.Warning("Disnode", "Message", "No Command Handler!");
      }
    }


}

module.exports = Disnode;
