class PingPlugin {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    this.disnode.bot.SendMessage(command.msg.channel, "PREM STATUS: " + GetUserRole(command.msg.userID));
  }
  GetUserRole(userID){
    return "ULTRA";
  }
}
module.exports = PingPlugin;
