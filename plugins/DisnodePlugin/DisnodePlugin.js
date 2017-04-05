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
                name: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
                inline: true,
                value: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
            }, {
                name: 'Servers',
                inline: true,
                value: self.disnode.stats.serverCount,
            }, {
                name: 'Members',
                inline: true,
                value: self.disnode.stats.memberCount,
            }, {
                name: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
                inline: true,
                value: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
            }, {
                name: 'Channels',
                inline: true,
                value: self.disnode.stats.channelCount,
            }, {
                name: 'Open DM\'s',
                inline: true,
                value: self.disnode.stats.directMessageCount,
            }, {
                name: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
                inline: true,
                value: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
            }, {
                name: 'Shard #',
                inline: true,
                value: self.disnode.bot.shardID + ' of ' + self.disnode.botConfig.shardCount,
            }, {
                name: 'Shard Mode',
                inline: true,
                value: '' + self.disnode.botConfig.shardMode,
            }, {
                name: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
                inline: true,
                value: '𝅳 𝅳𝅳 𝅳𝅳𝅳 𝅳𝅳𝅳',
            }],
            footer: {}
        });
    }
}
module.exports = DisnodePlugin;
