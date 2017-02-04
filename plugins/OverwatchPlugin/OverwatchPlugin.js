var fetchUrl = require("fetch").fetchUrl;
class TestPlugin {
  constructor() {

  }

  default(command){
    console.log('DEFAULT!');
    command.msg.channel.sendMessage("Commands: \nprofile (username) [platform] [region] \nstats (username) [platform] [region] \n");
  }

  commandProfile(command){
    var name = command.params[0];
    var self = this;
    if(!name || name == ""){
      command.msg.channel.sendMessage("Please enter a BattleID!");
      return;
    }

    var platform = "pc";

    if(command.params[1] == "pc" || command.params[1] == "xbl" || command.params[1] == "psn"){
      platform = command.params[1];
    }else{
      command.msg.channel.sendMessage("2nd Parameter is not a platform! Please enter one of the platforms: `pc` `xbl` `psn`");
    }
      var region = "us";
    if(command.params[2] == "us" || command.params[2] == "eu" || command.params[2] == "kr" || command.params[2] == "cn" || command.params[2] == "global"){
      region = command.params[1];
    }else{
      command.msg.channel.sendMessage("3rd Parameter is not a region! Please enter one of the regions: `us` `eu` `kr` `cn` `global`");
    }



    fetchUrl("http://ow-api.herokuapp.com/profile/"+platform+"/"+region+"/"+name.replace("#", "-"), function(error, meta, body){
      console.log(body.toString());
    });

  }
}

module.exports = TestPlugin;
