class Template {
  constructor() {
    this.sendServer = "";

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;

    var params = self.disnode.util.JoinParams(command.params, 2);

    self.disnode.bot.SendMessage(command.msg.channel,"Params: " + params);


  }

  OnMessageUpdate(command){
      this.disnode.bot.SendMessage(command.msg.channel, "UPDATED MSG: " + command.msg.id + " **->**`" + command.msg.message +"`");
  }
  OnMessageDelete(command){
      this.disnode.bot.SendMessage(command.msg.channel, "DELETED MSG: " + command.msg.id );
  }
  commandState(command){

    var functionCall = command.params[0] || "dump";
    var self = this;

    if(!self.state){
      self.state = self.disnode.state.Init(self);
    }
    switch (functionCall) {
      case "dump":
          self.disnode.bot.SendMessage(command.msg.channel, "WORKING!: " + JSON.stringify(self.state.data));
      case "get":
          self.disnode.bot.SendMessage(command.msg.channel, "WORKING!: " + self.state.data[command.params[0]]);
      break;

      case "set":
          self.state.data[command.params[1]] = command.params[2];
      break;

      case "function":
          if(command.params[1] == "auth"){
            if(self.stateAuth){
              self.state.CallFunction("testStateFunction", "");
            }else{
              self.disnode.bot.SendMessage(command.msg.channel, "No Auth!");
            }
          }else{
            self.state.CallFunction("testStateFunction", "");
          }
      break;


    }
    self.sendServer = command.msg.channel;

  }

  testStateFunction(command){
    this.disnode.bot.SendMessage(  this.sendServer, JSON.stringify(this.state.data))
    console.log("TEST STATE FUNCTION!", this.server);
  }

}
module.exports = Template;
