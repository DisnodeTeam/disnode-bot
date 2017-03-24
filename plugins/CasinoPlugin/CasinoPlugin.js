const numeral = require('numeral');

class CasinoPlugin {
  constructor() {
    var self = this;
    self.casinoObj = {};
    self.slotItems = [
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},
      {item:":100:"},{item:":100:"},{item:":100:"},{item:":100:"},{item:":key:"}
    ]

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
      var botinfo = self.disnode.bot.GetBotInfo();
      console.dir(botinfo);
      self.disnode.DB.Find("casinoObj", {}).then(function(res) {
        self.casinoObj = res[0];
      })
      self.updateCoroutine();
    }, 1000);
  }
  default (command) {
    var self = this;
    self.getPlayer(command).then(function(player){
      var msg = "";
      for (var i = 0; i < self.class.commands.length; i++) {
        msg += self.disnode.botConfig.prefix + self.class.config.prefix + " " + self.class.commands[i].cmd + " - " + self.class.commands[i].desc + "\n";
      }
      self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 3447003,
        author: {},
        fields: [ {
          name: 'Casino',
          inline: true,
          value: "Hello, " + player.name + "!\nCasino Bot is A Discord bot that allows users to play Casino Games on Discord **FOR AMUESMENT ONLY**",
        },{
          name: 'Commands:',
          inline: true,
          value: msg,
        }, {
          name: 'Discord Server',
          inline: false,
          value: "**Join the Disnode Server for Support and More!:** https://discord.gg/gxQ7nbQ",
        }, {
          name: 'Disnode Premium',
          inline: false,
          value: "**Help us keep the bots running 24/7 and get great perks by doing so by giving us a pledge of $1 a month :** https://www.patreon.com/Disnode",
        }],
          footer: {}
      });
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
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      switch (command.params[0]) {
        case "info":
          if(player.money > 8500){
            var minJackpotBet = (player.money * 0.015);
          }else var minJackpotBet = 250;
          self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 3447003,
            author: {},
            title: 'Casino Slots',
            description: 'Info',
            fields: [ {
              name: 'Slot Items',
              inline: false,
              value: ":cherries: - Cherries (Most Common)\n\n:third_place:\n\n:second_place:\n\n:first_place:\n\n:100: - 100 (Most Rare)",
            }, {
              name: 'Slot Wins and Payouts',
              inline: false,
              value: "\n:cherries::cherries::cherries: - 2x bet 10XP\n"+
              ":third_place::third_place::third_place: - 4x bet 20XP\n"+
              ":second_place::second_place::second_place: - 8x bet 40XP\n"+
              ":first_place::first_place::first_place: - 16x bet 80XP\n"+
              ":100::100::100: - JACKPOT value - 1000XP\n" +
              ":key::key::key: -  3 Keys (**Minimum Jackpot Bet Required**)\n" +
              "At least one :key: - 1 Key (**Minimum Jackpot Bet Required**)\n" +
              "At least one :cherries: - 1/2 your Original Bet",
            },{
              name: 'Minimum bet to Win Jackpot',
              inline: false,
              value: "Minimum bet: $**" + numeral(minJackpotBet).format('0,0.00') + "** (if money < 8,500 min bet = 250) else (min bet = money * 0.03 or 3%))"
            },{
              name: 'XP',
              inline: false,
              value: "The XP system has changed a bit, if your bet is lower than $250, you will not get any XP",
            },{
              name: 'Jackpot',
              inline: false,
              value: "Jackpot Value is increased every time someone plays slots, the value is increased by the players bet amount and has a default value of $100,000\n**Current Jackpot Value: **$" + numeral(self.casinoObj.jackpotValue).format('0,0.00'),
            }, {
              name: 'Jackpot History',
              inline: true,
              value: "**Last won by:** " + self.casinoObj.jackpotstat.lastWon,
            }],
              footer: {}
            });
          break;
        case undefined:

          break;
        default:

      }
    })
  }
  getPlayer(data){
    var self = this;
    var players = [];
    return new Promise(function(resolve, reject) {
      self.disnode.DB.Find("players", {}).then(function(found) {
        players = found;
        for (var i = 0; i < players.length; i++) {
          if(data.msg.userID == players[i].id){
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
  updateCoroutine(){
    var self = this;
    self.disnode.DB.Find("players", {}).then(function(players) {
      for (var i = 0; i < players.length; i++) {
        if(players[i].lastSeen == undefined){
          self.updateLastSeen(players[i]);
        }
        if(self.canGetIncome(players[i])){
          players[i].money += players[i].perUpdate;
        }
        players[i].lastMessage = null;
        self.disnode.DB.Update("players", {"id":players[i].id}, players[i]);
      }
    });
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
