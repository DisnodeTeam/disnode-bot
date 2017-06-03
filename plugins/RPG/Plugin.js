class RPGPlugin {
  constructor() {}
  default(command){
    var self = this;
    var msg = "";
    for (var i = 0; i < self.class.commands.length; i++) {
      msg += self.disnode.botConfig.prefix + self.class.config.prefix + " " + self.class.commands[i].cmd + " - " + self.class.commands[i].desc + "\n";
    }
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 3447003,
      author: {},
      fields: [ {
        name: 'RPG',
        inline: true,
        value: "Hello, " + command.msg.user + "!",
      },{
        name: 'Commands:',
        inline: true,
        value: msg,
      }, {
        name: 'Discord Server',
        inline: false,
        value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
      }],
        footer: {}
    });
  }

}
module.exports = RPGPlugin;
