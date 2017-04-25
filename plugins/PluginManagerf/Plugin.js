class PluginManager {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping


  }

  commandAdd(command){
    var self = this;
    if(!command.params[0]){
      self.disnode.bot.SendMessage(command.msg.channel, "Please Enter a Plugin ID!" );
    }

    self.pluginManager.AddServerPlugin(command.params[0]);
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

  commandRemove(command){
    var self = this;
    if(!command.params[0]){
      self.disnode.bot.SendMessage(command.msg.channel, "Please Enter a Plugin ID!" );
    }

    self.pluginManager.RemoveServerPlugin(command.params[0]);
  }



}
module.exports = PluginManager;
