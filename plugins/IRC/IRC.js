const tmi = require('tmi.js');
const sleep = require('system-sleep');
const IRCUtils = require('./IRCUtils.js');

class IRCPlugin {
  constructor() {
    var self = this;
    self.DB = {};
    self.utils = {};
  }
  Init(onComplete) {
    var self = this;
    self.disnode.db.InitPromise({}).then(function(dbo) {
      self.DB = dbo;
      self.utils = new IRCUtils(self);
      onComplete();
    });
  }
  default (command) {
    var self = this;
  }
  connect(command) {
    var self = this;
    var irc = [];
    self.DB.Find("IRC", {
      "id": command.msg.guildID
    }).then(function(found) {
      irc = found[0];
      if (found[0] == undefined) {
        var newServer = {
          id: command.msg.guildID,
          channels: [],
          owners: []
        }
        self.DB.Insert("IRC", newServer);
        irc = newServer;
      }
      self.utils.irc('add', command).then(function(status) {
        if (status.good == true) {
          if (status.coun > 1) {
            sleep(1000);
            self.utils.irc('stop', command);
            self.utils.irc('start', command);
          } else self.utils.irc('start', command);
        }
      });
    });
  }
  stop(command) {
    var self = this;
    if (command.msg.author.id == '160168328520794112') {
      self.utils.irc('stop', command);
    }
  }
  start(command) {
    var self = this;
    if (command.msg.author.id == '160168328520794112') {
      self.utils.irc('start', command);
    }
  }

}
module.exports = IRCPlugin;
// Made by Hazed SPaCE✘#2574
