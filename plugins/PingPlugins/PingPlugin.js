class PingPlugin {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    this.disnode.bot.SendMessage(command.msg.channel, "Pong!");
  }
  dingCommand(command){ // This is a normal command Example !ping ding
    this.disnode.bot.SendMessage(command.msg.channel, "Dong!");
  }
}
module.exports = PingPlugin;
