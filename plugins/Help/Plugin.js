const async = require('async')

class Help {
  constructor() {

  }
  default (command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;

    var pm = this.disnode.server.GetPluginInstance(self.server);
    var plugins = "";
    async.each(pm.plugins, function (plugin,cb) {
      pm.GetConfigFile(plugin).then(function (config) {
        plugins += '`' + self.disnode.botConfig.prefix + config.prefix + '` - ' + plugin.name + '\n'
        cb();
      });

    }, function () {
      var bStuff = self.disnode.bot.GetBotInfo();
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 3447003,
        author: {
          name: bStuff.username + '\'s Help',
          icon_url: "https:\/\/cdn.discordapp.com\/avatars\/" + bStuff.id + "\/" + bStuff.avatar + ".png"
        },
        fields: [{
          name: '\nCommands',
          inline: false,
          value: plugins,
        }, {
          name: 'Disnode Ultra',
          inline: true,
          value: "Want more benefits on your favorite plugins?\nSubscribe to [ultra!](https://disnodeteam.com/#/ultra)",
        },
        {
          name: "‌‌ ",
          inline: true,
          value: "[Bot Invite](https://discordapp.com/oauth2/authorize?client_id=" + bStuff.id + "&scope=bot&permissions=410019886)\n[Support Server](https://discord.gg/AbZhCen)",
        }],
        footer: {}
      });

    });



  }

}
module.exports = Help;
