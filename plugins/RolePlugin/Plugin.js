class Template {
  constructor() {


  }
  default(command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var msg = "";
    for (var i = 0; i < self.commands.length; i++) {
      msg += self.disnode.botConfig.prefix + self.config.prefix + " " + self.commands[i].cmd + " - " + self.commands[i].desc + "\n";
    }

    self.disnode.bot.SendEmbed(command.msg.channelID, {
      color: 3447003,
      user: {},
      fields: [{
        name: 'Giveaway',
        inline: true,
        value: "Hello, " + command.msg.user.username + "!",
      }, {
        name: 'Commands:',
        inline: true,
        value: msg,
      }, {
        name: 'Discord Server',
        inline: false,
        value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
      }],
      footer: {}
    });
  }

  commandAddRole(command) {
    var self = this;
    var guild = self.disnode.bot.guilds.Get(command.msg.guildID);
    var roleSearch = command.params[0];
    if (!command.isOwner) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":x: Role Permission Error", "Only server admin can run this command!")
      return;
    }
    if (!roleSearch) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "Please enter a role id to remove! Can run `^id roles` if you have the `id-plugin` installed!")
      return;
    }
    if (!self.config.roles) {
      self.config.roles = [];
    }
    var roleArrray = self.config.roles;
    var foundRoles = self.getRoleByPartialName(guild.roles, roleSearch, false);
    if (foundRoles.length == 0) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "No Roles found that can be given with the name: " + roleSearch)
      return;
    }
    var roleID = foundRoles[0].id;
    if (roleArrray.includes(roleID)) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "Role alrady added!")
      return;
    }
    roleArrray.push(roleID);

    self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Role Plugin", "Adding role: " + foundRoles[0].name)
    self.pluginManager.ChangePluginConfig(self.id, "roles", roleArrray);


  }

  commandRemoveRole(command) {
    var self = this;
    var guild = self.disnode.bot.guilds.Get(command.msg.guildID);
    var roleSearch = command.params[0];
    if (!command.isOwner) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":x: Role Permission Error", "Only server admin can run this command!")
      return;
    }
    if (!roleSearch) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "Please enter a role name to remove! ")
      return;
    }

    var roleArrray = self.config.roles;

    var foundRoles = self.getRoleByPartialName(guild.roles, roleSearch, false);
    if (foundRoles.length == 0) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "No Roles found that can be given with the name: " + roleSearch)
      return;
    }
    var roleID = foundRoles[0].id;


    roleArrray.splice(roleArrray.indexOf(roleID), 1)
    self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Role Plugin", "Removed role: " + foundRoles[0].id)
    self.pluginManager.ChangePluginConfig(self.id, "roles", roleArrray);


  }
  commandSet(command) {
    var self = this;
    if (!this.config.roles) {
      this.config.roles = [];
    }
    var guild = self.disnode.bot.guilds.Get(command.msg.guildID);
    var member = self.disnode.bot.members.Get(command.msg.user.id)

    var roleSearchs = command.params;

    if (!roleSearchs) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "Please type some roles!")
      return;
    }
    var added = []
    roleSearchs.forEach(function (roleSearch) {
      var foundRoles = self.getRoleByPartialName(guild.roles, roleSearch);

      if (foundRoles.length == 0) {
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "No Roles found that can be given with the name: " + roleSearch)
        return;
      }
      added.push(foundRoles[0].name)
      self.disnode.bot.AddRole(command.msg.guildID, command.msg.user.id, foundRoles[0].id).then(() => {
        
      }).catch((err) => {
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":x: Role Plugin Error", err.message)
      })
    }, this);
    self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Role Plugin", ":white_check_mark: Added role(s): " + added.join(", "))
  }

  commandUnSet(command) {
    var self = this;
    if (!this.config.roles) {
      this.config.roles = [];
    }
    var guild = self.disnode.bot.guilds.Get(command.msg.guildID);
    var member = self.disnode.bot.members.Get(command.msg.user.id)

    var roleSearchs = command.params;

    if (!roleSearchs) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "Please type some roles!")
      return;
    }
    var added = [];
    roleSearchs.forEach(function (roleSearch) {
      var foundRoles = self.getRoleByPartialName(guild.roles, roleSearch);

      if (foundRoles.length == 0) {
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":warning: Role Plugin Error", "No Roles found that can be given with the name: " + roleSearch)
        return;
      }
      added.push(foundRoles[0].name)
      self.disnode.bot.RemoveRole(command.msg.guildID, command.msg.user.id, foundRoles[0].id).then(() => {
       
      }).catch((err) => {
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, ":x: Role Plugin Error", err.message)
      })
    }, this);
    self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Role Plugin", ":white_check_mark: Removed role(s): " + added.join(", "))
  }


  getRoleByPartialName(roles, name, check = true) {
    var found = [];
    name = name.toLowerCase();
    for (var i = 0; i < roles.length; i++) {
      var lowerCase = roles[i].name.toLowerCase();
      if (check) {
        if (this.config.roles.includes(roles[i].id)) {
          if (lowerCase.includes(name)) {
            found.push(roles[i]);
          }
        }
      } else {
        if (lowerCase.includes(name)) {
          found.push(roles[i]);
        }
      }


    }

    return found;
  }
}
module.exports = Template;
