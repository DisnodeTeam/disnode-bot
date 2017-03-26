const numeral = require('numeral');
const logger = require('disnode-logger')

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
    this.store = [
      {cost: 200, type:0, item: "Instant $1,000"},
      {cost: 500, type:0, item: "Instant $2,500"},
      {cost: 1000, type:0, item: "Instant $5,000"},
      {cost: 2000, type:0, item: "Instant $10,000"},
      {cost: 4000, type:0, item: "Instant $20,000"},
      {cost: 6000, type:0, item: "Instant $30,000"},
      {cost: 100, type:0, item: "Add $50 to your income"},
      {cost: 200, type:0, item: "Add $100 to your income"},
      {cost: 400, type:0, item: "Add $200 to your income"},
      {cost: 800, type:0, item: "Add $400 to your income"},
      {cost: 1600, type:0, item: "Add $800 to your income"},
      {cost: 3200, type:0, item: "Add $1600 to your income"}
    ]
    this.recentBetters = [];
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
      self.disnode.DB.Find("casinoObj", {}).then(function(res) {
        self.casinoObj = res[0];
        self.updateCoroutine();
      });
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
            color: 1433628,
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
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
        }
      })
    }else {
      self.getPlayer(command).then(function(player) {
        if(self.checkBan(player, command))return;
        self.disnode.bot.SendEmbed(command.msg.channel,
          {
            color: 1433628,
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
  commandJackpotInfo(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
        if(self.checkBan(player, command))return;
        if(player.money > 8500){
          var minJackpotBet = (player.money * 0.03);
        }else var minJackpotBet = 250;
        self.updateLastSeen(player);
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 1433628,
          author: {},
          fields: [ {
            name: 'JACKPOT Value',
            inline: true,
            value: "$" + numeral(self.casinoObj.jackpotValue).format('0,0.00'),
          },{
            name: 'Minimum bet to Win JACKPOT',
            inline: false,
            value: "$" + numeral(minJackpotBet).format('0,0.00')
          }, {
            name: 'JACKPOT History',
            inline: false,
            value: "**Last won by:** " + self.casinoObj.jackpotstat.lastWon + " **Amount Won:** $" + numeral(self.casinoObj.jackpotstat.LatestWin).format('0,0.00'),
          }],
            footer: {}
          }
        )
    });
  }
  commandSlot(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      switch (command.params[0]) {
        case "info":
          if(player.money > 8500){
            var minJackpotBet = (player.money * 0.03);
          }else var minJackpotBet = 250;
          self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 1433628,
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
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Slots", "Hi, Welcome to the slots! If you need info on the slots the run `!casino slot info`\n\nIf you want to try the slots then do `!casino slot [bet]` for example `casino slot 100` that will run the slot with $100 as the bet");
          break;
        default:
          if(command.params[0]){
            if(command.params[0].toLowerCase() == "allin"){
              command.params[0] = player.money;
            }
            var bet = numeral(command.params[0]).value();
            var timeoutInfo = self.checkTimeout(player, 5);
            if(player.Admin || player.Premium)timeoutInfo = self.checkTimeout(player, 2);
            if(!timeoutInfo.pass){
              logger.Info("Casino", "Slot", "Player: " + player.name + " Tried the slots before their delay of: " + timeoutInfo.remain.sec);
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", 16772880);
              return;
            }
            if(bet > 0.01){
              if(bet > player.money | bet == NaN | bet == "NaN"){// Checks to see if player has enough money for their bet
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), 16772880);
                return;
              }else{
                player.money -= parseFloat(bet);
                self.casinoObj.jackpotValue += parseFloat(bet);
                player.money = parseFloat(player.money.toFixed(2));
                self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
              }
              var slotInfo = {
                bet: bet,
                player: player,
                winText: "",
                winAmount: 0,
                reel1: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                reel2: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                reel3: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                fake1: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                fake2: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                fake3: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                fake4: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                fake5: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
                fake6: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item
              }
              self.didWin(slotInfo);
              if(player.money > 8500){
                var minJackpotBet = (player.money * 0.03);
              }else var minJackpotBet = 250;
              if(timeoutInfo.remain){
                logger.Info("Casino", "Slot", "Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet + " Time since they could use this command again: " + timeoutInfo.remain.sec);
              }else {
                logger.Info("Casino", "Slot", "Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet);
              }
              player.money = parseFloat(player.money.toFixed(2));
              minJackpotBet = parseFloat(minJackpotBet.toFixed(2));
              player.stats.moneyWon = parseFloat(parseFloat(player.stats.moneyWon) + parseFloat(slotInfo.winAmount));
              player.stats.moneyWon = player.stats.moneyWon.toFixed(2);
              self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
              self.handleRecentBetters(player);
              self.updateLastSeen(player);
              self.disnode.bot.SendEmbed(command.msg.channel, {
                color: 1433628,
                author: {},
                fields: [ {
                  name: ':slot_machine: ' + player.name + ' Slots Result :slot_machine:',
                  inline: false,
                  value: "| " + slotInfo.fake1 + slotInfo.fake2 + slotInfo.fake3 + " |\n**>**" + slotInfo.reel1 + slotInfo.reel2 + slotInfo.reel3 +"**<** Pay Line\n| " + slotInfo.fake4 + slotInfo.fake5 + slotInfo.fake6 + " |\n\n" + slotInfo.winText,
                }, {
                  name: 'Bet',
                  inline: true,
                  value: "$" + numeral(bet).format('0,0.00'),
                }, {
                  name: 'Winnings',
                  inline: true,
                  value: "$" + numeral(slotInfo.winAmount).format('0,0.00'),
                }, {
                  name: 'Net Gain',
                  inline: true,
                  value: "$" + numeral(slotInfo.winAmount - bet).format('0,0.00'),
                }, {
                  name: 'Balance',
                  inline: true,
                  value: "$" + numeral(player.money).format('0,0.00'),
                }, {
                  name: 'Keys',
                  inline: true,
                  value: player.keys
                }, {
                  name: 'XP',
                  inline: true,
                  value: player.xp,
                }, {
                  name: 'Minimum JACKPOT bet',
                  inline: true,
                  value: "$" + numeral(minJackpotBet).format('0,0.00'),
                }, {
                  name: 'JACKPOT Value',
                  inline: true,
                  value: "$" + numeral(self.casinoObj.jackpotValue).format('0,0.00'),
                }],
                  footer: {}
                }
              );
              var currentDate = new Date();
              var hour = currentDate.getHours();
              hour = (hour < 10 ? "0" : "") + hour;
              var min  = currentDate.getMinutes();
              min = (min < 10 ? "0" : "") + min;
              var sec  = currentDate.getSeconds();
              sec = (sec < 10 ? "0" : "") + sec;
              player.lastMessage = {
                hour: parseInt(hour),
                min: parseInt(min),
                sec: parseInt(sec),
              }
              self.disnode.DB.Update("players", {"id":player.id}, player);
              self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
            }else {
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Please use a Number for bet or `!casino slot` for general help", 16772880)
            }
          }
      }
    })
  }
  commandCoinFlip(command){
      var self = this;
      self.getPlayer(command).then(function(player) {
        if(self.checkBan(player, command))return;
        if(player.lv < 5){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must be Level 5 to Play Coin Flip!", 16772880);
          return;
        }
        var flipinfo = {
          flip: self.getRandomIntInclusive(0,1),
          winText: "",
          winAmount: 0,
          playerPick: 0,
          tag: ""
        }
        if(command.params[0] == "heads"){
          flipinfo.playerPick = 0;
          flipinfo.tag = "Heads";
          flipinfo.ltag = "Tails";
        }else if (command.params[0] == "tails") {
          flipinfo.playerPick = 1;
          flipinfo.tag = "Tails";
          flipinfo.ltag = "Heads";
        }else {
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Coin Flip", "Welcome to Coin Flip! You can play by using this command `!casino flip [heads/tails] [bet]` Examples `!casino flip heads 100` and `!casino flip tails 100`", 1433628);
          return;
        }if(command.params[1]){
          if(command.params[1].toLowerCase() == "allin"){
            command.params[1] = player.money;
          }
        }
        if(numeral(command.params[1]).value() >= 1){
          var bet;
          var bet = numeral(command.params[1]).value();
          var timeoutInfo = self.checkTimeout(player, 5);
          if(player.Admin || player.Premium)timeoutInfo = self.checkTimeout(player, 2);
          if(!timeoutInfo.pass){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", 16772880);
            return;
          }
          if(bet > player.money){// Checks to see if player has enough money for their bet
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), 16772880);
            return;
          }else{
            player.money -= bet;
            player.money = Number(parseFloat(player.money).toFixed(2));
          }
          player.stats.coinPlays++;
          if(flipinfo.flip == flipinfo.playerPick){
            player.stats.coinWins++;
            if(flipinfo.playerPick == 0){
              player.stats.coinHeads++;
            }else player.stats.coinTails++;
            flipinfo.winText = flipinfo.tag + " You Win!"
            flipinfo.winAmount = Number(parseFloat(bet * 1.75).toFixed(2));
            player.stats.moneyWon += Number(parseFloat(flipinfo.winAmount).toFixed(2));
            player.stats.moneyWon = Number(parseFloat(player.stats.moneyWon).toFixed(2));
            player.money += Number(parseFloat(flipinfo.winAmount).toFixed(2));
            player.money = Number(parseFloat(player.money).toFixed(2));
            if(bet >= 250){
              player.xp += 5;
            }else {
              flipinfo.winText += " `You bet lower than $250 fair warning here, you wont get any XP`"
            }
            logger.Info("Casino", "CoinFlip", "Player: " + player.name + " Has Won Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
            self.updateLastSeen(player);
            self.disnode.bot.SendEmbed(command.msg.channel, {
              color: 1433628,
              author: {},
              fields: [ {
                name: ':moneybag: Coin Flip :moneybag:',
                inline: false,
                value: flipinfo.winText,
              }, {
                name: 'Bet',
                inline: true,
                value: "$" + numeral(bet).format('0,0.00'),
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + numeral(flipinfo.winAmount).format('0,0.00'),
              }, {
                name: 'Net Gain',
                inline: true,
                value: "$" + numeral(flipinfo.winAmount - bet).format('0,0.00'),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'XP',
                inline: true,
                value: player.xp,
              }],
                footer: {}
              }
            );
            var currentDate = new Date();
            var hour = currentDate.getHours();
            hour = (hour < 10 ? "0" : "") + hour;
            var min  = currentDate.getMinutes();
            min = (min < 10 ? "0" : "") + min;
            var sec  = currentDate.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;
            player.lastMessage = {
              hour: parseInt(hour),
              min: parseInt(min),
              sec: parseInt(sec),
            }
            self.disnode.DB.Update("players", {"id":player.id}, player);
            self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
          }else {
            flipinfo.winText = flipinfo.ltag + " House Wins!";
            if(bet >= 250){}else {
              flipinfo.winText += " `You bet lower than $250 fair warning here, you wont get any XP`"
            }
            if(flipinfo.playerPick == 0){
              player.stats.coinTails++;
            }else player.stats.coinHeads++;
            logger.Info("Casino", "CoinFlip", "Player: " + player.name + " Has Lost Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
            self.updateLastSeen(player);
            self.disnode.bot.SendEmbed(command.msg.channel, {
              color: 3447003,
              author: {},
              fields: [ {
                name: ':moneybag: Coin Flip :moneybag:',
                inline: false,
                value: flipinfo.winText,
              }, {
                name: 'Bet',
                inline: true,
                value: "$" + numeral(bet).format('0,0.00'),
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + numeral(flipinfo.winAmount).format('0,0.00'),
              }, {
                name: 'Net Gain',
                inline: true,
                value: "$" + numeral(flipinfo.winAmount - bet).format('0,0.00'),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'XP',
                inline: true,
                value: player.xp,
              }],
                footer: {}
              }
            );
            var currentDate = new Date();
            var hour = currentDate.getHours();
            hour = (hour < 10 ? "0" : "") + hour;
            var min  = currentDate.getMinutes();
            min = (min < 10 ? "0" : "") + min;
            var sec  = currentDate.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;
            player.lastMessage = {
              hour: parseInt(hour),
              min: parseInt(min),
              sec: parseInt(sec),
            }
            self.updateLastSeen(player);
          }
          self.disnode.DB.Update("players", {"id":player.id}, player);
          self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
          }else {
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Please enter a bet! Example `!casino flip tails 100`", 16772880);
        }
      });
  }
  commandRecentBetters(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      var msg = "Name // Last Time Played\n";
      for (var i = 0; i < self.recentBetters.length; i++) {
        msg += (i+1) + ". **" + self.recentBetters[i].name + "** -=- `" + self.recentBetters[i].time + "`\n";
      }
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Recent Betters -=- Current Time: " + self.getDateTime(), msg);
    });
  }
  commandStore(command){

  }
  didWin(slot){
    var self = this;
    if(slot.player.money > 8500){
      var minJackpotBet = (slot.player.money * 0.03);
    }else var minJackpotBet = 250;
    minJackpotBet = parseFloat(minJackpotBet.toFixed(2));
    slot.player.stats.slotPlays++;
    if((slot.reel1 == ":100:") && (slot.reel2 == ":100:") && (slot.reel3 == ":100:")){
      if(slot.bet < minJackpotBet){
        slot.winAmount = parseFloat((slot.bet * 60).toFixed(2));
        slot.winText = "YOU GOT A JACKPOT! however you didnt meet the minimum bet requirement ($" + minJackpotBet + ") to get the JACKPOT value so here is 60x your bet";
      }else {
        slot.winAmount = parseFloat(self.casinoObj.jackpotValue);
        self.casinoObj.jackpotValue = 1000000;
        slot.winText = "JACKPOT JACKPOT JACKPOT!!!!!";
        self.casinoObj.jackpotstat.lastWon = slot.player.name;
        if(slot.winAmount > self.casinoObj.jackpotstat.HighestWin){
          self.casinoObj.jackpotstat.HighestWin = slot.winAmount;
          self.casinoObj.jackpotstat.HighestBy = slot.player.name;
        }
      }
      slot.player.stats.slotJackpots++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 1000;
      return;
    }
    if((slot.reel1 == ":first_place:") && (slot.reel2 == ":first_place:") && (slot.reel3 == ":first_place:")){
      slot.winAmount = parseFloat((slot.bet * 16).toFixed(2));
      slot.winText = "WINNER WINNER HUUUUGE MONEY!";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slot1s++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 250){
        slot.player.xp += 80;
      }else {
        slot.winText += " `You bet lower than $250 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":second_place:") && (slot.reel2 == ":second_place:") && (slot.reel3 == ":second_place:")){
      slot.winAmount = parseFloat((slot.bet * 8).toFixed(2));
      slot.winText = "WINNER WINNER BIG MONEY!";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slot2s++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 250){
        slot.player.xp += 40;
      }else {
        slot.winText += " `You bet lower than $250 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":third_place:") && (slot.reel2 == ":third_place:") && (slot.reel3 == ":third_place:")){
      slot.winAmount = parseFloat((slot.bet * 4).toFixed(2));
      slot.winText = "WINNER!";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slot3s++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 250){
        slot.player.xp += 20;
      }else {
        slot.winText += " `You bet lower than $250 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":cherries:") && (slot.reel2 == ":cherries:") && (slot.reel3 == ":cherries:")){
      slot.winAmount = parseFloat((slot.bet * 2).toFixed(2));
      slot.winText = "Winner";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slotTripleC++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 250){
        slot.player.xp += 10;
      }else {
        slot.winText += " `You bet lower than $250 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":key:") && (slot.reel2 == ":key:") && (slot.reel3 == ":key:")){
      if(slot.bet < minJackpotBet){
        slot.winText = "Hey There are some keys here but they are rusted! You didnt put enough money as your bet to restore the keys. oh well... ";
        return;
      }
      slot.winText = "WOW! Thats a lot of keys!";
      slot.player.keys += 3;
      return;
    }
    if((slot.reel1 == ":key:") || (slot.reel2 == ":key:") || (slot.reel3 == ":key:")){
      if(slot.bet < minJackpotBet){
        slot.winText = "Hey There are some keys here but they are rusted! You didnt put enough money as your bet to restore the keys. oh well... ";
        return;
      }else {
        slot.winText = "Hey! a Key! These could be useful later on... ";
        slot.player.keys++;
      }
    }
    if((slot.reel1 == ":cherries:") || (slot.reel2 == ":cherries:") || (slot.reel3 == ":cherries:")){
      slot.winAmount = parseFloat((slot.bet / 2).toFixed(2));
      slot.winText += "Well at least you didn't lose it all...";
      slot.player.stats.slotSingleC++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 250){
        slot.player.xp += 5;
      }else {
        slot.winText += " `You bet lower than $250 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    slot.winAmount = 0;
    slot.winText += "DANG! Better luck next time!";
    if(slot.bet >= 250){
      slot.player.xp += 1;
    }else {
      slot.winText += " `You bet lower than $250 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
    }
  }
  handleRecentBetters(player){
    var self = this;
    var placed = false;
    for (var i = 0; i < self.recentBetters.length; i++) {
      if(self.recentBetters[i].name == player.name){
        self.recentBetters.splice(i,1);
        self.recentBetters.unshift({name: player.name, time: self.getDateTime()});
        placed = true;
        break;
      }
    }
    if(!placed){
      self.recentBetters.unshift({name: player.name, time: self.getDateTime()});
    }
    while(self.recentBetters.length > 10){
      self.recentBetters.splice(10, 1)
    }
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
        self.disnode.DB.Insert("players", newPlayer);
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
  getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return hour + ":" + min + ":" + sec + " :: " + month + "/" + day + "/" + year;
  }
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  checkTimeout(player, seconds){
    var currentDate = new Date();
    var hour = currentDate.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = currentDate.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = currentDate.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    if(player.lastMessage == null){
      player.lastMessage = null;
      return {pass: true};
    }
    var remainingTime = {
      hour: Number(player.lastMessage.hour - hour),
      min: Number(player.lastMessage.min - min),
      sec: Number((player.lastMessage.sec + seconds) - sec)
    }
    if(remainingTime.min < 0 | remainingTime.sec < 0 | remainingTime.hour < 0){
      return {pass: true,  remain: remainingTime};
    }else if((remainingTime.min <= 0) & (remainingTime.sec <= 0)){
      return {pass: true,  remain: remainingTime};
    }else return {pass: false, remain: remainingTime};
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
    self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
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
