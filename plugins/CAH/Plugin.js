const Session = require('./Session.js');
const axios = require("axios")
const CAHUtil = require("./CAHUtil");

class CAH {
  constructor() {
    this.sessions = [];
    this.util = new CAHUtil()
  }
  default(command) {
    var self = this;
    var msg = "";

  }
  commandNew(command) {
    var self = this;
    self.util.NewGame(command.msg.user).then((result) => {

      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Game Created!", "**" + command.msg.user.username + "** created a game! \nCode: `" + result.gameCode + "`");
    }).catch((err) => {
      console.log(err.data)
      self.disnode.bot.SendMessage(command.msg.channelID, err.response.data.data || "Error");
    });
  }

  commandInfo(command) {
    var self = this;

    var gameCode = command.params[0];

    if (!gameCode) {
      return self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", "**Please enter a game code**");
    }

    self.util.GetGame(gameCode).then((result) => {
      return self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", JSON.stringify(result, 0, 2));
    }).catch((err) => {
      
      self.disnode.bot.SendMessage(command.msg.channelID, err.response.data.data || err.message ||  "Error");
    });
  }
}


module.exports = CAH;
