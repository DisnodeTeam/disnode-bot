const DiscordBot = require('./bot');
const ServerManager = require ('./servermanager');
const Communication = require('./communication')
const StateManager  = require ('./statemanager');
const Platform = require("./platform")
const Stats = require('./stats');
const jsonfile = require('jsonfile');
const Logging = require("disnode-logger");
const async = require('async');
const DBManager = require('./dbmanager')
const Util = require('./util')
const Discoin = require('./Discoin')
/** Main Disnode Class. Holds all features and interaction with Disnode
@constructor
* @param {string} configPath - Path to Bot Config.

 */
class Disnode {
    constructor(config) {
        this.botConfigPath = config;
        this.ready = false;
    }
    /**
    * Starts the Bot
    */
    Start() {
      var self = this;
      async.waterfall([
        // Load Config and Init bot
        function(callback) {

          Logging.Info("Disnode", "Start", "Loading Config");
          self.LoadBotConfig().then(function(){
            self.bot = new DiscordBot(self.botConfig.key, self);
            self.stats = new Stats(self);
            self.platform = new Platform(self);
             self.util = new Util(self);
             self.dsc = Discoin;
            Logging.Success("Disnode", "Start", "Loaded Config");
            callback();
          }).catch(callback);
        },
        function(callback) {
           if(self.botConfig.relayServer){
             Logging.Info("Disnode", "Start", "Loading Communication");
             self.communication = new Communication(self);
             self.communication.Connect();
             callback();
           }else {
             Logging.Info("Disnode", "Start", "Not using relay server");
             callback();
           }
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
          self.bot.SetUpLocalBinds();
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

          if(self.botConfig.preload){
            Logging.Info("Disnode", "Start", "PRE-LAUNCHING INSTANCES FOR ALL GUILDS! Disabling Logs.");
            Logging.DisableLogs();
            setTimeout(function () {
              var guilds = [];

              async.eachSeries( self.bot.guilds, function(guild,callback){
                if(!guild){
                  callback();

                  return;
                }
                var commandManager = self.server.GetCommandInstancePromise(guild.id).then(function(){

                    setTimeout(function () {
                      callback();
                    }, 10);
                })
              },function(err){
                Logging.EnableLogs();
                if(err){
                  Logging.Error("Disnode", "Start", "Error PreLoading: " + err)
                  self.ready = true;
                  callback();
                  return;
                }
                Logging.Success("Disnode","Start", "Finished Launching! Guilds: " + self.bot.guilds.count)
                self.ready = true;
                callback();
              })
            }, 1000);
          }else{
            self.ready = true;
            callback();
          }

        },



      ], function (err, result) {
          if(err){
            Logging.Error("Disnode", "Start", err)
          }
      });
    }

    /**
    * Stops the Bot
    */
    Stop() {
      var self = this;
      self.bot.Disconnect();
    }
    /**
    * Restarts the Bot
    */
    Restart() {
      var self = this;
      self.bot.Disconnect().then(function(){
        self.bot.Connect();
      }).catch(function(err){
        Logging.Error("Disnode", "Restart", err);

      });

    }
    /**
    * Load the Bot Config from a path to an object `self.botConfig`
    */
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
    /**
    * Event called when messages are recieved
    * @param {MessageObject} msg - Recieved Message
    */
    OnMessage (msg){
      this.server.GetCommandInstancePromise(msg.guildID).then(function(inst){

        if(inst){
          inst.RunMessage(msg);
        }else{
          Logging.Warning("Disnode", "Message", "No Command Handler!");
        }
      });


    }


}

module.exports = Disnode;
