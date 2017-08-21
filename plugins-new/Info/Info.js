const dateFormat = require('dateformat');

class InfoPlugin {
  constructor() {

  }
  default (command) {
    var self = this;
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 1752220,
      thumbnail: {},
      author: {},
      fields: [{
        name: "Info Commands",
        inline: true,
        value: "**" + self.disnode.botConfig.prefix + "info user** - Gets the info of a user.\n**" + self.disnode.botConfig.prefix + "info server** - Gets the info of the server.",
      }],
      footer: {
        text: command.msg.user,
        icon_url: self.avatarCommandUser(command),
      },
      timestamp: new Date(),
    });
  }
  commandServer(command) {
    var self = this;
    var bot = this.disnode.bot.GetBotInfo();
    var serv = self.disnode.bot.servers[command.msg.server];
    var own = this.disnode.bot.GetUserInfo(serv.owner_id);
    var now = self.disnode.bot.GetSnowflakeDate(command.msg.server);
    var roles = "";
    for (var ids in serv.roles) {
      if (serv.roles.hasOwnProperty(ids)) {
        roles += serv.roles[ids].name + '  **|**  ';
      }
    }
    roles = roles.replace("@everyone  **|**  ", "");
    var emotes = "";
    for (var ids in serv.emojis) {
      if (serv.emojis.hasOwnProperty(ids)) {
        emotes += "<:" + serv.emojis[ids].name + ':' + serv.emojis[ids].id + '> ';
      }
    }
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 1752220,
      thumbnail: {
        url: self.iconServer(command),
      },
      author: {
        name: serv.name
      },
      fields: [{
          name: "Server ID",
          inline: true,
          value: serv.id,
        },
        {
          name: "Created on",
          inline: true,
          value: dateFormat(now, "mmmm dS, yyyy, h:MM:ss TT"),
        },
        {
          name: "Owner",
          inline: true,
          value: own.username + "#" + own.discriminator,
        },
        {
          name: "Owner ID",
          inline: true,
          value: serv.owner_id,
        },
        {
          name: "Users",
          inline: true,
          value: serv.member_count,
        },
        {
          name: "Region",
          inline: true,
          value: serv.region,
        },
        {
          name: "AFK Channel",
          inline: true,
          value: (serv.afk_channel_id == null) ? "none" : self.disnode.bot.client.channels[serv.afk_channel_id].name,
        },
        {
          name: "Roles",
          inline: false,
          value: '**|**  ' + roles,
        },
        {
          name: "Server Emojis",
          inline: false,
          value: (emotes == "") ? "There are none :open_mouth:" : emotes
        }
      ],
      footer: {
        text: command.msg.user,
        icon_url: self.avatarCommandUser(command),
      },
      timestamp: new Date(),
    });
  }
  commandUser(command) {
    var self = this;
    if (command.params[0] == undefined) {
      var own = this.disnode.bot.GetUserInfo(command.msg.userID);
      var now = self.disnode.bot.GetSnowflakeDate(command.msg.userID);
      var use = self.disnode.bot.GetUserByID(command.msg.server, command.msg.userID);
      var mem = self.disnode.bot.GetMember(self.server, command.msg.userID);
      console.log(use);
      var rm = ""
      var roles = mem.roles;
      
      var status = self.disnode.bot.GetUserStatus(self.server,command.msg.userID );
      for (var i = 0; i < roles.length; i++) {

        var roleName = self.disnode.bot.GetRoleById(self.server, roles[i]).name;
        rm += roleName + "  **|**  ";
      }
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 1752220,
        thumbnail: {
          url: self.avatarCommandUser(command),
        },
        author: {},
        fields: [{
            name: own.username + "#" + own.discriminator,
            inline: true,
            value: (status.game == null) ? status.status + " | Not playing a game" : status.status + " | Playing **" + status.game.name + "**",
          },
          {
            name: "ID",
            inline: true,
            value: command.msg.userID,
          },
          {
            name: "Created on",
            inline: false,
            value: dateFormat(now, "mmmm dS, yyyy, h:MM:ss TT"),
          },
          {
            name: "Joined on",
            inline: false,
            value: dateFormat(mem.joined_at, "mmmm dS, yyyy, h:MM:ss TT"),
          },
          {
            name: "Roles",
            inline: false,
            value: '**|**  ' + rm,
          }
        ],
        footer: {
          text: command.msg.user,
          icon_url: self.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    } else {
      var uid = command.params[0];
      uid = uid.replace(/\D/g, '');
      var own = this.disnode.bot.GetUserInfo(uid);
      var now = self.disnode.bot.GetSnowflakeDate(uid);
      var use = self.disnode.bot.GetUserByID(command.msg.server, uid);
      var rm = ""
      var roles = self.disnode.bot.client.servers[command.msg.server].members[uid].roles;
      for (var i = 0; i < roles.length; i++) {
        var serverRoles = self.disnode.bot.client.servers[command.msg.server].roles;
        var roleName = serverRoles[roles[i]].name;
        rm += roleName + "  **|**  ";
      }
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 1752220,
        thumbnail: {
          url: self.avatarUser(command),
        },
        author: {},
        fields: [{
            name: own.username + "#" + own.discriminator,
            inline: true,
            value: (use.status == undefined) ? "offline" : (own.game == null) ? use.status + " | Not playing a game" : use.status + " | Playing **" + own.game.name + "**",
          },
          {
            name: "ID",
            inline: true,
            value: uid,
          },
          {
            name: "Created on",
            inline: false,
            value: dateFormat(now, "mmmm dS, yyyy, h:MM:ss TT"),
          },
          {
            name: "Joined on",
            inline: false,
            value: dateFormat(use.joined_at, "mmmm dS, yyyy, h:MM:ss TT"),
          },
          {
            name: "Roles",
            inline: false,
            value: '**|**  ' + rm,
          }
        ],
        footer: {
          text: command.msg.user,
          icon_url: self.avatarCommandUser(command),
        },
        timestamp: new Date(),
      });
    }
  }
  avatarBot(command) {
    var self = this;
    return "https:\/\/cdn.discordapp.com\/avatars\/" + self.disnode.bot.GetBotInfo().id + "\/" + self.disnode.bot.GetBotInfo().avatar + ".jpg?size=1024";
  }
  avatarUser(command) {
    var self = this;
    var uid = command.params[0];
    uid = uid.replace(/\D/g, '');
    var own = this.disnode.bot.GetUserInfo(uid);
    if (own.avatar != null) {
      if (own.avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + uid + "\/" + own.avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + uid + "\/" + own.avatar + ".png";
      }
    }
  }
  avatarCommandUser(command) {
    var self = this;

    if (command.msg.raw.author.avatar != null) {
      if (command.msg.raw.author.avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.userID + "\/" + command.msg.raw.author.avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.userID + "\/" + command.msg.raw.author.avatar + ".png";
      }
    }
  }
  iconServer(command) {
    var self = this;
    var serv = self.disnode.bot.servers[command.msg.server];
    return "https:\/\/cdn.discordapp.com\/icons\/" + serv.id + "\/" + serv.icon + ".png?size=1024";
  }


}
module.exports = InfoPlugin;
// Made by Hazed SPaCE✘#2574
