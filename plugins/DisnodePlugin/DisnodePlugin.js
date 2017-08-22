class DisnodePlugin {
    constructor() {

    }
    default (command) {
        var self = this;
        self.disnode.stats.updateServerMemberCount();
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 3447003,
            author: {},
            fields: [{
                name: 'Disnode Info',
                inline: false,
                value: "Bot Info and Stats",
            }, {
                name: 'Servers',
                inline: true,
                value: self.disnode.stats.serverCount,
            }, {
                name: 'Channels',
                inline: true,
                value: self.disnode.stats.channelCount,
            }, {
                name: 'Commands',
                inline: true,
                value: self.disnode.stats.messagesParsed,
            }, {
                name: 'Members',
                inline: true,
                value: self.disnode.stats.memberCount,
            }, {
                name: 'Total Messages',
                inline: true,
                value: self.disnode.stats.messages,
            },
            {
               name: 'Plugin Instances',
               inline: true,
               value: self.disnode.stats.pluginInstances,
           },
           {
              name: 'Plugin Managers',
              inline: true,
              value: self.disnode.stats.pluginManagers,
          },
          {
             name: 'Command Managers',
             inline: true,
             value: self.disnode.stats.commandManagers,
         }, {
            name: 'Uptime',
            inline: true,
            value: self.disnode.stats.getUptime(),
        }],
        footer: {}
        });
    }
}
module.exports = DisnodePlugin;
