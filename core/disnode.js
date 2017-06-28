const DiscordBot = require('./bot');
const PluginManager = require ('./pluginmanager');
const Communication = require('./communication')
const StateManager  = require ('./statemanager');
const Platform = require("./platform")
const Stats = require('./stats');
const jsonfile = require('jsonfile');
const Logging = require("disnode-logger");
const async = require('async');
const DBManager = require('./dbmanager')
const Util = require('./util')
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
            Logging.Success("Disnode", "Start", "Loaded Config");

            callback();
          }).catch(callback);
        },

        function(callback) {
          Logging.Info("Disnode", "Start", "Loading Core");

          self.stats    = new Stats(self);
          self.platform = new Platform(self);
          self.util     = new Util(self);
          self.state    = new StateManager(self);
          self.plugin = new PluginManager(self);
          callback();
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
          self.BindBotEvents();
          Logging.Success("Disnode", "Start", "Binded Events");

          self.PreLoad().then(function(){
            self.ready = true;
              callback();
              Logging.Success("Disnode", "Start", "Bot Ready!");
          });


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

    PreLoad(){
      var self = this;
      return new Promise(function(resolve, reject) {
        if(!self.bot){
          return;
        }
        Logging.Info("Disnode","Start", "Preloading Guilds " )
        async.eachSeries( self.bot.guilds, function(guild,callback){
          if(!guild || self.plugin.guilds[guild.id]){
            callback();
            return;
          }
          Logging.DisableLogs();
          self.plugin.NewInstance(guild.id).then(function(){
            callback();
          });

        },function(err){
          Logging.EnableLogs();
          if(err){
            Logging.Error("Disnode", "Start", "Error PreLoading: " + err)

            reject()
            return;
          }
          Logging.Success("Disnode","Start", "Finished Launching! Guilds: " + self.plugin.guilds.count)
          resolve();
        })
      });
    }

    BindBotEvents(){
      var self = this;
      if(!self.bot){
        return;
      }

      self.bot.on("guild_create",function(guild) {
        self.HandleGuildCreate(guild);
      });
      self.bot.on('message', function(data){
        // self.HandleMessage(data);
      });

    }

    HandleGuildCreate (data){
      var self = this;
      self.PreLoad();
    }

    HandleMessage (data){
      var firstLetter = data.content.substring(0, self.disnode.botConfig.prefix.length);
      if (self.disnode.ready && firstLetter == self.disnode.botConfig.prefix) {
        this.disnode.server.GetCommandInstancePromise(data.guildID).then(function(inst) {
          if (inst) {
            inst.RunMessage(data);
          } else {
            Logging.Warning("Disnode", "OnMessage", "No Command Handler!");
          }
        });
      }
    }


}

module.exports = Disnode;
