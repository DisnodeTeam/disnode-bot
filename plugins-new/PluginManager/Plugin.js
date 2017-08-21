
const axios = require('axios');
class PluginManager {

  default(command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var commandHelp = "";
    commandHelp += self.disnode.util.CommandHelpBuilder("add <plugin-id>", "_OWNER_ Downloads and adds a plugin to your server\n");
    commandHelp += self.disnode.util.CommandHelpBuilder("remove <plugin-id>", "_OWNER_ Removes a plugin from your server \n");
    commandHelp += self.disnode.util.CommandHelpBuilder("list", "List all plugins on the sever \n");
    commandHelp += self.disnode.util.CommandHelpBuilder("info <plugin-id>", "Show info about a plugin\n");
    commandHelp += self.disnode.util.CommandHelpBuilder("browse <page>", "Browse Plugins\n");
    commandHelp += self.disnode.util.CommandHelpBuilder("prefix <plugin-id> <new prefix>", "Set the prefix of a new plugin\n");
    commandHelp += self.disnode.util.CommandHelpBuilder("config set <plugin-id> <key> <value>", "Set the config value of a plugin\n");
    commandHelp += self.disnode.util.CommandHelpBuilder("config add <plugin-id> <key> <value>", "Add an element to a config array\n");
    commandHelp += self.disnode.util.CommandHelpBuilder("config remove <plugin-id> <key> <value>", "Remove an element from a config array\n");
    self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Plugin Manager Commands", commandHelp)
  }

  commandAdd(command) {
    var self = this;


    if (!command.params[0]) {
      this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please Enter a Plugin ID! (Can be found at http://disnodeteam.com/#/plugins)");
      return;
    }
    self.disnode.bot.SendMessage(command.msg.channel_id, "**Downloading Plugin:** `" + command.params[0] + "`")
    self.pluginManager.AddServerPluginRemote(command.params[0]).then(function () {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id,
        "Success :white_check_mark: ", "**Added Plugin! This plugin can now be used and configured for this server!:** `" + command.params[0] + "`");
    }).catch(function(err){
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", err);
    });
  }

  commandRemove(command) {
    if(command.flags.permissionDenied){
        this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "You do not have permission to run this command!");
        return;
    }
    var self = this;
    if (!command.params[0]) {
      this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please Enter a Plugin ID! (Can be found at http://disnodeteam.com/#/plugins)");
      return;
    }

    self.pluginManager.RemoveServerPlugin(command.params[0]);
  }

  commandList(command) {
    var self = this;
    var LoadedText = "";

    for (var i = 0; i < self.pluginManager.plugins.length; i++) {
      var _plugin = self.pluginManager.plugins[i];
      LoadedText += " - **" + _plugin.name + "** - *" + _plugin.id + "* \n";
    }

    var LaucnhedText = "";

    for (var i = 0; i < self.pluginManager.instances.length; i++) {
      var _plugin = self.pluginManager.instances[i];
      LaucnhedText += " - **" + _plugin.name + "** - *" + _plugin.id + "* \n";
    }

    self.disnode.bot.SendEmbed(command.msg.channel_id, {
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
      }, {
        name: "Launched",
        inline: true,
        value: LaucnhedText
      }],
      footer: {}
    });

    self.Destory();

  }
  commandInfo(command) {

    var self = this;
    if (!command.params[0]) {
      this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please Enter a Plugin ID! (Can be found at http://disnodeteam.com/#/plugins)");
      return;
    }
    self.disnode.bot.SendMessage(command.msg.channel_id, "**Getting Plugin:** `" + command.params[0] + "`")

    axios.get("https://www.disnodeteam.com/api/plugins/" + command.params[0]).then(function (res) {
      var suc = res.data.type;
      switch (suc) {
        case "SUC":
          self.disnode.bot.SendEmbed(command.msg.channel_id, {
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
              value: "**Desc:** `" + res.data.data.description + '`'
            },
            {
              name: "Verified",
              inline: true,
              value: self.parseBool(res.data.data.verified, "<:plugin_verified:320783752265596928> (Verified)")
            }, {
              name: "Offical",
              inline: true,
              value: self.parseBool(res.data.data.official, "<:plugin_official:320783752110276618> (Made by Disnode)")
            }, {
              name: "Ultra Rewards",
              inline: true,
              value:self.parseBool(res.data.data.ultraReward, "<:plugin_ultra_rewards:320783752026390528> (Rewards for Ultra Users)")
            }],
            footer: {}
          });

          break;
        case "ERR":
          self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", res.data.data);
          break;
      }
    });
  }

  commandBrowse(command) {
    var self = this;

    axios.get("http://www.disnodeteam.com/api/plugins/").then(function (res) {
      var suc = res.data.type;
      switch (suc) {
        case "SUC":
          var plugins = res.data.data;
          var page = 1;
          var maxindex;
          var startindex;
          if (parseInt(command.params[0]) >= 1) {
            page = Number(parseInt(command.params[0]));
          }
          if (page == 1) {
            page = 1;
            startindex = 0
            maxindex = 10;
          } else {
            maxindex = (page * 10);
            startindex = maxindex - 10;
          }

          var msg = "**Page:** " + page + "\n";
          for (var i = startindex; i < plugins.length; i++) {
            if (i == maxindex) break;
            if (plugins[i].verified) { msg += "-`" + plugins[i].id + "` - **" + plugins[i].name + "** - *" + plugins[i].description + "*\n"; }



          }
          self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Plugins (Only Verified Plugins, see http://disnodeteam.com/#/plugins for all)", msg);


          break;
        case "ERR":
          self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", res.data.data);
          break;
      }
    });
  }

  commandConfig(command) {
    var self = this;
    var plugin = command.params[0];
    var key = command.params[1];
    var value = command.params[2];

    if (!plugin) {
      this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please Enter a Plugin ID!");
      return;
    }

    if (!key) {
      this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please Enter a key!");
      return;
    }
    if (!value) {
      this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please Enter a value!");
      return;
    }

    var pluginManager = self.disnode.server.GetPluginInstance(self.server);
    
    pluginManager.ChangePluginConfig(plugin, key, value).then(function(){
      self.disnode.bot.SendMessage(command.msg.channel_id, "Reloaded!")
    })

  }


  parseBool(val, render){
    if(val){return render;}else{return ":x:"}
  }
}
module.exports = PluginManager;
