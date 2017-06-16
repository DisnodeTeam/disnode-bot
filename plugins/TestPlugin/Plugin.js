class TestPlugin {
  constructor() {
    this.sendServer = "";

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var bot = self.disnode.bot;

    bot.SendMessage(command.msg.server, "Starting Test Suite!")
    .catch(function(err){
      console.log("ERROR SENDING MESSAGE!" + err);
    })

  }

}
module.exports = TestPlugin;
