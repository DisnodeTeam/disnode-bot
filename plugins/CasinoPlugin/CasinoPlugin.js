const numeral = require('numeral');

class CasinoPlugin {
  constructor() {
    console.log("CASINO PLUGIN CONSTRUCTOR IS RUNNING!");
    this.updateCoroutine();
  }
  default (command) {
    var self = this;
    self.getPlayer(command).then(function(player){
      console.dir(self.class);
      var msg = "**Commands:**\n";
      for (var i = 0; i < self.class.commands.length; i++) {
        msg += self.disnode.botConfig.prefix + self.class.config.prefix + " " + self.class.commands[i].cmd + " - " + self.class.commands[i].desc + "\n";
      }
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Casino", "Hello, " + player.name + "!\n" + msg);
    });
  }
  commandBal(command){
    var self = this;
    if(command.params[0] != undefined){
      self.findPlayer(command.params[0]).then(function(res) {
        if(res.found){
          self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 3447003,
            author: {},
            title: res.p.name + ' Balance',
            fields: [ {
              name: 'Money',
              inline: true,
              value: "$" + numeral(res.p.money).format('0,0.00'),
            }, {
              name: 'Income / 30min.',
              inline: true,
              value: "$" + numeral(res.p.perUpdate).format('0,0.00'),
            }, {
              name: 'XP',
              inline: true,
              value: res.p.xp,
            }, {
              name: 'Premium',
              inline: true,
              value: res.p.Premium,
            }, {
              name: 'Keys',
              inline: true,
              value: res.p.keys,
            }, {
              name: 'Level',
              inline: true,
              value: res.p.lv,
            }],
              footer: {}
          });
        }else {
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg);
        }
      })
    }else {
      self.getPlayer(command).then(function(player) {
        self.disnode.bot.SendEmbed(command.msg.channel,
          {
            color: 3447003,
            author: {},
            title: player.name + ' Balance',
            fields: [ {
              name: 'Money',
              inline: true,
              value: "$" + numeral(player.money).format('0,0.00'),
            }, {
              name: 'Income / 30min.',
              inline: true,
              value: "$" + numeral(player.perUpdate).format('0,0.00'),
            }, {
              name: 'XP',
              inline: true,
              value: player.xp,
            }, {
              name: 'Premium',
              inline: true,
              value: player.Premium,
            }, {
              name: 'Keys',
              inline: true,
              value: player.keys,
            }, {
              name: 'Level',
              inline: true,
              value: player.lv,
            }],
              footer: {}
          }
        );
      })
    }
  }
  commandSlot(command) {
    var self = this;
    self.disnode.bot.SendCompactEmbed(command.msg.channel, "Slot", "You bet was: " + command.params[0]);
  }
  getPlayer(data){
    var self = this;
    var players = [];
    return new Promise(function(resolve, reject) {
      self.disnode.DB.Find("players", {}).then(function(found) {
        players = found;
        for (var i = 0; i < players.length; i++) {
          if(data.msg.userID == players[i].id){
            console.log("Found a Player!");
            resolve(players[i]);
            return;
          }
        }
        var newPlayer = {
          name:  data.msg.user,
          id: data.msg.userID,
          money: 10000,
          perUpdate: 1000,
          xp: 0,
          lv: 1,
          Premium: false,
          Admin: false,
          banned: false,
          banreason: "",
          stats: {
            slotPlays: 0,
            coinPlays: 0,
            slotWins: 0,
            coinWins: 0,
            slotSingleC: 0,
            slotTripleC: 0,
            slot3s: 0,
            slot2s: 0,
            slot1s: 0,
            slotJackpots: 0,
            coinHeads: 0,
            coinTails: 0
          },
          keys: 0
        }
        for (var i = 0; i < players.length; i++) {
          if(newPlayer.name == players[i].name){
            newPlayer.name += "1";
            break;
          }
        }
        self.disnode.DB.Insert("players", newPlayer).then(function(res) {
          console.log(res);
        });
        resolve(newPlayer);
        return;
      });
    });
  }
  updatePlayer(oldp, newp){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.disnode.DB.Update("players", oldp, newp).then(function(res) {
        resolve(res);
      })
    });
  }
  parseMention(dataString){
    var self = this;
    var returnV = dataString;
    returnV = returnV.replace(/\D/g,'');
    return returnV;
  }
  findPlayer(info){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.disnode.DB.Find("players", {}).then(function(players) {
        var id = self.parseMention(info);
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
      })
    });
  }
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  updateLastSeen(player){
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      month = numeral((month < 10 ? "0" : "") + month).value();
      var day  = date.getDate();
      day = numeral((day < 10 ? "0" : "") + day).value();
      player.lastSeen = {
        pmonth: numeral(month).value(),
        pday: numeral(day).value(),
        pyear: numeral(year).value()
      }
    }
  canGetIncome(player){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = numeral((month < 10 ? "0" : "") + month).value();
    var day  = date.getDate();
    day = numeral((day < 10 ? "0" : "") + day).value();
    var yearsPassed = year - player.lastSeen.pyear;
    var monthsPassed = month - player.lastSeen.pmonth;
    var daysPassed = day - player.lastSeen.pday;
    if((yearsPassed > 0) | (monthsPassed > 0) | (daysPassed > 1)){
      return false;
    }
    return true;
  }
  checkBan(player, command){
    if(player.banned){
      this.disnode.bot.SendEmbed(command.msg.channel, {
        color: 3447003,
        author: {},
        fields: [ {
          name: "You have been banned!",
          inline: false,
          value: ":octagonal_sign: You are banned! heres why: ``` " + player.banreason + "```",
        }, {
          name: 'Ban Appeal',
          inline: false,
          value: "**If you wish to appeal your ban you will have to do so in this discord channel: ** https://discord.gg/gxQ7nbQ",
        }],
          footer: {}
        });
      return true;
    }else {
      return false;
    }
  }
  cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
  }
  updateCoroutine(){
    var self = this;
    self.disnode.DB.Find("players", {}).then(function(players) {
      for (var i = 0; i < players.length; i++) {
        var oldp = self.cloneObject(players[i]);
        if(players[i].lastSeen == undefined){
          self.updateLastSeen(players[i]);
        }
        if(self.canGetIncome(players[i])){
          players[i].money += players[i].perUpdate;
        }
        players[i].lastMessage = null;
        self.disnode.DB.Update("players", oldp, players[i]).then(function(res) {
          console.log(res);
        });
      }
    })
    setTimeout(function() {
      var n = self.getRandomIntInclusive(0,3);
      if(n == 0){
        self.disnode.bot.SetStatus("!casino slot");
      }else if (n == 1) {
        self.disnode.bot.SetStatus("!casino wheel");
      }else if (n == 2) {
        self.disnode.bot.SetStatus("!casino flip");
      }else {
        self.disnode.bot.SetStatus("!casino");
      }
      self.updateCoroutine();
    }, 1800000);
  }
}

module.exports = CasinoPlugin;
