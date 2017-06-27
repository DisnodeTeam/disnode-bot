const sleep = require('system-sleep');
const dateFormat = require('dateformat');
const Logging = require("disnode-logger");

class ModerationPlugin {
  yes() {
    var self = this;
    self.DB = {};
    setTimeout(function() {
      Logging.Info("Moderation", "Constructor", "Started")
      self.status();
      self.disnode.bot.on("guild_create", function(guild) {
        console.log(guild.id + ' || ' + self.server)
        if (guild.id == self.server) {
          var bots = 0;
          var users = 0;
          for (var i in guild.members) {
            if (guild.members.hasOwnProperty(i)) {
              if (guild.members[i].user.bot === true) {
                bots++;
              } else users++;
            }
          }
          var date = self.disnode.util.GetSnowflakeDate(guild.id);
          self.disnode.bot.SendEmbed('325700696437424128', {
            color: 0x04ff00,
            author: {},
            title: 'Guild Joined',
            fields: [{
              name: "Name",
              inline: false,
              value: guild.name,
            }, {
              name: 'Users',
              inline: false,
              value: 'Total ``' + guild.member_count + '``\nUsers ``' + users + '``\nBots ``' + bots + '``',
            }, {
              name: 'Created Date',
              inline: false,
              value: dateFormat(date, "mmmm dS, yyyy, h:MM:ss TT"),
            }, {
              name: 'Owner',
              inline: false,
              value: guild.owner_id
            }],
            footer: {}
          });
        }
      });
      self.disnode.bot.on("guild_delete", function(guild) {
        if (guild.id == self.server) {
          self.disnode.bot.SendEmbed('325700696437424128', {
            color: 0xff0000,
            author: {},
            title: 'Guild Leave',
            fields: [{
              name: "Name",
              inline: false,
              value: guild.name,
            }],
            footer: {}
          });
        }
      });
      self.disnode.bot.on("guild_memeber_add", function(mem) {
        if (mem.guild_id == self.server) {
          self.chan(mem.guild_id).then(function(data) {
            self.disnode.bot.SendEmbed(data, {
              color: 0x04ff00,
              author: {},
              thumbnail: {
                url: self.logava(mem.user.id, mem.user.avatar),
              },
              title: 'Member Joined',
              fields: [{
                name: "Name",
                inline: false,
                value: mem.user.username + '\n' + mem.user.id,
              }],
              footer: {},
              timestamp: new Date(),
            });
          });
        }
      });
      self.disnode.bot.on("guild_memeber_removed", function(mem) {
        if (mem.guild_id == self.server) {
          self.chan(mem.guild_id).then(function(data) {
            self.disnode.bot.SendEmbed(data, {
              color: 0xff0000,
              author: {},
              thumbnail: {
                url: self.logava(mem.user.id, mem.user.avatar),
              },
              title: 'Member Leave',
              fields: [{
                name: "Name",
                inline: false,
                value: mem.user.username + '\n' + mem.user.id,
              }],
              footer: {},
              timestamp: new Date(),
            });
          });
        }
      });
    }, self.theMaths(100, 20000));
  }
  status() {
    var self = this;
    setInterval(function() {
      self.disnode.bot.SetStatus(self.disnode.botConfig.prefix + 'help');
    }, 300000);
  }
  chan(gid) {
    var self = this;
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        self.DB.Find("servers", {
          "id": gid
        }).then(function(server) {
          var srv = server[0];
          if (srv.log_channel != '') {
            resolve(srv.log_channel)
          }
        });
      }, self.theMaths(100, 10000));
    });
  }
  theMaths(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 100)) + min;
  }
  Init(onComplete) {
    var self = this;
  //  console.log(self)
    setTimeout(function() {
      self.disnode.db.InitPromise({}).then(function(dbo) {
        Logging.Info("Moderation", "DB", "Started  ||  Plugin # " + self.disnode.util.ReturnInstances() + " || Servers # " + (Object.keys(self.disnode.bot.guilds).length - 1))
        self.DB = dbo;
      });
      self.disnode.util.CountInstance();
      self.yes();
      if (self.disnode.util.ReturnInstances() == (Object.keys(self.disnode.bot.guilds).length - 1)) {
        self.disnode.bot.SendMessage("306797343531859971", "<@160168328520794112>");
        self.disnode.bot.SendEmbed("306797343531859971", {
          color: 3447003,
          author: {},
          fields: [{
            name: 'Plugins Launched',
            inline: false,
            value: self.disnode.util.ReturnInstances() + ' Plugins\n' + (Object.keys(self.disnode.bot.guilds).length - 1) + ' Servers',
          }],
          footer: {}
        });
      }
      onComplete();
    }, self.theMaths(1000, 120000));
  }
  default (command) {
    var self = this;
    var msg = "";
    for (var i = 0; i < self.commands.length; i++) {
      msg += '**' + self.disnode.botConfig.prefix + self.config.prefix + " " + self.commands[i].cmd + "** - " + self.commands[i].desc + "\n";
    }
    self.disnode.bot.SendEmbed(command.msg.channel_id, {
      color: 3447003,
      author: {},
      fields: [{
        name: 'Guild Moderation Commands',
        inline: false,
        value: msg,
      }],
      footer: {}
    });
  }
  commandKick(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: No user has been inputed.");
        } else {
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.GetUser(uid).then(function(user) {
            //  var mid = self.disnode.bot.users[uid].username;
            self.disnode.bot.RemoveMember(command.msg.guildID, uid);
            self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been kicked.");
            self.caseLog('kick', uid, user.username, command);
          });
        }
      } else self.AccessDenied(command);
    });
  }
  commandBan(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: No user has been inputed.");
        } else if (command.params[1] == undefined) {
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.GetUser(uid).then(function(user) {
            //var mid = self.disnode.bot.users[uid].username;
            self.disnode.bot.BanUser(command.msg.guildID, uid);
            self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been banned.");
            self.caseLog('ban', uid, user.username, command);
          });
        } else {
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.GetUser(uid).then(function(user) {
            //var mid = self.disnode.bot.users[uid].username;
            self.disnode.bot.BanUser(command.msg.guildID, uid, command.params[1]);
            self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been banned, and messages from " + command.params[1] + " day(s) deleted.");
            self.caseLog('ban', uid, user.username, command);
          });
        }
      } else self.AccessDenied(command);
    });
  }
  commandSoftban(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: No user has been inputed.");
        } else {
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.GetUser(uid).then(function(user) {
            //  var mid = self.disnode.bot.users[uid].username;
            self.disnode.bot.BanUser(command.msg.guildID, uid, "1");
            setTimeout(function() {
              self.disnode.bot.UnBanUser(command.msg.guildID, uid);
            }, 500);
            self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been softbanned, and messages from the past day deleted.");
            self.caseLog('softban', uid, user.username, command);
          });
        }
      } else self.AccessDenied(command);
    });
  }
  commandUnban(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: No user has been inputed.");
        } else {
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.UnBanUser(command.msg.guildID, uid);
          self.disnode.bot.SendMessage(command.msg.channel_id, "User ID **" + uid + "** has been unbanned.");
          self.caseLog('unban', uid, mid, command);
        }
      } else self.AccessDenied(command);
    });
  }
  commandMute(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: No user has been inputed.");
        } else {
          var server = self.disnode.bot.guilds[command.msg.guildID];
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.GetUser(uid).then(function(user) {
            //    var mid = self.disnode.bot.users[uid].username;
            var role;
            var found = false;
            for (var key in server.roles) {
              if (self.disnode.bot.botInfo.username + "-Muted" == server.roles[key].name) {
                role = server.roles[key];
                found = true;
                break;
              }
            }
            if (found) {
              var id = role.id;
              self.disnode.bot.AddRole(command.msg.guildID, uid, id);
              self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been muted.");
              self.caseLog('mute', uid, user.username, command);
            } else {
              self.disnode.bot.CreateRole(command.msg.guildID, {
                hoist: true,
                name: self.disnode.bot.botInfo.username + '-Muted',
                mentionable: false,
                color: 0x525252,
                managed: false,
                permissions: 1115136
              }).then(function(resp) {
                var channels = Object.keys(self.disnode.bot.guilds[command.msg.guildID].channels);
                for (var i = 0; i < channels.length; i++) {
                  var channel = self.disnode.bot.guilds[command.msg.guildID].channels[channels[i]];
                  if (channel.type != "text") continue;
                  self.disnode.bot.EditChannelPermissions(channel.id, resp.id, 262144, 456768, "role");
                }
                self.disnode.bot.AddRole(command.msg.guildID, uid, resp.id);
                self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been muted.");
                self.caseLog('mute', uid, user.username, command);
              });
            }
          });
        }
      } else self.AccessDenied(command);
    });
  }
  commandUnmute(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: No user has been inputed.");
        } else {
          var server = self.disnode.bot.guilds[command.msg.guildID];
          var uid = command.params[0];
          uid = uid.replace(/\D/g, '');
          self.disnode.bot.GetUser(uid).then(function(user) {
            //      var mid = self.disnode.bot.users[uid].username;
            var role;
            var found = false;
            for (var key in server.roles) {
              if (self.disnode.bot.botInfo.username + "-Muted" == server.roles[key].name) {
                role = server.roles[key];
                found = true;
                break;
              }
            }
            if (found) {
              var id = role.id;
              self.disnode.bot.RemoveRole(command.msg.guildID, uid, id);
              self.disnode.bot.SendMessage(command.msg.channel_id, "User **" + user.username + "** - (" + uid + ") has been unmuted.");
              self.caseLog('unmute', uid, user.username, command);
            } else {
              self.disnode.bot.SendMessage(command.msg.channel_id, "No user has been muted yet on this server.")
            }
          });
        }
      } else self.AccessDenied(command);
    });
  }
  commandDelete(command) {
    var self = this;
    self.guildRole(command).then(function(role) {
      if (role) {
        if (command.params[0] == undefined) {
          self.disnode.bot.SendMessage(command.msg.channel_id, ":warning: Pick an amount of messages to delete. (1-100)");
        } else {
          self.disnode.bot.GetMessages(command.msg.channel_id, {
              before: command.msg.id,
              limit: parseInt(command.params[0])
            })
            .then(function(messageArry) {
              var ids = [];
              for (var i = 0; i < messageArry.length; i++) {
                ids.push(messageArry[i].id);
              }
              console.log(ids)
              self.disnode.bot.DeleteMessages(command.msg.channel_id, ids);
              self.disnode.bot.DeleteMessage(command.msg.channel_id, command.msg.id);
            });
        }
      } else self.AccessDenied(command);
    });
  }
  commandRole(command) {
    var self = this;
    if (command.msg.author.id == self.disnode.bot.guilds[command.msg.guildID].owner_id) {
      var value = command.params[0];
      value = value.replace(/\D/g, '');
      if (!value) {
        this.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please enter a mentionable role!");
        return;
      }
      var guild = [];
      self.DB.Find("servers", {
        "id": command.msg.guildID
      }).then(function(found) {
        guild = found;
        for (var i = 0; i < guild.length; i++) {
          if (command.msg.guildID == guild[i].id) {
            var gg = guild[i];
            gg.role = value;
            self.DB.Update("servers", {
              "id": gg.id
            }, gg);
            self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Mod Role", "Set to <@&" + value + ">");
            return;
          }
        }
        var newServer = {
          id: command.msg.guildID,
          log_channel: '',
          role: value,
          cases: []
        }
        self.DB.Insert("servers", newServer);
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Mod Role", "Set to <@&" + value + ">");
        return;
      });
    } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Only guild owner can do this command.");
  }
  commandLog(command) {
    var self = this;
    if (command.msg.author.id == self.disnode.bot.guilds[command.msg.guildID].owner_id) {
      var value = command.params[0];
      value = value.replace(/\D/g, '');
      if (!value) {
        this.disnode.bot.SendMessage(command.msg.channel_id, "Error :warning: ", "Please enter a channel!");
        return;
      }
      var guild = [];
      self.DB.Find("servers", {
        "id": command.msg.guildID
      }).then(function(found) {
        guild = found;
        for (var i = 0; i < guild.length; i++) {
          if (command.msg.guildID == guild[i].id) {
            var gg = guild[i];
            gg.log_channel = value;
            self.DB.Update("servers", {
              "id": gg.id
            }, gg);
            self.disnode.bot.SendMessage(command.msg.channel_id, "Mod Channel Set to <#" + value + ">");
            return;
          }
        }
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Please set a role first with ``;mod role [role]``");
      });
    } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error :warning: ", "Only guild owner can do this command.");
  }

  AccessDenied(command) {
    var self = this;
    self.DB.Find("servers", {
      "id": command.msg.guildID
    }).then(function(found) {
      var gg = found[0];
      self.disnode.bot.SendEmbed(command.msg.channel_id, {
        color: 15158332,
        author: {},
        fields: [{
          name: "Stop",
          inline: false,
          value: (!gg.role) ? "Server owner needs to set the role with ``" + self.disnode.botConfig.prefix + "mod role [rolename]``" : "You don\'t have the <@&" + gg.role + "> role. ",
        }],
        footer: {}
      });
    });
  }
  guildRole(command) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.DB.Find("servers", {
        "id": command.msg.guildID
      }).then(function(found) {
        if (found == 'undefined') resolve(false);
        var gg = found[0];
        var roles = '';
        var guild = self.disnode.bot.guilds[gg.id];
        for (var i = 0; i < guild.members.length; i++) {
          if (guild.members[i].user.id == command.msg.author.id) {
            roles = guild.members[i].roles;
          }
        }
        if (roles.indexOf(gg.role) > -1 == true) {
          resolve(true);
        } else resolve(false);
      });
    });
  }
  reason(command) {
    var self = this;
    new Promise(function() {
      self.DB.Find("servers", {
        "id": command.msg.guildID
      }).then(function(server) {
        if (server.log_channel != '') {
          var srv = server[0];
          var pos;
          var found = false;
          for (var i = 0; i < srv.cases.length; i++) {
            if (srv.cases[i].id == command.params[0]) {
              found = true;
              pos = i;
            }
          }
          if (found) {
            if (command.msg.author.id == srv.cases[pos].modid) {
              self.disnode.bot.GetMessage(srv.log_channel, srv.cases[pos].messageid).then(function(msg) {
                var mobj = msg.embeds[0];
                self.disnode.bot.EditEmbed(srv.log_channel, srv.cases[pos].messageid, {
                  color: mobj.color,
                  thumbnail: {
                    url: mobj.thumbnail.url,
                    width: mobj.thumbnail.width,
                    height: mobj.thumbnail.height,
                    proxy_url: mobj.thumbnail.proxy_url,
                  },
                  author: {
                    name: mobj.author.name,
                  },
                  title: mobj.title,
                  description: mobj.description,
                  fields: [{
                    name: mobj.fields[0].name,
                    inline: false,
                    value: command.params.splice(1).join(" "),
                  }],
                  footer: {
                    text: mobj.footer.text,
                    icon_url: mobj.footer.icon_url,
                    proxy_icon_url: mobj.footer.proxy_icon_url,
                  },
                  timestamp: mobj.timestamp,
                });
                srv.cases[pos].reason = command.params.splice(1).join(" ");
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, srv);
              });
            } else self.disnode.bot.SendMessage(command.msg.channel_id, "You are not this cases moderator.");
          } else self.disnode.bot.SendMessage(command.msg.channel_id, "The case " + command.params[0] + " does not exist.");
        }
      });
    });
  }
  caseLog(type, uid, mid, command) {
    var self = this;
    new Promise(function() {
      self.DB.Find("servers", {
        "id": command.msg.guildID
      }).then(function(server) {
        if (server.log_channel != '') {
          switch (type) {
            case 'kick':
              self.disnode.bot.SendEmbed(server[0].log_channel, {
                color: 0xf0f000,
                thumbnail: {
                  url: self.avatarUser(uid),
                },
                author: {
                  name: 'Case ' + server[0].cases.length,
                },
                title: mid + ' Kicked',
                description: 'ID: ' + uid,
                fields: [{
                  name: "Reason",
                  inline: false,
                  value: "``" + self.disnode.botConfig.prefix + 'mod reason [case #] [reason]`` to set the reason.',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              }).then(function(data) {
                var obj = {
                  id: server[0].cases.length,
                  messageid: data.id,
                  userid: uid,
                  username: mid,
                  reason: '',
                  modid: command.msg.author.id,
                  modname: command.msg.author.username
                }
                server[0].cases.push(obj);
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, server[0]);
              });
              break;
            case 'ban':
              self.disnode.bot.SendEmbed(server[0].log_channel, {
                color: 0x1800f0,
                thumbnail: {
                  url: self.avatarUser(uid),
                },
                author: {
                  name: 'Case ' + server[0].cases.length,
                },
                title: mid + ' Banned',
                description: 'ID: ' + uid,
                fields: [{
                  name: "Reason",
                  inline: false,
                  value: "``" + self.disnode.botConfig.prefix + 'mod reason [case #] [reason]`` to set the reason.',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              }).then(function(data) {
                var obj = {
                  id: server[0].cases.length,
                  messageid: data.id,
                  userid: uid,
                  username: mid,
                  reason: '',
                  modid: command.msg.author.id,
                  modname: command.msg.author.username
                }
                server[0].cases.push(obj);
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, server[0]);
              });
              break;
            case 'unban':
              self.disnode.bot.SendEmbed(server[0].log_channel, {
                color: 0xc000f0,
                thumbnail: {
                  url: self.avatarUser(uid),
                },
                author: {
                  name: 'Case ' + server[0].cases.length,
                },
                title: mid + ' Unbanned',
                description: 'ID: ' + uid,
                fields: [{
                  name: "Reason",
                  inline: false,
                  value: "``" + self.disnode.botConfig.prefix + 'mod reason [case #] [reason]`` to set the reason.',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              }).then(function(data) {
                var obj = {
                  id: server[0].cases.length,
                  messageid: data.id,
                  userid: uid,
                  username: mid,
                  reason: '',
                  modid: command.msg.author.id,
                  modname: command.msg.author.username
                }
                server[0].cases.push(obj);
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, server[0]);
              });
              break;
            case 'softban':
              self.disnode.bot.SendEmbed(server[0].log_channel, {
                color: 0xcfffff,
                thumbnail: {
                  url: self.avatarUser(uid),
                },
                author: {
                  name: 'Case ' + server[0].cases.length,
                },
                title: mid + ' Softbanned',
                description: 'ID: ' + uid,
                fields: [{
                  name: "Reason",
                  inline: false,
                  value: "``" + self.disnode.botConfig.prefix + 'mod reason [case #] [reason]`` to set the reason.',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              }).then(function(data) {
                var obj = {
                  id: server[0].cases.length,
                  messageid: data.id,
                  userid: uid,
                  username: mid,
                  reason: '',
                  modid: command.msg.author.id,
                  modname: command.msg.author.username
                }
                server[0].cases.push(obj);
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, server[0]);
              });
              break;
            case 'mute':
              self.disnode.bot.SendEmbed(server[0].log_channel, {
                color: 0xcfffff,
                thumbnail: {
                  url: self.avatarUser(uid),
                },
                author: {
                  name: 'Case ' + server[0].cases.length,
                },
                title: mid + ' Muted',
                description: 'ID: ' + uid,
                fields: [{
                  name: "Reason",
                  inline: false,
                  value: "``" + self.disnode.botConfig.prefix + 'mod reason [case #] [reason]`` to set the reason.',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              }).then(function(data) {
                var obj = {
                  id: server[0].cases.length,
                  messageid: data.id,
                  userid: uid,
                  username: mid,
                  reason: '',
                  modid: command.msg.author.id,
                  modname: command.msg.author.username
                }
                server[0].cases.push(obj);
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, server[0]);
              });
              break;
            case 'unmute':
              self.disnode.bot.SendEmbed(server[0].log_channel, {
                color: 0xcfffff,
                thumbnail: {
                  url: self.avatarUser(uid),
                },
                author: {
                  name: 'Case ' + server[0].cases.length,
                },
                title: mid + ' Unmuted',
                description: 'ID: ' + uid,
                fields: [{
                  name: "Reason",
                  inline: false,
                  value: "``" + self.disnode.botConfig.prefix + 'mod reason [case #] [reason]`` to set the reason.',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              }).then(function(data) {
                var obj = {
                  id: server[0].cases.length,
                  messageid: data.id,
                  userid: uid,
                  username: mid,
                  reason: '',
                  modid: command.msg.author.id,
                  modname: command.msg.author.username
                }
                server[0].cases.push(obj);
                self.DB.Update("servers", {
                  "id": command.msg.guildID
                }, server[0]);
              });
              break;
          }
        }
      });
    });
  }
  avatarUser(id) {
    var self = this;
    var data = self.disnode.bot.users[id];
    if (data.avatar != null) {
      if (data.avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + id + "\/" + data.avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + id + "\/" + data.avatar + ".png";
      }
    }
  }
  avatarCommandUser(command) {
    var self = this;
    if (command.msg.author.avatar != null) {
      if (command.msg.author.avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.author.id + "\/" + command.msg.author.avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.author.id + "\/" + command.msg.author.avatar + ".png";
      }
    }
  }
  logava(id, avatar) {
    var self = this;
    if (avatar != null) {
      if (avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + id + "\/" + avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + id + "\/" + avatar + ".png";
      }
    }
  }

}
module.exports = ModerationPlugin;
// Made by Hazed SPaCE✘#2574
