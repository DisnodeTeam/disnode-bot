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
          dev: (data.isAdmin == null) ? false : data.isAdmin,
          banned: false,
          pvp: false,
          reason: "",
          guild: "",
          guildrole: "",
          chealth: 50,
          thealth: 50,
          gold: 50,
          xp: 0,
          lv: 1,
          nextlv: 100,
          skills: {
            strength: 1,
            defense: 1,
            luck: 1,
            charisma: 1,
            points: 0
          },
          equipped: [{
            type: 'weapon',
            weapontype: 'shortsword',
            name: 'Copper Shortsword',
            nick: null,
            minDamage: 3,
            maxDamage: 7,
            lvl: 1,
            buy: 0,
            sell: 0
          },
          {
            type: 'breastplate',
            name: 'Copper Breastplate',
            nick: null,
            minDefense: 8,
            maxDefense: 12,
            lvl: 1,
            buy: 0,
            sell: 0
          },
          {
            type: 'greaves',
            name: 'Copper Greaves',
            nick: null,
            minDefense: 3,
            maxDefense: 7,
            lvl: 1,
            buy: 0,
            sell: 0
          },
          {
            type: 'helmet',
            name: 'Copper Helmet',
            nick: null,
            minDefense: 3,
            maxDefense: 7,
            lvl: 1,
            buy: 0,
            sell: 0
          },
          {
            type: 'shield',
            name: 'Copper Shield',
            nick: null,
            minDefense: 3,
            maxDefense: 7,
            lvl: 1,
            buy: 0,
            sell: 0
          }],
          inv: [{
              defaultName : "Apple",
              amount: 5
            },
            {
              defaultName: "Health Potion",
              amount: 2
            }
          ],
          adventure: [{
            name: "",
            minDamage: 0,
            maxDamage: 0,
            maxHealth: 0,
            currentHealth: 0,
            minDefense: 0,
            maxDefense: 0,
            minXP: 0,
            maxXP: 0
          }],
          lastMessage: null
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
  gGuild(guildID) {
    var self = this;
    var guilds = [];
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("guilds", {"id": guildID}).then(function(found) {
        guilds = found;
        for (var i = 0; i < guilds.length; i++) {
          if (guildID == guilds[i].id) {
              resolve(guilds[i]);
              return;
          }
        }
        reject("Guild Not Found!");
      });
    });
  }
  gNameGuild(guildName) {
    var self = this;
    var guilds = [];
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("guilds", {"name": guildName}).then(function(found) {
        guilds = found;
        for (var i = 0; i < guilds.length; i++) {
          if (guildName == guilds[i].name) {
              resolve(guilds[i]);
              return;
          }
        }
        reject("Guild Not Found!");
      });
    });
  }
  /*
  gMob(lvlmin) {
    var self = this;
    var guilds = [];
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("mobs", {"encounterlvlmin": >= lvlmin}).then(function(found) {
        guilds = found;
        for (var i = 0; i < guilds.length; i++) {
          if (guildName == guilds[i].name) {
              resolve(guilds[i]);
              return;
          }
        }
        reject("Guild Not Found!");
      });
    });
  }*/
  newGuild(player, name){
    var self = this;
    return new Promise(function(resolve, reject) {
      var newGuild = {
        name: name,
        desc: "",
        thumbnail: "",
        id: player.id,
        open: true,
        owner_id: player.id,
        owner_name: player.name,
        gold: 0,
        members: [{
          name: player.name,
          id: player.id,
          role: "owner"
        }],
        inv: [],
        invites: []
      }
      self.plugin.DB.Find("guilds", {"id": player.id}).then(function(found) {
        for (var i = 0; i < found.length; i++) {
          if (newGuild.name == found[i].name) {
            reject("That guild name is already taken!")
            break;
          }
        }
        self.plugin.DB.Insert("guilds", newGuild);
        resolve(newGuild);
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
  fGuild(guildname) {
    var self = this;
    var guilds = [];
    return new Promise(function(resolve, reject) {
      self.plugin.DB.Find("guilds", {"name": guildname}).then(function(found) {
        guilds = found;
        for (var i = 0; i < guilds.length; i++) {
          if (guildname == guilds[i].name) {
              resolve(true);
              return;
          }
        }
        resolve(false);
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
  getItems(type){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.isValidType(type)){
        self.plugin.DB.Find(type, {}).then(function(items) {
          resolve(items);
        });
      }else {
        reject("Invalid Item Type!")
      }
    });
  }
  getItem(type, name){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.isValidType(type)){
        self.plugin.DB.Find(type, {"name":name}).then(function(items) {
          for (var i = 0; i < items.length; i++) {
            if(items[i].name.toLowerCase() == name.toLowerCase()){
              resolve(items[i]);
              break;
            }
          }
          reject("Item Not Found!");
        });
      }else {
        reject("Invalid Item Type!");
      }
    });
  }
  isValidType(type){
    if(type.toLowerCase() == "breastplate")return true;
    if(type.toLowerCase() == "greatsword")return true;
    if(type.toLowerCase() == "greaves")return true;
    if(type.toLowerCase() == "helmet")return true;
    if(type.toLowerCase() == "shortsword")return true;
    if(type.toLowerCase() == "health")return true;
    return false;
  }
  checkLV(player, channel){
    var self = this;
    var lvup = false;
    while(player.xp >= (player.nextlv)){
      player.lv++;
      player.thealth = player.thealth + 50;
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
  ChangeLog(){
    return '`Test ChangeLog Embed`'
  }
}
module.exports = RPGUtils;
