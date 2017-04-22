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
    var self = this;

    var listText = "Plugins: \n";

    for (var i = 0; i < self.pluginManager.plugins.length; i++) {
     var _plugin = self.pluginManager.plugins[i];
     listText +=" - **" + _plugin.name + "** - **" + _plugin.id + "** - *" + _plugin.path + "*\n";
    }
    self.disnode.bot.SendMessage(command.msg.channel,listText);
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
