class Template {
  constructor() {
    this.sendServer = "";
  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    self.disnode.bot.SendMessage(command.msg.channel, "WORKING!: " );


  }


  commandState(command){
    var self = this;
    if(!self.state){
      self.state = self.disnode.state.Init(self);

    }
    self.sendServer = command.msg.channel;
    self.disnode.state.CallFunction(self, "testStateFunction","TEST");
  }
  commandStateSet(command){
    this.state.data[command.params[0]] = command.params[1];
    console.log(this.state);
  }

  commandStateGet(command){
    this.disnode.bot.SendMessage(command.msg.channel, "WORKING!: " + this.state.data[command.params[0]]);

  }
  testStateFunction(command){
    this.disnode.bot.SendMessage(  this.sendServer, JSON.stringify(this.state.data))
    console.log("TEST STATE FUNCTION!", this.server);
  }

}
module.exports = Template;
