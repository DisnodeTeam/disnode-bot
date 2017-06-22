class EightBall {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    if(!self.config.responses || self.config.responses.length == 0){
      console.log(command.msg);
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, ":crystal_ball: 8 Ball", ":warning: 8Ball Config Responses are Null or Empty!");
      return;
    }
    var response = self.config.responses[Math.floor(Math.random()*self.config.responses.length)];
    self.disnode.bot.SendCompactEmbed(command.msg.channel_id, ":crystal_ball: 8 Ball",response);
  }

}
module.exports = EightBall;
