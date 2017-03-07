const DiscordBot = require('./bot');
const PluginManager = require ('./pluginmanager');
const CommandManager = require('./command');
const ConfigManager = require('./config');
const DBManager = require("./db")

const jsonfile = require('jsonfile');
const Logging = require('./logging');
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

          Logging.DisnodeInfo("Disnode", "Start", "Loading Config");
          self.LoadBotConfig().then(function(){
            self.bot = new DiscordBot(self.botConfig.key, self);
            Logging.DisnodeSuccess("Disnode", "Start", "Loaded Config");
            callback();
          }).catch(callback);
        },
        // Connect to Discord
        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Connecting to Discord");
          self.bot.Connect().then(function(){
            Logging.DisnodeSuccess("Disnode", "Start", "Connected to Discord");
            callback();
          });
        },
        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Binding Events");
          self.bot.bindOnMessage((data) => self.OnMessage(data));
          callback();
        },
        // Create Command Handler
        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Loading Config Manager");
          self.config = new ConfigManager();

          callback();
        },
        // Load Functions
        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Loading Plugins");
          self.plugin = new PluginManager(self);
          self.plugin.Load("./plugins").then(function(){
            Logging.DisnodeSuccess("Disnode", "Start", "Plugins Loaded!");
            callback();
          }).catch(callback);
        },
        // Bind Events

        // Create Command Handler
        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Loading Command Handler");
          self.command = new CommandManager(self);
          callback();
        },

        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Loading DB Manager");
          self.DB = new DBManager(self);

          setTimeout(function () {
            self.DB.Init();
            callback();
          }, 500);
        },

        // Launch Static Plugins
        function(callback) {
          Logging.DisnodeInfo("Disnode", "Start", "Launching static plugins");
          self.plugin.LauchStatic().then(function(){
            Logging.DisnodeSuccess("Disnode", "Start", "Static Plugins Launched!");
            callback();
          }).catch(callback);
        },
      ], function (err, result) {
          if(err){
            Logging.DisnodeError("Disnode", "Start", err)
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
        Logging.DisnodeError("Disnode", "Restart", err);

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
        Logging.DisnodeWarning("Disnode", "Message", "No Command Handler!");
      }
    }


}

module.exports = Disnode;
