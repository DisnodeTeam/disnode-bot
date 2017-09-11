var axios = require('axios');

class PremiumPlugin {
  constructor() {
    this.var = "VAR!#!#!##"
  }
  default(command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;

    self.disnode.platform.GetUserUltra(command.msg.user.id).then(function (role) {

      if(role){
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Ultra", ":white_check_mark: You Have Ultra!");
      }else{
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Ultra", ":x: Ultra Disabled!");
      }

    }).catch(function(err){
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error :warning: ", "Error With Request: " + err );
    });

  }

}
module.exports = PremiumPlugin;
