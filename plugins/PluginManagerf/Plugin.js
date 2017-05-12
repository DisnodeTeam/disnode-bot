
const axios = require('axios');
class PluginManager {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping


  }

  commandAdd(command){
    var self = this;
    if(!command.params[0]){
      this.disnode.bot.SendCompactEmbed(command.msg.channel, "Error :warning: ", "Please Enter a Plugin ID! (Can be found at http://disnodeteam.com/#/plugins)" );

    }
    self.disnode.bot.SendMessage(command.msg.channel,"**Downloading Plugin:** `" + command.params[0] + "`")
    self.pluginManager.AddServerPlugin(command.params[0]).then(function(){
      this.disnode.bot.SendCompactEmbed(command.msg.channel, "Success :white_check: ", "**Added Plugin! This plugin can now be used and configured for this server!:** `" + command.params[0] + "`");

    });
  }
  commandList(command){
    var self = this;
    var LoadedText = "";

    for (var i = 0; i < self.pluginManager.plugins.length; i++) {
     var _plugin = self.pluginManager.plugins[i];
     LoadedText +=" - **" + _plugin.name + "** - *" + _plugin.id + "* - `" + _plugin.path + "`\n";
    }

    var LaucnhedText = "";

    for (var i = 0; i < self.pluginManager.instances.length; i++) {
     var _plugin = self.pluginManager.instances[i];
     LaucnhedText +=" - **" + _plugin.name + "** - *" + _plugin.id + "* - `" + _plugin.path + "`\n";
   }

    self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 3447003,
        author: {},
        fields: [{
            name: "**Server**",
            inline: true,
            value: "**Server:** `" + self.server + "`"
        },
        {
            name: "Stats",
            inline: true,
            value: "**Instances:** `" + self.pluginManager.instances.length + "` **- Loaded:** `" + self.pluginManager.plugins.length + '`'
        },
        {
            name: "Loaded",
            inline: true,
            value: LoadedText
        },{
            name: "Launched",
            inline: true,
            value: LaucnhedText
        }],
        footer: {}
    });



  }
  commandInfo(command){
    console.log("INFO!");
    var self = this;
    if(!command.params[0]){
        this.disnode.bot.SendCompactEmbed(command.msg.channel, "Error :warning: ", "Please Enter a Plugin ID! (Can be found at http://disnodeteam.com/#/plugins)" );
    }
    self.disnode.bot.SendMessage(command.msg.channel,"**Getting Plugin:** `" + command.params[0] + "`")

    axios.get(" http://localhost:8000/api/plugins/"+command.params[0]).then(function(res){
      var suc = res.data.type;
      switch(suc){
        case "SUC":
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 3447003,
            author: {},
            fields: [{
                name: "**Name**",
                inline: true,
                value: "**Name:** `" + res.data.data.name + "`"
            },
            {
                name: "Desc",
                inline: true,
                value: "**Desc:** `" + res.data.data.desc + '`'
            },
            {
                name: "Verified",
                inline: true,
                value: res.data.data.verified
            },{
                name: "Offical",
                inline: true,
                value: res.data.data.official
            },{
                name: "Ultra Rewards",
                inline: true,
                value: res.data.data.ultraReward
            }],
            footer: {}
        });

        break;
        case "ERR":
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error :warning: ", res.data.data);
        break;
      }
    });
  }

  commandRemove(command){
    var self = this;
    if(!command.params[0]){
        this.disnode.bot.SendCompactEmbed(command.msg.channel, "Error :warning: ", "Please Enter a Plugin ID! (Can be found at http://disnodeteam.com/#/plugins)" );
    }

    self.pluginManager.RemoveServerPlugin(command.params[0]);
  }



}
module.exports = PluginManager;
