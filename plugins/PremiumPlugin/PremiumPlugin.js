var axios = requrie('axios');

class PremiumPlugin {
  constructor() {
    this.var = "VAR!#!#!##"
  }
  default(command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    self.disnode.bot.SendMessage(command.msg.channel, "WORKING!: ");

    self.GetUserRole(command.msg.userID).then(function (role) {
      if (role == "USER_NOT_FOUND") {
        self.disnode.bot.SendMessage(command.msg.channel, "You are not signed up on the DisnodeTeam website! (could not find user in DB)");
        return;
      }
      self.disnode.bot.SendMessage(command.msg.channel, "PREM STATUS: " + role);

    })

  }
  GetUserRole(userID) {
    var self = this;
    console.log("RUNNING CHECK!");
    
    return new Promise(function (resolve, reject) {
      axios.get("https://www.disnodeteam.com/api/user/"+userID+"/ultra")
      .then(function(res){
        resolve(res.data);
      }).catch(reject)

    });
  }
}
module.exports = PremiumPlugin;
