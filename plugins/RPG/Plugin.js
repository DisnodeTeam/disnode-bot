class RPGPlugin {
  constructor() {
    var self = this;
    self.DB = {};
  }
  Init(onComplete){
    var self = this;
    setTimeout(function() {
    self.disnode.db.InitPromise({}).then(function(dbo) {
        self.DB = dbo;
        onComplete();
      });
    }, 100 );
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
  statsUser(command){
    var self = this;
    self.gUser(command).then(function(player) {
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 3447003,
          author: {},
          title: player.name + " stats",
          fields: [ {
            name: 'Gold',
            inline: true,
            value: (player.gold),
          }],
            footer: {}
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
          if(command.msg.userID == players[i].id){
              resolve(players[i]);
              return;
            }
        }
        var newPlayer = {
          name: command.msg.user,
          id: command.msg.userID,
          gold: 0
        }
        for (var i = 0; i < players.length; i++) {
          if(newPlayer.name == players[i].name){
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
}
module.exports = RPGPlugin;
