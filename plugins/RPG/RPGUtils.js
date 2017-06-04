class RPGUtils {
  constructor(plugin) {
    var self = this;
    self.plugin = plugin;
  }
  gUser(command) {
    var self = this;
    var players = [];
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("players", {"id": command.msg.userID}).then(function(found) {
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
              item: "Shortsword",
              id: 1,
              amount: 1
            },
            {
              item: "Health Potion",
              id: 2,
              amount: 2
            }
          ]
        }
        for (var i = 0; i < players.length; i++) {
          if (newPlayer.name == players[i].name) {
            newPlayer.name += "1";
            break;
          }
        }
        self.plugin.DB.Insert("players", newPlayer);
        resolve(newPlayer);
        return;
      });
    });
  }
  fplayer(info){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("players", {}).then(function(players) {
        var id = self.pMention(info);
        for (var i = 0; i < players.length; i++) {
          if(players[i].id == id){
            resolve({found: true, p: players[i]});
            return;
          }else if (players[i].name == info) {
            resolve({found: true, p: players[i]});
            return;
          }
        }
        var found = [];
        var msg = "Did you mean?\n";
        for (var i = 0; i < players.length; i++) {
        if(info.length < 3)break;
          if(players[i].name.toLowerCase().includes(info.toLowerCase())){
            found.push(players[i])
          }
        }
        for (var i = 0; i < found.length; i++) {
          msg += "**" + found[i].name + "**\n"
        }
        if(found.length == 1){
          resolve({found: true, p: found[0]});
          return;
        }else if (found.length > 0) {
          resolve({found: false, msg: msg});
          return;
        }else if (found.length == 0) {
          resolve({found: false, msg: "Could not find any player matching that description!"});
          return;
        }
      });
    });
  }
  pMention(uid) {
    var id = uid.replace(/\D/g, '');
    return id;
  }
  getItem(type, id){
    var self = this;
    self.plugin.DB.Find("items", {"id":"items"}).then(function(items) {
      console.log(type);
      console.log(items);
      console.dir(items[type.toString()][id.toString()]);
    });
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
module.exports = RPGUtils;
