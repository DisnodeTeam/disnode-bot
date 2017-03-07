class CasinoPlugin {
  constructor() {

  }
  default (command) {
    var self = this;
    self.disnode.bot.SendCompactEmbed(command.msg.channel, "Test", "Test");
  }
}

module.exports = CasinoPlugin;
