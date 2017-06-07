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
  guildCommand(command) {
    var self = this;
    var prefix = '``!rpg guild';
    self.utils.gUser(command).then(function(player) {
      if (command.params[0] == undefined) {
        var prefix = '``!rpg guild';
        self.embedoferror(command, "Guild Commands", prefix + " create`` - Creates a guild.\n" + prefix + "info`` - Gets your guilds info.\n" + prefix + " invite`` - Invites a user to your guild.\n" + prefix + " join`` - Join a guild.\n" + prefix + " members`` - Lists all members in a guild.\n" + prefix + " set`` - Guild settings.");
        return;
      }
      switch (command.params[0]) {
        case "info":
          if (player.guild != '') {
            self.utils.gGuild(player.guild).then(function(guild) {
              self.disnode.bot.SendEmbed(command.msg.channel, {
                color: 1752220,
                author: {},
                title: guild.name + "\'s info",
                description: (guild.desc != '') ? guild.desc : "No description set!",
                fields: [{
                  name: 'Owner',
                  inline: true,
                  value: guild.owner_name,
                }, {
                  name: 'Gold',
                  inline: true,
                  value: (guild.gold),
                }, {
                  name: 'Members',
                  inline: true,
                  value: guild.members.length,
                }, {
                  name: 'Status',
                  inline: true,
                  value: (guild.open) ? "Guild is open!" : "Guild is closed.",
                }],
                footer: {
                  text: command.msg.user,
                  icon_url: self.utils.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            });
          } else self.embedoferror(command, "Guild Info Error", "You are not in a guild. Either Join a guild or create a new guild!")
          break;
        case "join":
          if (player.guild == '') {
            self.utils.fGuild(command.params[1]).then(function(guild) {
              if (!guild.open) {
                var invfound = false;
                var invpos;
                for (var i = 0; i < guild.invites.length; i++) {
                  if (guild.invites[i].id == player.id) {
                    invfound = true;
                    invpos = i;
                    break;
                  }
                }
                if (invfound) {
                  var newMember = {
                    name: player.name,
                    id: player.id
                  }
                  player.guild = guild.id;
                  guild.members.push(newMember);
                  guild.invites.splice(invpos, 1);
                  self.embedoferror(command, "Guild Join", "Joined " + guild.name + "!");
                  self.utils.plugin.DB.Update("guilds", {
                    "id": guild.id
                  }, guild);
                  self.utils.plugin.DB.Update("players", {
                    "id": player.id
                  }, player);
                } else {
                  self.embedoferror(command, "Guild Join Error", "You are not invited to this guild and an invite is required to join!");
                }
              } else {
                var newMember = {
                  name: player.name,
                  id: player.id
                }
                player.guild = guild.id;
                guild.members.push(newMember);
                self.utils.plugin.DB.Update("guilds", {
                  "id": guild.id
                }, guild);
                self.utils.plugin.DB.Update("players", {
                  "id": player.id
                }, player);
              }
            }).catch(function(err) {
              self.embedoferror(command, "Guild Join Error", "" + err);
            });
          } else self.embedoferror(command, "Guild Join Error", "You are in a guild.");
          break;
        case "invite":
          if (player.guild != '') {
            self.utils.fplayer(command.params[1]).then(function(res) {
              if (res.found) {
                var fplayer = res.p;
                self.utils.gGuild(player.guild).then(function(guild) {
                  if (guild.owner_id == player.id) {
                    var newInvite = {
                      name: fplayer.name,
                      id: fplayer.id
                    }
                    guild.invites.push(newInvite);
                    self.utils.plugin.DB.Update("guilds", {
                      "id": guild.id
                    }, guild);
                    self.embedoferror(command, "Guild Invite", fplayer.name + " was invited to the guild.");
                  } else self.embedoferror(command, "Guild Invite Error", "As of right now only guild owner can invite.");
                });
              } else {
                self.embedoferror(command, "Guild Invite Error", res.msg);
              }
            });
          } else self.embedoferror(command, "Guild Invite Error", "You are not in a guild.");
          break;
        case "members":
          if (player.guild != '') {
            self.utils.gGuild(player.guild).then(function(guild) {
              var ms = "";
              for (var ids in guild.members) {
                if (guild.members.hasOwnProperty(ids)) {
                  ms += guild.members[ids].name + '\n';
                }
              }
              self.disnode.bot.SendEmbed(command.msg.channel, {
                color: 1752220,
                author: {},
                fields: [{
                  name: guild.name + '\'s Members',
                  inline: true,
                  value: '\n\n' + ms,
                }],
                footer: {
                  text: command.msg.user,
                  icon_url: self.utils.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            });
          }
          break;
        case "create":
          if (command.params[1]) {
            if (player.guild == '') {
              self.utils.newGuild(player, command.params[1]).then(function(guild) {
                self.embedoferror(command, "Guild Create", "Guild: " + guild.name + " Created!");
                player.guild = player.id;
                self.utils.plugin.DB.Update("players", {
                  "id": player.id
                }, player);
              }).catch(function(err) {
                self.embedoferror(command, "Guild Create Error", err);
              });
            } else {
              self.embedoferror(command, "Guild Create Error", "You can't create a new guild when you are already in one!");
            }
          } else {
            self.embedoferror(command, "Guild Create Error", "Please provide a name! like `!rpg guild create MyGuildName`");
          }
          break;
        case "set":
        if(command.params[1] == undefined) {
          var prefix = '``!rpg guild set';
          self.embedoferror(command, "Guild Set Commands", prefix + " desc`` - Sets the guild description.\n" + prefix + " open`` - Sets the guild joining status.");
          return;
        }
          switch (command.params[1]) {
            case "desc":
              if (player.guild != '') {
                self.utils.gGuild(player.guild).then(function(guild) {
                  if (guild.owner_id == player.id) {
                    var params = command.params.splice(2).join(" ");
                    guild.desc = params;
                    self.utils.plugin.DB.Update("guilds", {
                      "id": guild.id
                    }, guild);
                    self.embedoferror(command, "Guild Desc Set", (params != '') ? "New Desc: ``" + params + "``" : "Guild description is cleared.");
                  } else self.embedoferror(command, "Guild Desc Error", "Only guild owner can set desc.");
                });
              } else self.embedoferror(command, "Guild Desc Error", "You are not in a guild.");
              break;
            case "open":
              if (player.guild != '') {
                self.utils.gGuild(player.guild).then(function(guild) {
                  if (guild.owner_id == player.id) {
                    if (command.params[2] == 'true') {
                      guild.open = true;
                      self.utils.plugin.DB.Update("guilds", {
                        "id": guild.id
                      }, guild);
                      self.embedoferror(command, "Guild Open Set", 'Guild is now set to open.');
                    } else if (command.params[2] == 'false') {
                      guild.open = false;
                      self.utils.plugin.DB.Update("guilds", {
                        "id": guild.id
                      }, guild);
                      self.embedoferror(command, "Guild Open Set", 'Guild is now set to closed.');
                    } else self.embedoferror(command, "Guild Open Error", "Input has to be ``true``or ``false``.");
                  } else self.embedoferror(command, "Guild Open Error", "You are not the guild owner.");
                });
              } else self.embedoferror(command, "Guild Open Error", "You are not in a guild.");
              break;
          }
      }
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
              }, {
                name: 'Level',
                inline: true,
                value: res.p.lv + ' (' + res.p.xp + '/' + res.p.nextlv + ')',
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
          }, {
            name: 'Level',
            inline: true,
            value: player.lv + ' (' + player.xp + '/' + player.nextlv + ')',
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
    var headingStringA = "Name";
    var headingStringB = "|Amount"
    self.utils.gUser(command).then(function(player) {
      var itemsAmountArr = [];
      var itemsNameArr = [];
      var final = "";
      for (var i = 0; i < player.inv.length; i++) {
        itemsAmountArr.push("|x" + player.inv[i].amount);
        itemsNameArr.push(player.inv[i].defaultName);
      }
      var AmountL = self.utils.getLongestString(itemsAmountArr);
      var NameL = self.utils.getLongestString(itemsNameArr);
      headingStringA = self.utils.addSpacesToString(headingStringA, NameL);
      headingStringB = self.utils.addSpacesToString(headingStringB, AmountL);
      final += headingStringA + headingStringB + "\n\n";
      for (var i = 0; i < itemsNameArr.length; i++) {
        itemsNameArr[i] = self.utils.addSpacesToString(itemsNameArr[i], NameL);
      }
      for (var i = 0; i < itemsAmountArr.length; i++) {
        itemsAmountArr[i] = self.utils.addSpacesToString(itemsAmountArr[i], AmountL);
      }
      for (var i = 0; i < itemsNameArr.length; i++) {
        final += itemsNameArr[i] + itemsAmountArr[i] + "\n";
      }
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 1752220,
        author: {},
        fields: [{
          name: player.name + "\'s Inventory",
          inline: true,
          value: "```\n" + final + "```",
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
          }, {
            name: "Health",
            inline: true,
            value: result.defaultMinHealth + " - " + result.defaultMaxHealth,
          }, {
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
  embedoferror(command, title, body) {
    var self = this;
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 1752220,
      author: {},
      fields: [{
        name: title,
        inline: true,
        value: body,
      }],
      footer: {
        text: command.msg.user,
        icon_url: self.utils.avatarCommandUser(command),
      },
      timestamp: new Date(),
    });
  }
}
module.exports = RPGPlugin;
