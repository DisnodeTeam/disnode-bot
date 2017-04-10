class FaceStealer {
  constructor() {


  }

  default (command) {

    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Commands", "!id roles \n");
  }
  commandSteal(command){
    if(!command.params[0]){
        this.disnode.bot.SendCompactEmbed(command.msg.channel, "FaceStealer Error", "Please Mention a User :x:");
        this.Close();
        return;
    }
    var userId = this.parseMention( command.params[0])

    console.log(this.disnode.bot.client.getAllUsers(function(err){
      console.log(err);
    }));
    if(!userId){
        this.disnode.bot.SendCompactEmbed(command.msg.channel, "FaceStealer Error", "Failed to parse Mention :x:");
        this.Close();
        return;
    }
    var user = this.disnode.bot.GetUserByID(command.msg.server, userId)
    console.log(user);
    if(!user){
        this.disnode.bot.SendCompactEmbed(command.msg.channel, "FaceStealer Error", "Failed to Find User :x:");
        this.Close();
        return;
    }


    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Roles", "");
    this.Close();
    return;
  }

  parseMention(dataString){
    var self = this;
    var returnV = dataString;
    returnV = returnV.replace(/\D/g,'');
    return returnV;
  }
}

module.exports = FaceStealer;
