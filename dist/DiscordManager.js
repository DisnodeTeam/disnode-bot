"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colors = require('colors');

var DiscordManager = function () {
  function DiscordManager(options) {
    _classCallCheck(this, DiscordManager);

    var FS = require('fs');
    this.bot = options.disnode.bot;
    this.fs = FS;
  }

  _createClass(DiscordManager, [{
    key: 'setGame',
    value: function setGame(Game, cb) {
      var self = this;
      if (Game == undefined || Game == "") {
        self.bot.setPlayingGame(null, function (err) {
          cb(err);
        });
      } else {
        self.bot.setPlayingGame(Game, function (err) {
          cb(err);
        });
      }
    }
  }, {
    key: 'setAvatar',
    value: function setAvatar(path, cb) {
      var self = this;
      self.fs.readFile(path, { encoding: 'base64' }, function (err, data) {
        if (err) {
          cb(err);
        }
        var data = "data:image/jpeg;base64," + data;
        console.log("[DiscordManager]".grey + " Image Icon Read. Setting.");
        self.bot.setAvatar(data, function (err) {
          if (err) {
            cb(err);
          } else {
            cb("SET");
          }
        });
      });
    }
  }, {
    key: 'setName',
    value: function setName(Name, cb) {
      if (Name == undefined || Name == "" || Name == null) {
        cb("NAME_NULL");
        return;
      } else {
        self.bot.setUsername(Name, function (err) {
          if (err != null) {
            cb(err);
          } else {
            cb("OK");
          }
        });
      }
    }
  }]);

  return DiscordManager;
}();

module.exports = DiscordManager;