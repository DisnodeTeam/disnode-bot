"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SayManager = function () {
  function SayManager(options) {
    _classCallCheck(this, SayManager);

    this.options = options;

    this.defaultConfig = {
      responses: {
        errEnterCommand: "Please Enter a Command (First Parameter)",
        errEnterSay: "Please Enter a Say (Secound Parameter)"
      },
      commands: [{
        "cmd": "addSay",
        "context": "SayManager",
        "run": "cmdAddSay",
        "desc": "Create a new say command!",
        "usage": "addSay [command] [response]"
      }]
    };

    this.config = this.options.disnode.config.SayManager;
  }

  _createClass(SayManager, [{
    key: "cmdAddSay",
    value: function cmdAddSay(parsedMsg) {
      var self = this;
      var command = parsedMsg.params[0];
      var say = parsedMsg.params[1];
      if (!command) {
        self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, self.config.responses.errEnterCommand);
      }
      if (!say) {
        self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, self.config.responses.errEnterSay);
      }
      if (command && say) {
        self.addSayCommand(command, say);
      }
    }
  }, {
    key: "addSayCommand",
    value: function addSayCommand(command, say) {
      var self = this;
      var config = self.options.disnode.config;

      var newSayComand = {
        cmd: command,
        run: "cmdSay",
        context: "SayManager",
        desc: "Prints Entered Command",
        usage: command,
        params: {
          sayText: say
        }
      };

      config.commands.push(newSayComand);
      self.options.disnode.saveConfig();
      self.options.disnode.loadConfig(function () {
        self.config = self.options.disnode.config.SayManager;
        self.options.disnode.addDefaultManagerCommands("SayManager", config.commands);
      });
      console.log("[SayManager] New Say Command Added!");
    }
  }, {
    key: "cmdSay",
    value: function cmdSay(parsedMsg, params) {
      var self = this;

      var printText = self.options.disnode.parseString(params.sayText, parsedMsg);
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, printText);
    }
  }]);

  return SayManager;
}();

function GetMsgOffCommand(cmdName, list) {
  var found = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].cmd == cmdName) {
      found = list[i];
    }
  }

  return found;
}

module.exports = SayManager;