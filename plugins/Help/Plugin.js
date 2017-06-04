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
        plugins += "- " + plugin.name + " (" + plugin.id + ") **PREFIX:** `" + self.disnode.botConfig.prefix + config.prefix + "`\n"
        cb();
      });

    }, function () {
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 3447003,
        author: {},
        fields: [{
          name: 'Plugins:',
          inline: false,
          value: plugins,
        }, {
          name: 'Discord Server',
          inline: false,
          value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
        }],
        footer: {}
      });

    });



  }

}
module.exports = Help;