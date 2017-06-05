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
          gold: 50,
          xp: 0,
          lv: 1,
          nextlv: 100,
          inv: [{
              "defaultName": "Bronze Shortsword",
              "amount": 1
            },
            {
              "defaultName" : "Apple",
              "amount": 5
            },
            {
              "defaultName": "Health Potion",
              "amount": 2
            }
          ],
          adventure: [{
            name: "",
            minDamage: 0,
            maxDamage: 0,
            minHealth: 0,
            maxHealth: 0,
            currentHealth: 0,
            minDefense: 0,
            maxDefense: 0,
            minXP: 0,
            maxXP: 0
          }]
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
  getLongestString(arr){
    var longest = -1;
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].length > longest)longest = arr[i].length;
    }
    return longest;
  }
  addSpacesToString(string, spaces){
    for (var i = string.length; i < spaces; i++) {
      string += " ";
    }
    return string;
  }
  // weapons, health, armor, mobs
  weaponList(command){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("weapons", {}).then(function(weapons) {
        for (var i = 0; i < weapons.length; i++) {
          if(weapons[i].id == "weapons"){
            resolve({found: true, p: weapons[i]});
            return;
          }
        }
      });
    });
  }
  healList(command){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("health", {}).then(function(health) {
        for (var i = 0; i < health.length; i++) {
          if(health[i].id == "health"){
            resolve({found: true, p: health[i]});
            return;
          }
        }
      });
    });
  }
  armorList(command){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("armor", {}).then(function(armor) {
        for (var i = 0; i < armor.length; i++) {
          if(armor[i].id == "armor"){
            resolve({found: true, p: armor[i]});
            return;
          }
        }
      });
    });
  }
  mobList(command){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("mobs", {}).then(function(mobs) {
        for (var i = 0; i < mobs.length; i++) {
          if(mobs[i].id == "mobs"){
            resolve({found: true, p: mobs[i]});
            return;
          }
        }
      });
    });
  }
  checkLV(player, channel){
    var self = this;
    var lvup = false;
    while(player.xp >= (player.nextlv)){
      player.lv++;
      player.thealth += player.thealth + 50;
      player.nextlv += (100 * player.lv);
      lvup = true;
    }
    if(lvup)self.disnode.bot.SendCompactEmbed(channel, player.name + " Level Up!", "**You are now a Lv:** " + player.lv + "\n**Your health has been healed and increased to:** " + player.thealth + "HP", 1433628);
  }
  pMention(uid) {
    var id = uid.replace(/\D/g, '');
    return id;
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
}
module.exports = RPGUtils;
