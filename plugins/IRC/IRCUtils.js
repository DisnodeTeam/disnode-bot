const tmi = require('tmi.js');

class IRCUtils {
  constructor(plugin) {
    var self = this;
    self.plugin = plugin;
  }

  irc(type, command) {
    var self = this;
    return new Promise(function(resolve) {
      var irc = [];
      self.plugin.DB.Find("IRC", {
        "id": command.msg.guildID
      }).then(function(found) {
        irc = found[0];
        var options = {
          options: {
            debug: true
          },
          connection: {
            reconnect: true
          },
          identity: {
            username: self.plugin.disnode.botConfig.twitchuser,
            password: self.plugin.disnode.botConfig.twitchtoken
          },
          channels: irc.channels
        };
        var client = new tmi.client(options);
        switch (type) {
          case 'add':
            var status = {
              count: 0,
              good: false
            }
            for (var i = 0; i < irc.owners.length; i++) {
              if (irc.owners[i].channel == command.params[0]) {
                self.plugin.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "That channel is already active. User that activated this channe is ``" + irc.owners[i].owner + "``.");
                status.count = irc.owners.length;
                resolve(status);
                return;
              }
            }
            var owner = {
              channel: command.params[0],
              owner: command.msg.author.username
            }
            irc.channels.push(command.params[0])
            irc.owners.push(owner)
            self.plugin.DB.Update("IRC", {
              "id": command.msg.guildID
            }, irc);
            status.count = irc.owners.length;
            status.good = true;
            resolve(status);
            break;
          case 'start':
            client.connect().then(function(hi){
              console.log(hi)
            })
            break;
          case 'stop':
            client.disconnect();
            break;

        }
      });
    });
  }
}
module.exports = IRCUtils;
