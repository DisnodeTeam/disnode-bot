const RPGUtils = require('./RPGUtils.js');
class RPGPlugin {
  constructor() {
    var self = this;
    self.DB = {};
    self.utils = {};
  }
  Init(onComplete) {
    var self = this;
    setTimeout(function() {
      self.disnode.db.InitPromise({}).then(function(dbo) {
        self.DB = dbo;
        self.utils = new RPGUtils(self);
        onComplete();
      });
    }, 100);
  }
  default (command) {
    var self = this;
    var msg = "";
    for (var i = 0; i < self.commands.length; i++) {
      msg += self.disnode.botConfig.prefix + self.config.prefix + " " + self.commands[i].cmd + " - " + self.commands[i].desc + "\n";
    }
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 3447003,
      author: {},
      fields: [{
        name: 'RPG',
        inline: true,
        value: "Hello, " + command.msg.user + "!",
      }, {
        name: 'Commands:',
        inline: false,
        value: msg,
      }, {
        name: 'Discord Server',
        inline: false,
        value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
      }],
      footer: {}
    });
  }
  statsUser(command) {
    var self = this;
    var bprefix = self.disnode.botConfig.prefix;
    var pprefix = self.config.prefix;
    self.utils.gUser(command).then(function(player) {
      if(command.params[0]){
        self.utils.fplayer(command.params[0]).then(function(res) {
          if(res.found){
            self.disnode.bot.SendEmbed(command.msg.channel, {
              color: 1752220,
              author: {},
              title: res.p.name + "\'s stats",
              description: "To see your inventory type ``" + bprefix + "" + pprefix + " inv``.",
              fields: [{
                name: 'Health',
                inline: true,
                value: (res.p.chealth) + "/" + (res.p.thealth) + " HP",
              }, {
                name: 'Gold',
                inline: true,
                value: (res.p.gold),
              }],
              footer: {
                text: command.msg.user,
                icon_url: self.utils.avatarCommandUser(command),
              },
              timestamp: new Date(),
            });
          }else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg);
          }
        });
      }else {
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: player.name + "\'s stats",
          description: "To see your inventory type ``" + bprefix + "" + pprefix + " inv``.",
          fields: [{
            name: 'Health',
            inline: true,
            value: (player.chealth) + "/" + (player.thealth) + " HP",
          }, {
            name: 'Gold',
            inline: true,
            value: (player.gold),
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      }
    });
  }
  invUser(command) {
    var self = this;
    self.utils.gUser(command).then(function(player) {
      var uamo = "";
      for (var i = 0; i < player.inv.length; i++) {
        uamo += "x" + player.inv[i].amount + "\n";
      }
      var uit = "";
      for (var i = 0; i < player.inv.length; i++) {
        uit += "" + player.inv[i].item + "\n";
      }
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 1752220,
        author: {
        },
        title: player.name + "\'s Inventory",
        fields: [{
          name:  'Item Name',
          inline: true,
          value: uit,
        },{
          name:  'Amount',
          inline: true,
          value: uamo,
        }],
        footer: {
          text: command.msg.user,
          icon_url: self.utils.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    });
  }
}
module.exports = RPGPlugin;
