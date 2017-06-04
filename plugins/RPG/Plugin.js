const RPGUtils = require('./RPGUtils.js');
const sleep = require('system-sleep');
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
      if (command.params[0]) {
        self.utils.fplayer(command.params[0]).then(function(res) {
          if (res.found) {
            console.dir(res.p);
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
          } else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg);
          }
        });
      } else {
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
        author: {},
        title: player.name + "\'s Inventory",
        fields: [{
          name: 'Item Name',
          inline: true,
          value: uit,
        }, {
          name: 'Amount',
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
  itemInfo(command) {
    var self = this;
    var prefix = self.disnode.botConfig.prefix + self.config.prefix;
    if (command.params[0] == undefined) {
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 1752220,
        author: {},
        fields: [{
          name: 'Info',
          inline: true,
          value: "``" + prefix + " info [armor/weapon/healing/mob] [name]`` - i dont know what to put here",
        }],
        footer: {
          text: command.msg.user,
          icon_url: self.utils.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    } else if (command.params[0] == "weapon") {
      var cp = command.msg.message.split("weapon ")[1].replace(/(^|\s)[a-z]/g, function(f) {
        return f.toUpperCase();
      });
      self.utils.weaponList(cp).then(function(res) {
        var result = res.p.items.find(items => items.defaultName === cp);
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Weapon Info",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: result.defaultName,
          }, {
            name: "DMG",
            inline: true,
            value: result.defaultMinDamage + " - " + result.defaultMaxDamage,
          }, {
            name: 'Level',
            inline: true,
            value: result.lvl,
          }, {
            name: 'Cost',
            inline: true,
            value: (result.buy == null) ? "Can\'t buy" : result.buy + " Gold",
          }, {
            name: 'Worth',
            inline: true,
            value: result.sell + " Gold",
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      })
    } else if (command.params[0] == "healing") {
      var cp = command.msg.message.split("healing ")[1].replace(/(^|\s)[a-z]/g, function(f) {
        return f.toUpperCase();
      });
      self.utils.healList(cp).then(function(res) {
        var result = res.p.items.find(items => items.defaultName === cp);
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Healing Item Info",
          description: "For a list of healing items type ``" + prefix + " list health``",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: result.defaultName,
          }, {
            name: "Heal Amount",
            inline: true,
            value: result.defaultHeal,
          }, {
            name: 'Level',
            inline: true,
            value: result.lvl,
          }, {
            name: 'Cost',
            inline: true,
            value: (result.buy == null) ? "Can\'t buy" : result.buy + " Gold",
          }, {
            name: 'Worth',
            inline: true,
            value: result.sell + " Gold",
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      });
    } else if (command.params[0] == "armor") {
      var cp = command.msg.message.split("armor ")[1].replace(/(^|\s)[a-z]/g, function(f) {
        return f.toUpperCase();
      });
      self.utils.armorList(cp).then(function(res) {
        var result = res.p.items.find(items => items.defaultName === cp);
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Armor Info",
          description: "For a list of armor type ``" + prefix + " list armor``",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: result.defaultName,
          }, {
            name: "Defense",
            inline: true,
            value: result.defaultMinDefense + " - " + result.defaultMaxDefense,
          }, {
            name: 'Level',
            inline: true,
            value: result.lvl,
          }, {
            name: 'Cost',
            inline: true,
            value: (result.buy == null) ? "Can\'t buy" : result.buy + " Gold",
          }, {
            name: 'Worth',
            inline: true,
            value: result.sell + " Gold",
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      });
    } else if (command.params[0] == "mob") {
      var cp = command.msg.message.split("mob ")[1].replace(/(^|\s)[a-z]/g, function(f) {
        return f.toUpperCase();
      });
      self.utils.mobList(cp).then(function(res) {
        var result = res.p.items.find(items => items.defaultName === cp);
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Mob Info",
          description: "For a list of mobs type ``" + prefix + " list mobs``",
          fields: [{
            name: 'Name',
            inline: true,
            value: result.defaultName,
          }, {
            name: 'Encounter Level',
            inline: true,
            value: result.encounterlvlmin + " - " + result.encounterlvlmax,
          }, {
            name: 'XP',
            inline: true,
            value: result.minXP + " - " + result.maxXP,
          },{
            name: "Health",
            inline: true,
            value: result.defaultMinHealth + " - " + result.defaultMaxHealth,
          },{
            name: "Defense",
            inline: true,
            value: result.defaultMinDefense + " - " + result.defaultMaxDefense,
          }, {
            name: "Damage",
            inline: true,
            value: result.defaultMinDamage + " - " + result.defaultMaxDamage,
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
  storelist(command) {
    var self = this;
    var prefix = self.disnode.botConfig.prefix + self.config.prefix;
    if (command.params[0] == undefined) {
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 1752220,
        author: {},
        fields: [{
          name: 'Lists',
          inline: true,
          value: "``" + prefix + " list weapons`` - Lists all the weapons\n``" + prefix + " list health`` - Lists all the healing items\n``" + prefix + " list armor`` - Lists all the armor\n``" + prefix + " list mobs`` - Lists all the mobs",
        }],
        footer: {
          text: command.msg.user,
          icon_url: self.utils.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    } else if (command.params[0] == "weapons") {
      self.utils.weaponList(command).then(function(res) {
        var Name = "";
        for (var i = 0; i < res.p.items.length; i++) {
          Name += res.p.items[i].defaultName + "\n";
        }
        var cost = "";
        for (var i = 0; i < res.p.items.length; i++) {
          cost += res.p.items[i].buy + " Gold\n";
        }
        cost = cost.replace("null Gold", "Unavailable");
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Weapon List",
          description: "For info of an item type ``" + prefix + " info weapon [item name]``",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: Name,
          }, {
            name: 'Amount',
            inline: true,
            value: cost,
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      });
    } else if (command.params[0] == "health") {
      self.utils.healList(command).then(function(res) {
        var Name = "";
        for (var i = 0; i < res.p.items.length; i++) {
          Name += res.p.items[i].defaultName + "\n";
        }
        var cost = "";
        for (var i = 0; i < res.p.items.length; i++) {
          cost += res.p.items[i].buy + " Gold\n";
        }
        cost = cost.replace("null Gold", "Unavailable");
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Healing Items List",
          description: "For info of a healing item type ``" + prefix + " info healing [item name]``",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: Name,
          }, {
            name: 'Amount',
            inline: true,
            value: cost,
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      });
    } else if (command.params[0] == "armor") {
      self.utils.armorList(command).then(function(res) {
        var Name = "";
        for (var i = 0; i < res.p.items.length; i++) {
          Name += res.p.items[i].defaultName + "\n";
        }
        var cost = "";
        for (var i = 0; i < res.p.items.length; i++) {
          cost += res.p.items[i].buy + " Gold\n";
        }
        cost = cost.replace("null Gold", "Unavailable");
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Armor List",
          description: "For info of an item type ``" + prefix + " info armor [item name]``",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: Name,
          }, {
            name: 'Amount',
            inline: true,
            value: cost,
          }],
          footer: {
            text: command.msg.user,
            icon_url: self.utils.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      });
    } else if (command.params[0] == "mobs") {
      self.utils.mobList(command).then(function(res) {
        var Name = "";
        for (var i = 0; i < res.p.items.length; i++) {
          Name += res.p.items[i].defaultName + "\n";
        }
        var lvl = "";
        for (var i = 0; i < res.p.items.length; i++) {
          lvl += res.p.items[i].encounterlvlmin + " - " + res.p.items[i].encounterlvlmax + "\n";
        }
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1752220,
          author: {},
          title: "Mob List",
          description: "For info of a mob type ``" + prefix + " info mob [mob name]``",
          fields: [{
            name: 'Item Name',
            inline: true,
            value: Name,
          }, {
            name: 'Encounter Level',
            inline: true,
            value: lvl,
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
}
module.exports = RPGPlugin;
