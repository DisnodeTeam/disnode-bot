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
        self.plugin.disnode.platform.GetUserData(command.msg.userID).then(function(data) {
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
  }/*
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
            resolve("That guild name is already taken!")
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
  gGather(type, id) {
    var self = this;
  return new Promise(function(resolve, reject) {
    switch (type) {
      case "mine":
      self.plugin.DB.Find("mine", {"id": id}).then(function(type) {
        for (var i = 0; i < type.length; i++) {
          if (id == type[i].id) {
              resolve(type[i]);
              return;
          }
        }
      });
      break;
    }
    });
  }
  theMaths(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  updatePlayerLastMessage(player){
    var currentDate = new Date().getTime();
    player.lastMessage = parseInt(currentDate);
  }
  checkTimeout(player, seconds){
    var self = this;
    var currentDate = new Date().getTime();
    if(player.lastMessage == null){
      return {pass: true};
    }
    var targetMS = player.lastMessage + (seconds * 1000);
    var remainingMS = currentDate - targetMS;
    if(remainingMS >= 0){
      var elapsedObj = self.getElapsedTime(remainingMS);
      return {pass: true, remain: elapsedObj.days + " Days" + elapsedObj.hours + " Hours " + elapsedObj.minutes + " Minutes " + elapsedObj.seconds + " Seconds " + elapsedObj.miliseconds + " Miliseconds"};
    }else {
      remainingMS = -remainingMS;
      var elapsedObj = self.getElapsedTime(remainingMS);
      return {pass: false, remain: elapsedObj.minutes + " Minutes " + elapsedObj.seconds + " Seconds"};
    }
  }
  getElapsedTime(ms){
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = parseInt(ms / 1000);
    var miliseconds = ms % 1000;
    while (seconds > 60) {
      minutes++;
      seconds -= 60;
      if (minutes == 60) {
        hours++;
        minutes = 0;
      }
      if(hours == 24){
        days++
        hours = 0;
      }
    }
    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      miliseconds: miliseconds
    }
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
    return new Promise(function(resolve, reject) {
      if(isValidType(type)){
        self.plugin.DB.Find(type, {}).then(function(items) {
          resolve(items);
        });
      }else {
        reject("Invalid Item Type!")
      }
    });
  }
  isValidType(type){
    if(type == "weapons")return true;
    if(type == "health")return true;
    if(type == "armor")return true;
    if(type == "mobs")return true;
    return false;
  }
  checkLV(player, channel){
    var self = this;
    var lvup = false;
    while(player.xp >= (player.nextlv)){
      player.lv++;
      player.gold += player.lv + 1 * 100 * 1.2;
      player.skills.points += 2;
      player.chealth = player.thealth + 50;
      player.thealth += 50;
      player.nextlv += (100 * player.lv);
      lvup = true;
    }
    if(lvup) self.plugin.disnode.bot.SendCompactEmbed(channel, player.name + " Level Up!", "**You are now a Lv:** " + player.lv + "\n**Your health has been healed and increased to:** " + player.thealth + "HP", 1433628);
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
    return `Test
ChangeLog
Embed`
  }
}
module.exports = RPGUtils;
