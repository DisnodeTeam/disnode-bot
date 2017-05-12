const DiscordBot = require('./bot');
const ServerManager = require ('./servermanager');

const StateManager  = require ('./statemanager');
const Stats = require('./stats');
const jsonfile = require('jsonfile');
const Logging = require("disnode-logger");
const async = require('async');
const DBManager = require('./dbmanager')


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
            self.stats = new Stats(self);
            Logging.Success("Disnode", "Start", "Loaded Config");
            callback();
          }).catch(callback);
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
          Logging.Success("Disnode", "Start", "Binded Events");
          callback();
        },
        function(callback) {
          if(self.botConfig.db.use_db){
            Logging.Info("Disnode", "Start", "Loading DB Manager");
            self.db = new DBManager(self);
            callback();
          }else {
            Logging.Info("Disnode", "Start", "Loading of DB skipped because user wished not to use DB");
            callback();
          }
       },
       function(callback) {
         Logging.Info("Disnode", "Start", "Loading State Manager");
         self.state = new StateManager(self);
         Logging.Success("Disnode", "Start", "Loaded State Manager");
         callback();
       },
        // Create Command Handler
        function(callback) {
          Logging.Info("Disnode", "Start", "Loading Server Manager");
          self.server = new ServerManager(self);
          Logging.Success("Disnode", "Start", "Loaded Server Manager");
          callback();
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
      this.server.GetCommandInstancePromise(msg.server).then(function(inst){

        if(inst){
          inst.RunMessage(msg);
        }else{
          Logging.Warning("Disnode", "Message", "No Command Handler!");
        }
      });


    }


}

module.exports = Disnode;
