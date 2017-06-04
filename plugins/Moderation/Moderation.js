const sleep = require('system-sleep');
const Discord = require('discord.io');

class ModerationPlugin {
  constructor() {}
  default (command) {
    var self = this;
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 3447003,
      author: {},
      fields: [{
        name: 'Guild Moderation Commands',
        inline: false,
        value: self.helplist(command),
      }, {
        name: 'Notice',
        inline: false,
        value: "As of right now, only the **Guild Owner** can use these commands",
      }],
      footer: {}
    });
  }
  helplist(command) {
    var self = this;
    var msg = "";
    for (var i = 0; i < self.commands.length; i++) {
      msg += "**" + self.disnode.botConfig.prefix + self.config.prefix + " " + self.commands[i].cmd + "** - " + self.commands[i].desc + "\n";
    }
    return msg;
  }
  commandKick(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: No user has been inputed.");
      } else {
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        self.disnode.bot.Kick(command.msg.server, uid);
        self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been kicked.");
      }
    } else self.AccessDenied(command);
  }
  commandBan(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: No user has been inputed.");
      } else if (command.params[1] == undefined) {
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        self.disnode.bot.Ban(command.msg.server, uid);
        self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been banned.");
      } else {
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        self.disnode.bot.Ban(command.msg.server, uid, command.params[1]);
        self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been banned, and messages from " + command.params[1] + " day(s) deleted.");
      }
    } else self.AccessDenied(command);
  }
  commandSoftban(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: No user has been inputed.");
      } else {
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        self.disnode.bot.Ban(command.msg.server, uid, "1");
        setTimeout(function() {
          self.disnode.bot.Unban(command.msg.server, uid);
        }, 500);
        self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been softbanned, and messages from the past day deleted.");
      }
    } else self.AccessDenied(command);
  }
  commandUnban(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: No user has been inputed.");
      } else {
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        self.disnode.bot.Unban(command.msg.server, uid);
        self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been unbanned.");
      }
    } else self.AccessDenied(command);
  }
  commandMute(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: No user has been inputed.");
      } else {
        var server = this.disnode.bot.GetServerByID(command.msg.server);
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        var role;
        var found = false;
        for (var key in server.roles) {
          if (self.disnode.bot.GetBotInfo().username + "-Muted" == server.roles[key].name) {
            role = server.roles[key];
            found = true;
            break;
          }
        }
        if (found) {
          var id = role.id;
          self.disnode.bot.client.addToRole({
            serverID: command.msg.server,
            userID: uid,
            roleID: id
          });
        } else {
          self.disnode.bot.client.createRole(command.msg.server, function(err, resp) {
            if (err) return console.log(err);
            self.disnode.bot.client.editRole({
              serverID: command.msg.server,
              roleID: resp.id,
              name: self.disnode.bot.GetBotInfo().username + "-Muted",
              color: 0x525252,
              hoist: true,
              permissions: {
                TEXT_READ_MESSAGES: true,
                TEXT_SEND_MESSAGES: false,
                VOICE_CONNECT: true,
                VOICE_SPEAK: false,
              },
              mentionable: false,
              position: 5
            });
            var channels = Object.keys(self.disnode.bot.client.servers[command.msg.server].channels);
            for (var i = 0; i < channels.length; i++) {
              var channel = self.disnode.bot.client.servers[command.msg.server].channels[channels[i]];
              if (channel.type != "text") continue;
              self.disnode.bot.client.editChannelPermissions({
                channelID: channel.id,
                roleID: resp.id,
                deny: [Discord.Permissions.TEXT_SEND_MESSAGES, Discord.Permissions.TEXT_ATTACH_FILES],
              });
            }
            self.disnode.bot.client.addToRole({
              serverID: command.msg.server,
              userID: uid,
              roleID: resp.id
            });
          });
        }
        self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been muted.");
      }
    } else self.AccessDenied(command);
  }
  commandUnmute(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: No user has been inputed.");
      } else {
        var server = this.disnode.bot.GetServerByID(command.msg.server);
        var uid = command.params[0];
        uid = uid.replace(/\D/g, '');
        var role;
        var found = false;
        for (var key in server.roles) {
          if (self.disnode.bot.GetBotInfo().username + "-Muted" == server.roles[key].name) {
            role = server.roles[key];
            found = true;
            break;
          }
        }
        if (found) {
          var id = role.id;
          self.disnode.bot.client.removeFromRole({
            serverID: command.msg.server,
            userID: uid,
            roleID: id
          });
          self.disnode.bot.SendMessage(command.msg.channel, "User **" + self.U2ID(command) + "** - (" + uid + ") has been unmuted.");
        } else {
          self.disnode.bot.SendMessage(command.msg.channel, "No user has been muted yet on this server.")
        }
      }
    } else self.AccessDenied(command);
  }
  commandDelete(command) {
    var self = this;
    if (command.msg.userID == self.guildOwner(command)) {
      if (command.params[0] == undefined) {
        self.disnode.bot.SendMessage(command.msg.channel, ":warning: Pick an amount of messages to delete. (1-100)");
      } else {
        self.disnode.bot.client.getMessages({
          channelID: command.msg.channel,
          limit: parseInt(command.params[0]),
          before: command.msg.obj.id,
        }, function(error, messageArry) {
          var ids = [];
          for (var i = 0; i < messageArry.length; i++) {
            ids.push(messageArry[i].id);
          }
          self.disnode.bot.DeleteMessages(command.msg.channel, ids);
          self.disnode.bot.client.deleteMessage({
            channelID: command.msg.channel,
            messageID: command.msg.obj.id
          });
        });
      }
    } else self.AccessDenied(command);
  }
  AccessDenied(command) {
    var self = this;
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 15158332,
      author: {},
      fields: [{
        name: "Stop",
        inline: false,
        value: "**As of right now it\'s a Guild Owner command**",
      }],
      footer: {}
    });
  }
  guildOwner(command) {
    var ownerID = this.disnode.bot.client.servers[command.msg.server].owner_id;
    return ownerID;
  }
  U2ID(command) {
    var uid = command.params[0];
    uid = uid.replace(/\D/g, '');
    var mID = this.disnode.bot.client.users[uid].username;
    return mID;
  }
}
module.exports = ModerationPlugin;
// Made by Hazed SPaCE✘#2574
