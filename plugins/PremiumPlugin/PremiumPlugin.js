class PremiumPlugin {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    self.GetUserRole(command.msg.userID).then(function(role){
      if(role == "USER_NOT_FOUND"){
          self.disnode.bot.SendMessage(command.msg.channel, "You are not signed up on the DisnodeTeam website! (could not find user in DB)");
        return;
      }
      self.disnode.bot.SendMessage(command.msg.channel, "PREM STATUS: " + role);
    })

  }
  GetUserRole(userID){
      var self = this;
    return new Promise(function(resolve, reject) {

      self.disnode.DB.Find("users", {discordID: userID}).then(function(res){
        console.log(res);
        if(res[0]){
            resolve(res[0].role);
        }else{
          resolve("USER_NOT_FOUND");
        }
      });

    });
  }
}
module.exports = PremiumPlugin;
