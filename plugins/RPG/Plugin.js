class RPGPlugin {
  constructor() {
    var self = this;
    self.DB = {};
  }
  Init(onComplete) {
    var self = this;
    setTimeout(function() {
      self.disnode.db.InitPromise({}).then(function(dbo) {
        self.DB = dbo;
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
    self.gUser(command).then(function(player) {
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
          icon_url: self.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    });
  }
  invUser(command) {
    var self = this;
    self.gUser(command).then(function(player) {
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
          icon_url: self.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    });
  }
  gUser(command) {
    var self = this;
    var players = [];
    return new Promise(function(resolve, reject) {
      self.DB.Find("players", {}).then(function(found) {
        players = found;
        for (var i = 0; i < players.length; i++) {
          if (command.msg.userID == players[i].id) {
            resolve(players[i]);
            return;
          }
        }
        var newPlayer = {
          name: command.msg.user,
          id: command.msg.userID,
          chealth: 50,
          thealth: 50,
          gold: 100,
          inv: [{
              "item": "Shortsword",
              "id": 1,
              "amount": 1
            },
            {
              "item": "Health Potion",
              "id": 2,
              "amount": 2
            }
          ]
        }
        for (var i = 0; i < players.length; i++) {
          if (newPlayer.name == players[i].name) {
            newPlayer.name += "1";
            break;
          }
        }
        self.DB.Insert("players", newPlayer);
        resolve(newPlayer);
        return;
      });
    });
  }
  pMention(command) {
    var id = command.params[0];
    id = uid.replace(/\D/g, '');
    return id;
  }
  avatarCommandUser(command) {
    var self = this;
    if (command.msg.obj.author.avatar != null) {
      if (command.msg.obj.author.avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.userID + "\/" + command.msg.obj.author.avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.userID + "\/" + command.msg.obj.author.avatar + ".png";
      }
    }
  }
}
module.exports = RPGPlugin;
