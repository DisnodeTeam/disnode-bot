"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require("events");
var Discord = require("discord.js");
var jsonfile = require('jsonfile');
var colors = require('colors');

var Disnode = function (_EventEmitter) {
  _inherits(Disnode, _EventEmitter);

  function Disnode(key, configPath) {
    _classCallCheck(this, Disnode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Disnode).call(this));

    _this.key = key;
    _this.configPath = configPath;
    _this.config = {};
    return _this;
  }

  _createClass(Disnode, [{
    key: "startBot",
    value: function startBot() {
      var _this2 = this;

      var self = this;

      this.bot = new Discord.Client();

      this.bot.loginWithToken(this.key);

      this.bot.on("ready", function () {
        return _this2.botReady();
      });
      this.bot.on("message", function (msg) {
        return _this2.botRawMessage(msg);
      });

      this.botInit();
    }
  }, {
    key: "saveConfig",
    value: function saveConfig() {
      var self = this;
      jsonfile.writeFile(self.configPath, self.config, { spaces: 2 }, function (err) {
        console.error(err);
        console.log("[Disnode] Config Saved!".green);
      });
    }
  }, {
    key: "loadConfig",
    value: function loadConfig(cb) {
      var self = this;
      console.log("[Disnode] Loading Config: " + self.configPath);
      jsonfile.readFile(self.configPath, function (err, obj) {
        if (err) {
          console.log(colors.red(err));
        }
        console.log("[Disnode] Config Loaded!".green);
        self.config = obj;
        cb();
      });
    }
  }, {
    key: "botInit",
    value: function botInit() {
      var self = this;
      this.emit("Bot_Init");
    }
  }, {
    key: "botReady",
    value: function botReady() {
      var self = this;
      self.emit("Bot_Ready");
    }
  }, {
    key: "botRawMessage",
    value: function botRawMessage(msg) {
      var self = this;
      if (self.CleverManager) {
        self.CleverManager.cleverMessage(msg);
      }
      if (self.CommandHandler) {
        self.CommandHandler.RunMessage(msg);
      }
      this.emit("Bot_RawMessage", msg);
    }
  }, {
    key: "addManager",
    value: function addManager(data) {
      var self = this;
      var path;
      var option = data.options;
      option.disnode = self;

      if (data.path) {
        path = data.path;
      } else {
        path = "./" + data.name + ".js";
      }

      self[data.name] = {};
      self[data.name].package = require(path);
      self[data.name] = new self[data.name].package(option);
      if (self.CommandHandler) {
        this.CommandHandler.AddContext(self[data.name], data.name);
      }
      if (!self.config[data.name] && self[data.name].defaultConfig) {
        self.addDefaultManagerConfig([data.name], self[data.name].defaultConfig);
      } else {}
      if (self.config[data.name]) {
        if (self.config[data.name].commands) {
          self.addDefaultManagerCommands(data.name, self.config[data.name].commands);
        }
      }
    }
  }, {
    key: "addDefaultManagerConfig",
    value: function addDefaultManagerConfig(name, config) {
      var self = this;
      console.log("[Disnode] Loading Defaults for: " + name);
      self.config[name] = {};
      self.config[name] = config;
      self.saveConfig();
    }
  }, {
    key: "addDefaultManagerCommands",
    value: function addDefaultManagerCommands(name, commands) {
      var self = this;
      console.log("[Disnode] Loading Commands for: " + name);
      for (var i = 0; i < commands.length; i++) {
        if (self.CommandHandler) {
          self.CommandHandler.AddCommand(commands[i]);
        }
      }
    }
  }, {
    key: "postLoad",
    value: function postLoad() {
      var self = this;
      if (self.CommandHandler) {
        this.CommandHandler.AddContext(self, "disnode");
      }
      //console.dir(self.YoutubeManager);
    }
  }, {
    key: "parseString",
    value: function parseString(raw, parsedMsg, customShortCuts) {
      var final = raw;

      if (customShortCuts) {
        for (var i = 0; i < customShortCuts.length; i++) {
          var cur = customShortCuts[i];
          if (final.includes(cur.shortcut)) {
            final = final.replace(cur.shortcut, cur.data);
          }
        }
      }

      if (final.includes("[Sender]")) {
        final = final.replace("[Sender]", parsedMsg.msg.author.mention());
      }

      //TODO: Change to Dynamic Params
      if (final.includes("[Param0]")) {
        final = final.replace("[Param0]", parsedMsg.params[0]);
      }
      if (final.includes("[Param1]")) {
        final = final.replace("[Param1]", parsedMsg.params[1]);
      }
      if (final.includes("[Param2]")) {
        final = final.replace("[Param2]", parsedMsg.params[2]);
      }
      if (final.includes("[Param3]")) {
        final = final.replace("[Param3]", parsedMsg.params[3]);
      }
      if (final.includes("[Param4]")) {
        final = final.replace("[Param4]", parsedMsg.params[4]);
      }
      if (final.includes("[Param5]")) {
        final = final.replace("[Param5]", parsedMsg.params[5]);
      }

      return final;
    }
  }]);

  return Disnode;
}(EventEmitter);

module.exports = Disnode;