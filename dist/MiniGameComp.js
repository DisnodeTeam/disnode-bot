"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MiniGameComp = function () {
  function MiniGameComp(bot, fs) {
    _classCallCheck(this, MiniGameComp);

    this.bot = bot;
    this.fs = fs;
  }

  _createClass(MiniGameComp, [{
    key: "AddUser",
    value: function AddUser(identifier, name, money, xp, lv, health, attack, cb) {
      var Adding = { id: identifier, Username: name, cash: money, exp: xp, lvl: lv, hp: health, atk: attack };
      cb(Adding);
    }
  }, {
    key: "CheckDB",
    value: function CheckDB(msg, dbArray, cb) {
      var i = 0;
      var f = false;
      dbArray.forEach(function (obj) {
        if (obj.id == msg.author.id) {
          cb(true, i);
          f = true;
        }
        i++;
      });
      if (!f) {
        cb(false, 0);
      }
    }
  }, {
    key: "CheckDBwithID",
    value: function CheckDBwithID(id, dbArray, cb) {
      var i = 0;
      var f = false;
      dbArray.forEach(function (obj) {
        if (obj.id == id) {
          cb(true, i);
          f = true;
        }
        i++;
      });
      if (!f) {
        cb(false, 0);
      }
    }
  }]);

  return MiniGameComp;
}();

module.exports.MiniGameComp = MiniGameComp;