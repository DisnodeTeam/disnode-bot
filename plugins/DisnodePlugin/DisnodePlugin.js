class DisnodePlugin {
  constructor() {

  }
  default(command){
    var self = this;
    self.disnode.bot.SendEmbed(command.msg.channel,{
      color: 3447003,
      author: {},
      fields: [ {
        name: 'Disnode Info',
        inline: false,
        value: "Bot Info and Stats. Some info is updated every minute",
      }, {
        name: 'Uptime',
        inline: false,
        value: self.disnode.stats.getUptime(),
      }, {
        name: 'Total Messages',
        inline: true,
        value: self.disnode.stats.messages,
      }, {
        name: 'Commands',
        inline: true,
        value: self.disnode.stats.messagesParsed,
      }, {
        name: 'Servers',
        inline: false,
        value: self.disnode.stats.serverCount,
      }, {
        name: 'Channels',
        inline: true,
        value: self.disnode.stats.channelCount,
      }, {
        name: 'Members',
        inline: true,
        value: self.disnode.stats.memberCount,
      }, {
        name: 'Open DM\'s',
        inline: false,
        value: self.disnode.stats.directMessageCount,
      }],
        footer: {}
      }
    );
  }
}
module.exports = DisnodePlugin;
