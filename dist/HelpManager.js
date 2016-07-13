"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HelpManager = function () {
  function HelpManager(options) {
    _classCallCheck(this, HelpManager);

    this.defaultConfig = {
      commands: [{
        "cmd": "help",
        "context": "HelpManager",
        "run": "cmdHelp",
        "desc": "Displays Help.",
        "usage": "help"
      }]
    };

    var self = this;
    //Created Class Varables for Disnode and Options
    self.disnode = options.disnode;
    self.options = options;
    // Loads Config.
    self.config = self.disnode.config.TestManager;
    //Defaults if saying isn't provided
  }

  _createClass(HelpManager, [{
    key: "cmdHelp",
    value: function cmdHelp(parsedMsg) {
      var self = this;

      var SendString = "``` === HELP === \n";
      for (var i = 0; i < self.disnode.CommandHandler.list.length; i++) {
        var cmd = self.disnode.CommandHandler.list[i];
        //cmd.cmd, cmd.desc,cmd.usage
        SendString = SendString + "-" + self.disnode.CommandHandler.prefix + cmd.cmd + " : " + cmd.desc + " - " + self.disnode.CommandHandler.prefix + cmd.usage + "\n";
        SendString = SendString + "\n";
      }
      SendString = SendString + "```";
      self.disnode.bot.sendMessage(parsedMsg.msg.channel, SendString);
    }
  }]);

  return HelpManager;
}();

module.exports = HelpManager;