class Template {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    self.disnode.bot.SendMessage(command.msg.channel, "WORKING!: " );


  }

}
module.exports = Template;
