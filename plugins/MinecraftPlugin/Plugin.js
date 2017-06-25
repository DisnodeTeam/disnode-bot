var axios = require('axios');
class MinecraftPlugin {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var self = this;
    var commandHelp = "";
    commandHelp += self.disnode.util.CommandHelpBuilder("skin <player name>", "Gets the skin of a minecraft user\n");
    self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Minecraft Plugin Commands", commandHelp)
  }
  commandSkin(command){
    var self = this;
    var user = command.params[0];
    if(!user){
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Minecraft Plugin Commands", ":warning: Please enter a Minecraft user!")
    }

    axios.get("https://mcapi.ca/skin/"+user+"/250/true").then(function(res){
      if(res){
        self.disnode.bot.SendEmbed(command.msg.channel_id, {
          title: "MC Skin for " + user,
          description: "Player Skin",
          image: {
            url: "https://mcapi.ca/skin/"+user+"/250/true",
            proxy_url: "https://mcapi.ca/skin/"+user+"/250/true",
            width: "250",
            height: "500"
          }
        })
      }else{
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Minecraft Plugin Commands", ":warning: No Skin Found")
      }

    }).catch(function(err){
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Minecraft Plugin Commands", ":warning: API Error: " + err)
    });
  }
}
module.exports = MinecraftPlugin;
