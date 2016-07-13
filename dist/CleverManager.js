"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CleverManager = function () {
  function CleverManager(options) {
    _classCallCheck(this, CleverManager);

    ;
    this.defaultConfig = {
      commands: [{
        "cmd": "clever",
        "context": "CleverManager",
        "run": "cmdCLEVER",
        "desc": "Cleverbot.",
        "usage": "clever [Phrase, or 'new' to refresh cleverbot]"
      }]
    };

    this.disnode = options.disnode;
    var Cleverbot = require('cleverbot-node');
    console.log("[Cleverbot] Init");
    if (options.channelid) {
      this.channelid = options.channelid;
    } else {
      console.log("[Cleverbot INIT ERROR] No \'channelid\' found in options object, cannot use Cleverbot without a channelid");
      return;
    }
    this.cb = new Cleverbot();
    this.enabled = false;
    Cleverbot.prepare(function () {});
  }

  _createClass(CleverManager, [{
    key: "sendMsg",
    value: function sendMsg(Message, cb) {
      var self = this;
      self.cb.write(Message, function callb(reply) {
        cb(reply['message']);
      });
    }
  }, {
    key: "cmdCLEVER",
    value: function cmdCLEVER(parsedMsg) {
      var self = this;

      if (parsedMsg.params[0] == "new") {
        self.CleverManager.cb = new Cleverbot();
        self.disnode.bot.sendMessage(parsedMsg.msg.channel, "```Cleverbot has been Refreshed```");
      } else {
        if (self.enabled) {
          self.enabled = false;
          self.disnode.bot.sendMessage(parsedMsg.msg.channel, "```Cleverbot is no longer active```");
        } else {
          self.enabled = true;
          self.disnode.bot.sendMessage(self.channelid, parsedMsg.params[0]);
        }
      }
    }
  }, {
    key: "cleverMessage",
    value: function cleverMessage(msg) {
      var self = this;

      if (msg.author.name == self.disnode.bot.user.username) {
        if (self.enabled && msg.channel.id == self.channelid) {
          setTimeout(function () {
            self.sendMsg(msg.content, function cb(reply) {
              self.disnode.bot.sendMessage(msg.channel, reply);
            });
          }, 1500);
        }
      }
    }
  }]);

  return CleverManager;
}();

module.exports = CleverManager;

// NOT DOING THIS REAL. ITS A BLUFF