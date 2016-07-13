"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlayListManager = function () {
  function PlayListManager(options) {
    _classCallCheck(this, PlayListManager);

    this.defaultConfig = {
      defaultSaying: "Default Saying",
      responses: {
        printSay: "[Sender] Says: [Saying]"
      },
      commands: [{
        cmd: "testManager",
        run: "cmdTest",
        context: "TestManager",
        usage: "testManager",
        desc: "Default Manager Test Command"
      }]
    };

    var self = this;
    //Created Class Varables for Disnode and Options
    self.disnode = options.disnode;
    self.options = options;
    // Loads Config.
    self.config = self.disnode.config.TestManager;
    //Defaults if saying isn't provided
    if (options.saying) {
      self.saying = options.saying;
    } else {
      self.saying = self.config.defaultSaying;
    }
  }

  _createClass(PlayListManager, [{
    key: "cmdTest",
    value: function cmdTest(parsedMsg) {
      var self = this;
      var parse = self.disnode.parseString;
      //Adds Shortcut for Saying
      var customShortCuts = [{ shortcut: "[Saying]", data: self.saying }];

      self.disnode.bot.sendMessage(parsedMsg.msg.channel, parse(self.saying, parsedMsg, customShortCuts));
    }
  }]);

  return PlayListManager;
}();

module.exports = PlayListManager;