const numeral = require('numeral');
const logger = require('disnode-logger');
const Countdown = require('countdownjs');

class CasinoPlugin {
  constructor() {
    var self = this;
    self.casinoObj = {};
    this.wheelItems = [
      {display:":white_circle: :zero:", type: 0},
      {display:":red_circle: :one:", type: 1},
      {display:":red_circle: :two:", type: 1},
      {display:":black_circle: :three:", type: 2},
      {display:":black_circle: :four:", type: 2},
      {display:":red_circle: :five:", type: 1},
      {display:":red_circle: :six:", type: 1},
      {display:":black_circle: :seven:", type: 2},
      {display:":black_circle: :eight:", type: 2},
      {display:":red_circle: :nine:", type: 1},
      {display:":red_circle: :keycap_ten:", type: 1},
      {display:":black_circle: :one: :one:", type: 2},
      {display:":black_circle: :one: :two:", type: 2},
      {display:":red_circle: :one: :three:", type: 1},
      {display:":red_circle: :one: :four:", type: 1},
      {display:":black_circle: :one: :five:", type: 2},
      {display:":black_circle: :one: :six:", type: 2},
      {display:":red_circle: :one: :seven:", type: 1},
      {display:":red_circle: :one: :eight:", type: 1},
      {display:":black_circle: :one: :nine:", type: 2},
      {display:":black_circle: :two: :zero:", type: 2},
      {display:":red_circle: :two: :one:", type: 1},
      {display:":red_circle: :two: :two:", type: 1},
      {display:":black_circle: :two: :three:", type: 2},
      {display:":black_circle: :two: :four:", type: 2},
      {display:":red_circle: :two: :five:", type: 1},
      {display:":red_circle: :two: :six:", type: 1},
      {display:":black_circle: :two: :seven:", type: 2},
      {display:":black_circle: :two: :eight:", type: 2},
      {display:":red_circle: :two: :nine:", type: 1},
      {display:":red_circle: :three: :zero:", type: 1},
      {display:":black_circle: :three: :one:", type: 2},
      {display:":black_circle: :three: :two:", type: 2},
      {display:":red_circle: :three: :three:", type: 1},
      {display:":red_circle: :three: :four:", type: 1},
      {display:":black_circle: :three: :five:", type: 2},
      {display:":black_circle: :three: :six:", type: 2}
    ]
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
      {cost: 200, type:0, amount: 1000, item: "Instant $1,000"},
      {cost: 100, type:1, amount: 50, item: "Add $50 to your income"},
      {cost: 1000000, type:2, amount: 50, item: "Get 50XP"},
    ]
    this.cratesys = {
      crates: [
        {
          name: "Basic",
          cost: 1,
          items: [
            {item:"$10,000", type: 0, amount: 10000},
            {item:"$25,000", type: 0, amount: 25000},
            {item:"$50,000", type: 0, amount: 50000},
            {item:"50XP", type: 1, amount: 50},
            {item:"100XP", type: 1, amount: 100},
            {item:"150XP", type: 1, amount: 150}
          ]
        },
        {
          name: "Good",
          cost: 5,
          items: [
            {item:"$50,000", type: 0, amount: 50000},
            {item:"$75,000", type: 0, amount: 75000},
            {item:"$100,000", type: 0, amount: 100000},
            {item:"150XP", type: 1, amount: 150},
            {item:"250XP", type: 1, amount: 250},
            {item:"350XP", type: 1, amount: 350}
          ]
        },
        {
          name: "Great",
          cost: 25,
          items: [
            {item:"$100,000", type: 0, amount: 100000},
            {item:"$150,000", type: 0, amount: 150000},
            {item:"$200,000", type: 0, amount: 200000},
            {item:"1000XP", type: 1, amount: 1000},
            {item:"1500XP", type: 1, amount: 1500},
            {item:"2000XP", type: 1, amount: 2000}
          ]
        },
        {
          name: "Epic",
          cost: 75,
          items: [
            {item:"$150,000", type: 0, amount: 150000},
            {item:"$200,000", type: 0, amount: 200000},
            {item:"$225,000", type: 0, amount: 225000},
            {item:"1500XP", type: 1, amount: 1500},
            {item:"2000XP", type: 1, amount: 2000},
            {item:"2250XP", type: 1, amount: 2250}
          ]
        },
        {
          name: "Ultimate",
          cost: 100,
          items: [
            {item:"$1,000,000", type: 0, amount: 1000000},
            {item:"10000XP", type: 1, amount: 10000},
            {item:"1 Income", type: 2},
          ]
        },
        {
          name: "Omega",
          cost: 200,
          items: [
            {item:"$1,500,000", type: 0, amount: 1500000},
            {item:"15000XP", type: 1, amount: 15000},
            {item:"2 Income", type: 3}
          ]
        }
      ]
    }
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
  default(command) {
    var self = this;
    console.log("IM RUNNINNG!");
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
          value: "Hello, " + player.name + "!\nCasino Bot is A Discord bot that allows users to play Casino Games on Discord **FOR AMUSEMENT ONLY**",
        },{
          name: 'Commands:',
          inline: true,
          value: msg,
        }, {
          name: 'Discord Server',
          inline: false,
          value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
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
      self.getPlayer(command).then(function(player) {
        if(self.checkBan(player, command))return;
        if(player.Admin || player.Mod){}else {
          if(!self.doChannelCheck(command)){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
            return;
          }
        }
        self.findPlayer(command.params[0]).then(function(res) {
          if(res.found){
            self.disnode.bot.SendEmbed(command.msg.channel, {
              color: 1433628,
              author: {},
              title: res.p.name + " Balance",
              fields: [ {
                name: 'Money',
                inline: true,
                value: "$" + numeral(res.p.money).format('0,0.00'),
              }, {
                name: 'Income / Max Income',
                inline: true,
                value: "$" + numeral(res.p.income).format('0,0.00') + " / " + numeral(res.p.maxIncome).format('0a'),
              }, {
                name: 'XP / Next Level',
                inline: true,
                value: res.p.xp + " / " + (res.p.lv * 250),
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
        });
      });
    }else {
      self.getPlayer(command).then(function(player) {
        if(self.checkBan(player, command))return;
        if(player.Admin || player.Mod){}else {
          if(!self.doChannelCheck(command)){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
            return;
          }
        }
        self.disnode.bot.SendEmbed(command.msg.channel,
          {
            color: 1433628,
            author: {},
            title: player.name + " Balance",
            fields: [ {
              name: 'Money',
              inline: true,
              value: "$" + numeral(player.money).format('0,0.00'),
            }, {
              name: 'Income / Max Income',
              inline: true,
              value: "$" + numeral(player.income).format('0,0.00') + " / " + numeral(player.maxIncome).format('0a'),
            }, {
              name: 'XP / Next Level',
              inline: true,
              value: player.xp + " / " + (player.lv * 1000),
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
  commandTimer(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      var msleft = self.timer.getRemainingTime();
      var minRemain = Math.floor(msleft / 60000);
      var secondsRemain = ((msleft / 1000) - (minRemain * 60));
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Timer / Time until next Income", minRemain + " Minutes and " + secondsRemain + " Seconds.");
    });
  }
  commandJackpotInfo(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
        if(self.checkBan(player, command))return;
        if(player.Admin || player.Mod){}else {
          if(!self.doChannelCheck(command)){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
            return;
          }
        }
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
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
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
            if(player.Premium)timeoutInfo = self.checkTimeout(player, 2);
            if(player.Admin)timeoutInfo = self.checkTimeout(player, 0);
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
              self.checkLV(player, command.msg.channel);
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
              self.updatePlayerLastMessage(player);
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
        if(player.Admin || player.Mod){}else {
          if(!self.doChannelCheck(command)){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
            return;
          }
        }
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
          if(player.Premium)timeoutInfo = self.checkTimeout(player, 2);
          if(player.Admin)timeoutInfo = self.checkTimeout(player, 0);
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
            self.updatePlayerLastMessage(player);
            self.updateLastSeen(player);
            self.checkLV(player, command.msg.channel);
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
            self.updatePlayerLastMessage(player);
            self.updateLastSeen(player);
            self.checkLV(player, command.msg.channel);
          }
          self.disnode.DB.Update("players", {"id":player.id}, player);
          self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
        }else {
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Please enter a bet! Example `!casino flip tails 100`", 16772880);
        }
      });
  }
  commandWheel(command){
    var self = this;
    var wheelInfo;
    var winspots = [];
    var whatcontains = {
      has1st: false,
      has2nd: false,
      has3rd: false
    }
    var invalidbets = [];
    var timeoutInfo;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      switch (command.params[0]) {
        case "spin":
          if(player.lv < 5){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must be Level 5 to Play The Wheel!", 16772880);
            return;
          }
          if(command.params[1] == "allin"){
            var bet = numeral(player.money).value();
          }else {
            var bet = numeral(command.params[1]).value();
          }
          if(bet > 0){
          var timeoutInfo = self.checkTimeout(player, 5);
          if(player.Premium)timeoutInfo = self.checkTimeout(player, 2);
          if(player.Admin)timeoutInfo = self.checkTimeout(player, 0);
            if(!timeoutInfo.pass){
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", 16772880);
              return;
            }
            if(command.params.length > 7){
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You can only put a maximum of 5 Bet Types!", 16772880);
            }
            for (var i = 2; i < command.params.length; i++) {
              if(command.params[i] == undefined)break;
              if(self.checkValidWheel(command.params[i])){
                if(command.params[i].toLowerCase() == "1st"){
                  whatcontains.has1st = true;
                }
                if(command.params[i].toLowerCase() == "2nd"){
                  whatcontains.has2nd = true;
                }
                if(command.params[i].toLowerCase() == "3rd"){
                  whatcontains.has3rd = true;
                }
                winspots.push(command.params[i].toLowerCase());
              }else {
                invalidbets.push(command.params[i]);
              }
            }
            if(winspots.length == 0){
              if(invalidbets.length > 0){
                var msg = "";
                for (var i = 0; i < invalidbets.length; i++) {
                  msg += invalidbets[i] + " ";
                }
                self.disnode.bot.SendCompactEmbed(command.msg.channel,"Error", ":warning: Please Enter valid bet types! Invalid: " + msg, 16772880);
                return;
              }else {
                self.disnode.bot.SendCompactEmbed(command.msg.channel,"Error", ":warning: Please Enter valid bet types!", 16772880);
                return;
              }
            }
            if(bet > player.money){// Checks to see if player has enough money for their bet
              self.disnode.bot.SendCompactEmbed(command.msg.channel,"Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), 16772880);
              return;
            }else{
              player.money -= bet;
              player.money = numeral(player.money).value();
            }
            var wheelInfo = {
              bet: bet,
              betperspot: (bet / winspots.length),
              player: player,
              winAmount: 0,
              xpAward: 0,
              wheelNumber: self.getRandomIntInclusive(0,(self.wheelItems.length - 1)),
              winspots: winspots,
              ball: 0,
              whatcontains: whatcontains
            }
            wheelInfo.ball = self.wheelItems[wheelInfo.wheelNumber];
            self.calculateWheelWins(wheelInfo);
            player.stats.wheelPlays++;
            if(wheelInfo.winAmount > 0)player.stats.wheelWins++;
            player.money += wheelInfo.winAmount;
            player.xp += wheelInfo.xpAward;
            logger.Info("Casino", "Wheel", "Wheel Player: " + player.name + " bet: " + bet + " Win: " + wheelInfo.winAmount);
          }else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Please use a number for your bet!", 16772880);
            return;
          }
          self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 1433628,
            author: {},
            fields: [ {
              name: ':money_with_wings: The Wheel :money_with_wings:',
              inline: false,
              value: wheelInfo.ball.display,
            }, {
              name: 'Bet',
              inline: true,
              value: "$" + numeral(bet).format('0,0.00'),
            }, {
              name: 'bet per Type',
              inline: false,
              value: "$" + numeral(wheelInfo.betperspot).format('0,0.00'),
            }, {
              name: 'Winnings',
              inline: true,
              value: "$" + numeral(wheelInfo.winAmount).format('0,0.00'),
            }, {
              name: 'Net Gain',
              inline: true,
              value: "$" + numeral(wheelInfo.winAmount - bet).format('0,0.00'),
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
          self.updatePlayerLastMessage(player);
          self.updateLastSeen(player);
          self.checkLV(player, command.msg.channel);
          self.disnode.DB.Update("players", {"id":player.id}, player);
          self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
          break;
        case "info":
          self.disnode.bot.SendEmbed(command.msg.channel, {
              color: 3447003,
              author: {},
              fields: [ {
                name: ':money_with_wings: The Wheel :money_with_wings:',
                inline: false,
                value: "The Wheel acts much like Roulette however it has a differeing rule set to Roulette.",
              }, {
                name: 'Playing The Wheel',
                inline: false,
                value: "You can play the wheel by typing in `!casino wheel spin [bet] [betType] [betType] ...` EXAMPLE: `!casino wheel spin 100 black`",
              }, {
                name: 'Bet Types',
                inline: true,
                value: "As shown bet types can be one of the following: `[black,red,(0-36),even,odd,1st,2nd,3rd,low,high]`\n`Black / Red` Number must match color to win.\n`Even / Odd` Win if the number is even or odd depending on what you choose\n`1st / 2nd / 3rd` 1st is numbers 1-12, 2nd is numbers 13-24, 3rd is numbers 25-36\n`Low / High` Low is 1-18, and High is 19-36",
              }, {
                name: 'Winnings',
                inline: true,
                value: "0 - 37x\nany other number - 36x\n1st/2nd/3rd 3x\nEven/odd/black/red/low/high 2x",
              }, {
                name: 'Numbers',
                inline: true,
                value: ":white_circle: # ~ 0\n:red_circle: # ~ 1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30, 33, 34\n:black_circle:  # ~ 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 36,"
              }],
              footer: {}
            }
          );
          break;
        default:
          self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 3447003,
            author: {},
            fields: [ {
              name: "The Wheel (Roulette)",
              inline: false,
              value: "Welcome to The Wheel! You can play by using this command `!casino wheel spin [bet] [betType]` Examples `!casino wheel spin 100 black`\nFor more info on what win types are and how the game is payed out use `!casino wheel info`",
            }],
              footer: {}
            }
          );
          break;
      }
    });
  }
  commandRecentBetters(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      var msg = "Name // Last Time Played\n";
      for (var i = 0; i < self.recentBetters.length; i++) {
        msg += (i+1) + ". **" + self.recentBetters[i].name + "** -=- `" + self.recentBetters[i].time + "`\n";
      }
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Recent Betters -=- Current Time: " + self.getDateTime(), msg);
    });
  }
  commandTop(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      self.disnode.DB.Find("players", {}).then(function(players) {
        var orderTop = [];
        for (var i = 0; i < players.length; i++) {
          var placed = false;
          for (var x = 0; x < orderTop.length; x++) {
            if(players[i].money > orderTop[x].money){
              orderTop.splice(x, 0, players[i]);
              placed = true;
              break;
            }
          }
          if(!placed){
            orderTop.push(players[i]);
          }
        }
        var page = 1;
        var maxindex;
        var startindex;
        if (parseInt(command.params[0]) >= 1) {
          page = Number(parseInt(command.params[0]));
        }
        if (page == 1) {
          page = 1;
          startindex = 0
          maxindex = 10;
        }else {
          maxindex = (page * 10);
          startindex = maxindex - 10;
        }

        var msg = "**Page:** " + page + "\n";
        for (var i = startindex; i < orderTop.length; i++) {
          if(i == maxindex)break;
          msg += "" + (i + 1) + ". **" + orderTop[i].name + "** -=- $" + numeral(orderTop[i].money).format('0,0.00') + "\n";
        }
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Wealthiest Players", msg);
      });
    });
  }
  commandCrate(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      switch (command.params[0]) {
        case "open":
        var timeoutInfo = self.checkTimeout(player, 5);
        if(player.Premium)timeoutInfo = self.checkTimeout(player, 2);
        if(player.Admin)timeoutInfo = self.checkTimeout(player, 0);
          if(!timeoutInfo.pass){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", 16772880);
            return;
          }
          var CrateID = numeral(command.params[1]).value();
          if(CrateID >= 0 && CrateID < self.cratesys.crates.length){
            var Crate = self.cratesys.crates[CrateID];
            if(Crate == undefined){
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "The ID that you entered is not valid!", 16772880);
              return;
            }
            if(player.keys >= Crate.cost){
              player.keys -= Crate.cost;
              var Item = Crate.items[self.getRandomIntInclusive(0, (Crate.items.length - 1))];
              switch (Item.type) {
                case 0:
                  player.money += Item.amount;
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", "You Opened the **" + Crate.name + "** Crate and got: **" + Item.item + "**", 3447003);
                  break;
                case 1:
                  player.xp += Item.amount;
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", "You Opened the **" + Crate.name + "** Crate and got: **" + Item.item + "**", 3447003);
                  break;
                case 2:
                  player.money += player.income;
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", "You Opened the **" + Crate.name + "** Crate and got: **" + Item.item + "**", 3447003);
                  break;
                case 3:
                  player.money += (player.income * 2);
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", "You Opened the **" + Crate.name + "** Crate and got: **" + Item.item + "**", 3447003);
                  break;
              }
              self.updatePlayerLastMessage(player);
              self.updateLastSeen(player);
              self.checkLV(player, command.msg.channel);
              self.disnode.DB.Update("players", {"id":player.id}, player);
              self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
            }else {
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You Dont have enough Keys!\nNEED: " + Crate.cost + "\nHAVE: " + player.keys, 16772880);
            }
          }else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "The ID that you entered is not valid!", 16772880);
          }
          break;
        default:
        var crates = "";
        for (var i = 0; i < self.cratesys.crates.length; i++) {
          crates += " --= ID: **" + i + "** Name: **" + self.cratesys.crates[i].name + "** / **" + self.cratesys.crates[i].cost + "** Keys \n";
          for (var l = 0; l < self.cratesys.crates[i].items.length; l++) {
            crates += " # **" + self.cratesys.crates[i].items[l].item + "**\n";
          }
        }
        self.disnode.bot.SendEmbed(command.msg.channel, {
          color: 3447003,
          author: {},
          fields: [ {
            name: 'Crate System',
            inline: true,
            value: "Crates are boosts to help you keep going! Use keys that you find in the Slots to open Crates.\nUse `!casino crate open ID` to open a crate!",
          },{
            name: 'Crates',
            inline: false,
            value: crates
          }],
            footer: {}
          }
        );
      }
    });
  }
  commandStats(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      if(command.params[0]){
        self.findPlayer(command.params[0]).then(function(res) {
          if(res.found){
            self.disnode.DB.Find("players", {}).then(function(players) {
              var orderTop = []
              for (var i = 0; i < players.length; i++) {
                var placed = false;
                for (var x = 0; x < orderTop.length; x++) {
                  if(players[i].money > orderTop[x].money){
                    orderTop.splice(x, 0, players[i]);
                    placed = true;
                    break;
                  }
                }
                if(!placed){
                  orderTop.push(players[i]);
                }
              }
              for (var i = 0; i < orderTop.length; i++) {
                if(res.p.id == orderTop[i].id){
                  var placement = "**Rank**: " + (i+1) + " **out of** " + (orderTop.length);
                  break;
                }
              }
              var slotstats = "**Slot -=- Wins / Plays**:\t  " + res.p.stats.slotWins + " / " + res.p.stats.slotPlays + "\n" +
              "**Slot Wins**:\n " +
              ":cherries: **Single cherries**: " + res.p.stats.slotSingleC + "\n" +
              ":cherries: :cherries: :cherries: **Triple cherries**: " + res.p.stats.slotTripleC + "\n" +
              ":third_place: :third_place: :third_place: **Triple 3\'s**: " + res.p.stats.slot3s + "\n" +
              ":second_place: :second_place: :second_place: **Triple 2\'s**: " + res.p.stats.slot2s + "\n" +
              ":first_place: :first_place: :first_place: **Triple 1\'s**: " + res.p.stats.slot1s + "\n" +
              ":100: :100: :100: **JACKPOTS**: " + res.p.stats.slotJackpots + "\n\n";
              var coinstats = "**Coin Flip -=- Wins / Plays**:\t  " + res.p.stats.coinWins + " / " + res.p.stats.coinPlays + "\n\n" +
                "**Coin Landed on Heads**: " + res.p.stats.coinHeads + "\n" +
                "**Coin Landed on Tails**: " + res.p.stats.coinTails;
              var wheelStats = "**The Wheel -=- Plays / Wins**:\t" + res.p.stats.wheelPlays + " / " +  + res.p.stats.wheelWins + "\n\n" +
                "**General Wheel Stats -=- Won with / Landed On**\n" +
                "**0**: " + res.p.stats.wheel0 + " / " + res.p.stats.wheelLanded0 + "\n" +
                "**Number other than 0**: " + res.p.stats.wheelNumber + " / " + res.p.stats.wheelLandedNumber + "\n" +
                "**1st, 2nd, 3rd**: " + res.p.stats.wheelsections + " / " + res.p.stats.wheelLandedsections + "\n" +
                "**High, Low**: " + res.p.stats.wheellowhigh + " / " + res.p.stats.wheelLandedlowhigh + "\n" +
                "**Even, Odd**: " + res.p.stats.wheelevenodd + " / " + res.p.stats.wheelLandedevenodd + "\n" +
                "**Red, Black**: " + res.p.stats.wheelcolor + " / " + res.p.stats.wheelLandedcolor;
              self.disnode.bot.SendEmbed(command.msg.channel,{
                color: 1433628,
                author: {},
                fields: [ {
                  name: "Stats",
                  inline: false,
                  value: placement,
                }, {
                  name: 'Slots',
                  inline: true,
                  value: slotstats,
                }, {
                  name: 'Wheel',
                  inline: true,
                  value: wheelStats,
                }, {
                  name: 'Coin Flip',
                  inline: true,
                  value: coinstats,
                }],
                  footer: {}
                }
              );
            });
          }else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!\n\n" + res.msg, 16772880);
          }
        })
      }else {
        self.disnode.DB.Find("players", {}).then(function(players) {
          var orderTop = []
          for (var i = 0; i < players.length; i++) {
            var placed = false;
            for (var x = 0; x < orderTop.length; x++) {
              if(players[i].money > orderTop[x].money){
                orderTop.splice(x, 0, players[i]);
                placed = true;
                break;
              }
            }
            if(!placed){
              orderTop.push(players[i]);
            }
          }
          for (var i = 0; i < orderTop.length; i++) {
            if(player.id == orderTop[i].id){
              var placement = "**Rank**: " + (i+1) + " **out of** " + (orderTop.length);
              break;
            }
          }
          var slotstats = "**Slot -=- Wins / Plays**:\t  " + player.stats.slotWins + " / " + player.stats.slotPlays + "\n" +
          "**Slot Wins**:\n " +
          ":cherries: **Single cherries**: " + player.stats.slotSingleC + "\n" +
          ":cherries: :cherries: :cherries: **Triple cherries**: " + player.stats.slotTripleC + "\n" +
          ":third_place: :third_place: :third_place: **Triple 3\'s**: " + player.stats.slot3s + "\n" +
          ":second_place: :second_place: :second_place: **Triple 2\'s**: " + player.stats.slot2s + "\n" +
          ":first_place: :first_place: :first_place: **Triple 1\'s**: " + player.stats.slot1s + "\n" +
          ":100: :100: :100: **JACKPOTS**: " + player.stats.slotJackpots + "\n\n";
          var coinstats = "**Coin Flip -=- Wins / Plays**:\t  " + player.stats.coinWins + " / " + player.stats.coinPlays + "\n\n" +
            "**Coin Landed on Heads**: " + player.stats.coinHeads + "\n" +
            "**Coin Landed on Tails**: " + player.stats.coinTails;
            var wheelStats = "**The Wheel -=- Plays / Wins**:\t" + player.stats.wheelPlays + " / " +  + player.stats.wheelWins + "\n\n" +
              "**General Wheel Stats -=- Won with / Landed On**\n" +
              "**0**: " + player.stats.wheel0 + " / " + player.stats.wheelLanded0 + "\n" +
              "**Number other than 0**: " + player.stats.wheelNumber + " / " + player.stats.wheelLandedNumber + "\n" +
              "**1st, 2nd, 3rd**: " + player.stats.wheelsections + " / " + player.stats.wheelLandedsections + "\n" +
              "**High, Low**: " + player.stats.wheellowhigh + " / " + player.stats.wheelLandedlowhigh + "\n" +
              "**Even, Odd**: " + player.stats.wheelevenodd + " / " + player.stats.wheelLandedevenodd + "\n" +
              "**Red, Black**: " + player.stats.wheelcolor + " / " + player.stats.wheelLandedcolor;
          self.disnode.bot.SendEmbed(command.msg.channel,{
            color: 1433628,
            author: {},
            fields: [ {
              name: "Stats",
              inline: false,
              value: placement,
            }, {
              name: 'Slots',
              inline: true,
              value: slotstats,
            }, {
              name: 'Wheel',
              inline: true,
              value: wheelStats,
            }, {
              name: 'Coin Flip',
              inline: true,
              value: coinstats,
            }],
              footer: {}
            }
          );
        });
      }
    });
  }
  commandAdmin(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin == undefined)player.Admin = false;
      if(!player.Admin){
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: YOU SHALL NOT PASS! (**You are not a Bot admin**)", 16772880);
      }else {
        switch (command.params[0]) {
          case "reset":
            if(data.params[1]){
              self.findPlayer(command.params[1]).then(function(res) {
                if(res.found){
                  res.p.money = 10000;
                  res.p.income = 1000;
                  res.p.xp = 0;
                  res.p.keys = 0;
                  res.p.lv = 0;
                  res.p.maxIncome = 1000;
                  self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Action Complete", ":white_check_mark: Player: " + players.name + "Is now reset: ", 3447003);
                }else {
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                }
              });
            }
            break;
          case "ban":
            if(data.params[1]){
              self.findPlayer(command.params[1]).then(function(res) {
                if(res.found){
                  if(!res.p.banned){
                    res.p.money = 0;
                    res.p.income = 0;
                    res.p.xp = 0;
                    res.p.keys = 0;
                    res.p.lv = 0;
                    res.p.banned = true;
                    res.p.maxIncome = 1000;
                    if(command.params[2]){
                      res.p.banreason = command.params[2]
                    }else {
                      res.p.banreason = "You have been banned! The admin that banned you didn't provide a reason."
                    }
                    self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                  }else {
                    res.p.money = 10000;
                    res.p.income = 1000;
                    res.p.xp = 0;
                    res.p.keys = 0;
                    res.p.lv = 0;
                    res.p.banned = false;
                      res.p.banreason = "";
                    res.p.maxIncome = 1000;
                    self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                  }
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Action Complete", ":white_check_mark: Player: " + players.name + " Is now reset: ", 3447003);
                }else {
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                }
              });
            }
            break;
          case "save":
            self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", ":white_check_mark: Database Saved!", 3447003);
            break;
          case "player":
            switch (command.params[1]) {
              case "get":
                self.findPlayer(command.params[2]).then(function(res) {
                  if(res.found){
                    self.disnode.bot.SendMessage(command.msg.channel, "```json\n" + JSON.stringify(res.p, false, 2) + "```");
                  }else {
                    self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                  }
                });
                break;
              case "set":
                switch (command.params[2]) {
                  case "money":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = numeral(command.params[4]).value();
                        if(setTo >= 0)res.p.money = setTo;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Money set to: $" + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "income":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = numeral(command.params[4]).value();
                        if(setTo >= 0)res.p.income = setTo;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Income set to: $" + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "xp":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = numeral(command.params[4]).value();
                        if(setTo >= 0)res.p.xp = setTo;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " XP set to: " + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "name":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = data.params[4];
                        var oldname = res.p.name;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", oldname + " Name set to: " + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "lv":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = numeral(command.params[4]).value();
                        if(setTo >= 0)res.p.lv = setTo;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " LV set to: " + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "maxincome":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = numeral(command.params[4]).value();
                        if(setTo >= 0)res.p.maxIncome = setTo;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Max Income set to: $" + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "keys":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        var setTo = numeral(command.params[4]).value();
                        if(setTo >= 0)res.p.key = setTo;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Keys set to: " + setTo, 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "admin":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        if(command.params[4] == "true")res.p.Admin = true;
                        if(command.params[4] == "false")res.p.Admin = false;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Admin set to: " + command.params[4], 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  case "mod":
                    self.findPlayer(command.params[3]).then(function(res) {
                      if(res.found){
                        if(command.params[4] == "true")res.p.Mod = true;
                        if(command.params[4] == "false")res.p.Mod = false;
                        self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Mod set to: " + command.params[4], 3447003);
                      }else {
                        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
                      }
                    });
                    break;
                  default:

                }
                break;
              default:

            }
            break;
          case "prem":
            self.findPlayer(command.params[1]).then(function(res) {
              if(res.found){
                if(command.params[2] == "true"){
                  res.p.Premium = true;
                  res.p.money += 25000;
                  res.p.xp += 2000;
                }else if(command.params[4] == "false"){
                  res.p.Premium = false;
                }
                self.disnode.DB.Update("players", {"id":res.p.id}, res.p);
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Complete", res.p.name + " Premium set to: " + res.p.Premium, 3447003);
              }else {
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
              }
            });
            break;
          case "listprem":
            self.disnode.DB.Find("players", {}).then(function(players) {
              var msg = "";
              for (var i = 0; i < players.length; i++) {
                if(players[i].Premium){
                  msg += players[i].name + "\n";
                }
              }
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Premium Users", msg, 3447003);
            });
            break;
          default:

        }
      }
    });
  }
  commandMod(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Mod == undefined)player.Mod = false;
      if(!player.Mod){
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: YOU SHALL NOT PASS! (**You are not a Bot Moderator**)", 16772880);
      }else {
        switch (command.params[0]) {
          case "cleartimers":
          self.disnode.DB.Find("players", {}).then(function(players) {
            var msg = "";
            for (var i = 0; i < players.length; i++) {
              players[i].lastMessage = null;
              self.disnode.DB.Update("players", {"id":players[i].id}, players[i]);
            }
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Premium Users", ":white_check_mark: Timeouts Cleared!", 3447003);
          });
            break;
          default:

        }
      }
    });
  }
  commandStore(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      switch (command.params[0]) {
        case "list":
          var msg = "**ID**\t//\t**ITEM**\t//\t**COST**\n";
          for (var i = 0; i < self.store.length; i++) {
            var cost;
            if(player.Admin || player.Premium){
              cost = (self.store[i].cost /2)
            }else cost = self.store[i].cost;
            if(self.store[i].type == 2){
              msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t$" + cost + "\n";
            }else {
              msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t" + cost + "XP\n";
            }
          }
          msg += "\n\n**XP:** " + player.xp + "\nStore items are subject to change, please be aware of prices and items PRIOR to making a purchase!";
          var title;
          if(player.Admin || player.Premium){
            title = "Premium Store List";
          }else title = "Store List";
          self.disnode.bot.SendCompactEmbed(command.msg.channel, title, msg);
          break;
        case "buy":
          if(command.params[1] && (command.params[1] >= 0 && command.params[1] <= (self.store.length - 1))){
            var ID = parseInt(command.params[1]);
            var quantity = 0;
            if(command.params[2] == "max"){
              if(player.Admin || player.Premium){
                if(self.store[ID].type == 0 || self.store[ID].type == 2){
                  quantity = Math.floor((player.xp / (self.store[ID].cost / 2)));
                }else {
                  var remainMax = player.maxIncome - player.income;
                  var counter = 0;
                  var cost = (self.store[ID].cost /2);
                  while (true) {
                    if((counter * cost) >= player.xp)break;
                    if((counter * self.store[ID].amount) >= remainMax)break;
                    counter++;
                  }
                  quantity = counter - 1;
                }
              }else {
                if(self.store[ID].type == 0 || self.store[ID].type == 2){
                  quantity = Math.floor((player.xp / (self.store[ID].cost)));
                }else {
                  var remainMax = player.maxIncome - player.income;
                  var counter = 1;
                  var cost = (self.store[ID].cost);
                  while (true) {
                    if((counter * cost) >= player.xp)break;
                    if((counter * self.store[ID].amount) >= remainMax)break;
                    counter++;
                  }
                  quantity = counter - 1;
                }
              }
            }else{
              quantity = numeral(command.params[2]).value();
              if(quantity < 1){
                quantity = 1;
              }
              if(self.store[ID].type == 1){
                var remainMax = player.maxIncome - player.income;
                if(((self.store[ID].amount * quantity)) > remainMax){
                  console.log((self.store[ID].amount * quantity) + " / " + remainMax);
                  self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Such transaction will exceed your Max Income of: $" + numeral(player.maxIncome).format('0,00.00') + "\nLevel up to increase this max.", 16772880);
                  return;
                }
              }
            }
            if(quantity < 1){
              quantity = 1;
            }
            var cost;
            if(player.Admin || player.Premium){
              cost = (self.store[ID].cost /2) * quantity;
            }else cost = self.store[ID].cost * quantity;
            var costString;
            if(self.store[ID].type == 2){
              costString =  "$" + cost;
              if(player.xp < cost){
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You dont have that much Money!\nNeed: $" + cost + "\nYou have: $" + player.money, 16772880);
                return;
              }
            }else {
              costString = cost + " XP"
              if(player.xp < cost){
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You dont have that much XP!\nNeed: " + cost + "XP\nYou have: " + player.xp, 16772880);
                return;
              }
            }
            switch (self.store[ID].type) {
              case 0:
                player.xp -= cost;
                player.money += (self.store[ID].amount * quantity);
                break;
              case 1:
                player.xp -= cost;
                player.income += (self.store[ID].amount * quantity);
                break;
              case 2:
                player.money -= cost;
                player.xp += (self.store[ID].amount * quantity);
                break;
              default:
                break;
            }
            self.disnode.bot.SendEmbed(command.msg.channel, {
              color: 1433628,
              author: {},
              fields: [ {
                name: "Store",
                inline: false,
                value: ":white_check_mark: Your purchase of `" + quantity + "x " + self.store[ID].item + "` was successful! Thank you for your business!",
              }, {
                name: 'Money',
                inline: true,
                value: "$" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'Income / 30min.',
                inline: true,
                value: "$" + numeral(player.income).format('0,0.00'),
              }, {
                name: 'XP',
                inline: true,
                value: player.xp,
              }],
                footer: {}
              }
            );
            self.updateLastSeen(player);
            self.disnode.DB.Update("players", {"id":player.id}, player);
            self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
          }
          break;
        default:
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Store", "Welcome to the store! to see a list of Items use `!casino store list` use the ID of the item when buying for example `!casino store buy 0` if you want to buy more than one of the item use `!casino store buy 0 10` to buy 10, or use `!casino store buy 0 max` to buy as much as you can!");
      }
    });
  }
  commandTransfer(command){
    var self = this;
    self.getPlayer(command).then(function(player) {
      if(self.checkBan(player, command))return;
      if(player.Admin || player.Mod){}else {
        if(!self.doChannelCheck(command)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "Please use <#269839796069859328> or <#296477731883843584>", 16772880);
          return;
        }
      }
      var timeoutInfo = self.checkTimeout(player, 5);
      if(player.Premium)timeoutInfo = self.checkTimeout(player, 2);
      if(player.Admin)timeoutInfo = self.checkTimeout(player, 0);
      if(!timeoutInfo.pass){
        logger.Info("Casino", "Slot", "Player: " + player.name + " Tried the slots before their delay of: " + timeoutInfo.remain.sec);
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", 16772880);
        return;
      }
      if(command.params[0]){
        self.findPlayer(command.params[0]).then(function(res) {
          if(res.found){
            var transferPlayer = res.p;
            var toTransfer = numeral(command.params[1]).value();
            if(transferPlayer.id == player.id){
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You cant transfer to yourself!", 16772880);
              return;
            }
            if(toTransfer > 0){
              if(toTransfer > player.money){
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), 16772880);
                return;
              }else {
                var pbalbef = player.money
                var sbalbef = transferPlayer.money
                player.money -= toTransfer;
                transferPlayer.money += toTransfer
                player.money = Number(parseFloat(player.money).toFixed(2));
                transferPlayer.money = Number(parseFloat(transferPlayer.money).toFixed(2));
                self.disnode.bot.SendEmbed(command.msg.channel, {
                  color: 3447003,
                  author: {},
                  fields: [ {
                    name: 'From',
                    inline: false,
                    value: player.name + "\nBalance Proir: $" + numeral(pbalbef).format('0,0.00') + "\nBalance After: $" + numeral(player.money).format('0,0.00'),
                  }, {
                    name: 'To',
                    inline: false,
                    value: transferPlayer.name + "\nBalance Proir: $" + numeral(sbalbef).format('0,0.00') + "\nBalance After: $" + numeral(transferPlayer.money).format('0,0.00'),
                  }, {
                    name: 'Amount',
                    inline: true,
                    value: "$ " + numeral(toTransfer).format('0,0.00'),
                  }, {
                    name: "Status",
                    inline: false,
                    value: ":white_check_mark: Transfer complete!",
                  }],
                    footer: {}
                  }
                );
                self.disnode.DB.Update("players", {"id":transferPlayer.id}, transferPlayer);
                self.disnode.DB.Update("players", {"id":player.id}, player);
                return;
              }
            }else {
              self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", ":warning: Please enter a number for the transfer amount! example `!casino transfer FireGamer3 100`", 16772880);
            }
          }else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", res.msg, 16772880);
          }
        });
      }
    });
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
        self.casinoObj.jackpotValue = 100000;
        slot.winText = "JACKPOT JACKPOT JACKPOT!!!!!";
        self.casinoObj.jackpotstat.lastWon = slot.player.name;
        self.casinoObj.jackpotstat.LatestWin = slot.winAmount;
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
  updatePlayerLastMessage(player){
    var currentDate = new Date();
    var hour = currentDate.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = currentDate.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = currentDate.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var day  = currentDate.getDate();
    day = (day < 10 ? "0" : "") + day;
    player.lastMessage = {
      day: parseInt(day),
      hour: parseInt(hour),
      min: parseInt(min),
      sec: parseInt(sec),
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
          income: 1000,
          maxIncome: 1000,
          xp: 0,
          lv: 1,
          Premium: false,
          Admin: false,
          Mod: false,
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
            coinTails: 0,
            wheelPlays: 0,
            wheelWins: 0,
            wheel0: 0,
            wheelNumber: 0,
            wheelsections: 0,
            wheellowhigh: 0,
            wheelevenodd: 0,
            wheelcolor: 0,
            wheelLanded0: 0,
            wheelLandedNumber: 0,
            wheelLandedsections: 0,
            wheelLandedlowhigh: 0,
            wheelLandedevenodd: 0,
            wheelLandedcolor: 0
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
    var day  = currentDate.getDate();
    day = (day < 10 ? "0" : "") + day;
    if(player.lastMessage == null){
      player.lastMessage = null;
      return {pass: true};
    }
    var remainingTime = {
      day: Number(player.lastMessage.day - day),
      hour: Number(player.lastMessage.hour - hour),
      min: Number(player.lastMessage.min - min),
      sec: Number((player.lastMessage.sec + seconds) - sec)
    }
    if(remainingTime.day < 0)return {pass: true,  remain: remainingTime};
    if(remainingTime.hour < 0)return {pass: true,  remain: remainingTime};
    if(remainingTime.min < 0)return {pass: true,  remain: remainingTime};
    if((remainingTime.min <= 0) & (remainingTime.sec <= 0)){
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
        color: 16711680,
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
  checkLV(player, channel){
    var self = this;
    var lvup = false;
    while(player.xp >= (player.lv * 1000)){
      player.lv++;
      player.maxIncome = player.maxIncome * 2;
      lvup = true;
    }
    if(lvup)self.disnode.bot.SendCompactEmbed(channel, player.name + " Level Up!", "**You are now a Lv:** " + player.lv + "\n**Your max income has been increased to:** $" + numeral(player.maxIncome).format('0,0.00'), 1433628);
  }
  calculateWheelWins(wheelInfo){
    if(wheelInfo.wheelNumber >= 25 && wheelInfo.wheelNumber <= 36) {//WIN 3rd
      wheelInfo.player.stats.wheelLandedsections++;
    }else if(wheelInfo.wheelNumber >= 13 & wheelInfo.wheelNumber <= 24) {//WIN 2nd
      wheelInfo.player.stats.wheelLandedsections++;
    }else if(wheelInfo.wheelNumber >= 1 & wheelInfo.wheelNumber <= 12) {//WIN 1st
      wheelInfo.player.stats.wheelLandedsections++;
    }
    if((wheelInfo.wheelNumber % 2) != 0) { //WIN Odd
      wheelInfo.player.stats.wheelLandedevenodd++;
    }else if((wheelInfo.wheelNumber % 2) == 0){ //WIN Even
      wheelInfo.player.stats.wheelLandedevenodd++;
    }
    if(wheelInfo.ball.type == 2) {//WIN Black
      wheelInfo.player.stats.wheelLandedcolor++;
    }else if(wheelInfo.ball.type == 1) {//WIN Red
      wheelInfo.player.stats.wheelLandedcolor++;
    }
    if(wheelInfo.wheelNumber >= 1 && wheelInfo.wheelNumber <= 18){//WIN Low
      wheelInfo.player.stats.wheelLandedlowhigh++;
    }else if(wheelInfo.wheelNumber >= 19 && wheelInfo.wheelNumber <= 36){//WIN high
      wheelInfo.player.stats.wheelLandedlowhigh++;
    }
    if(wheelInfo.wheelNumber == 0){//WIN 0
      wheelInfo.player.stats.wheelLanded0++;
    }else {
      wheelInfo.player.stats.wheelLandedNumber++;
    }
    for (var i = 0; i < wheelInfo.winspots.length; i++) {
      if((wheelInfo.wheelNumber % 2) == 0){ //WIN Even
        if(wheelInfo.winspots[i] == "even"){
          if(wheelInfo.wheelNumber != 0){
            wheelInfo.player.stats.wheelevenodd++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 5;
            continue;
          }
        }
      }
      if((wheelInfo.wheelNumber % 2) != 0) { //WIN Odd
        if(wheelInfo.winspots[i] == "odd"){
          if(wheelInfo.wheelNumber != 0){
            wheelInfo.player.stats.wheelevenodd++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 5;
            continue;
          }
        }
      }
      if(wheelInfo.ball.type == 1) {//WIN Red
        if(wheelInfo.winspots[i] == "red"){
          wheelInfo.player.stats.wheelcolor++;
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 5;
          continue;
        }
      }
      if(wheelInfo.ball.type == 2) {//WIN Black
        if(wheelInfo.winspots[i] == "black"){
          wheelInfo.player.stats.wheelcolor++;
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 5;
          continue;
        }
      }
      if(wheelInfo.wheelNumber >= 1 && wheelInfo.wheelNumber <= 18){//WIN Low
        if(wheelInfo.winspots[i] == "low"){
          wheelInfo.player.stats.wheellowhigh++;
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 10;
          continue;
        }
      }
      if(wheelInfo.wheelNumber >= 19 && wheelInfo.wheelNumber <= 36){//WIN high
        if(wheelInfo.winspots[i] == "high"){
          wheelInfo.player.stats.wheellowhigh++;
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 10;
          continue;
        }
      }
      if(wheelInfo.wheelNumber >= 1 & wheelInfo.wheelNumber <= 12) {//WIN 1st
        if(wheelInfo.winspots[i] == "1st"){
          if(wheelInfo.whatcontains.has1st && wheelInfo.whatcontains.has2nd && wheelInfo.whatcontains.has3rd){
            wheelInfo.player.stats.wheelsections++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 25;
            continue;
          }else {
            wheelInfo.player.stats.wheelsections++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 3);
            wheelInfo.xpAward += 25;
            continue;
          }
        }
      }
      if(wheelInfo.wheelNumber >= 13 & wheelInfo.wheelNumber <= 24) {//WIN 2nd
        if(wheelInfo.winspots[i] == "2nd"){
          if(wheelInfo.whatcontains.has1st && wheelInfo.whatcontains.has2nd && wheelInfo.whatcontains.has3rd){
            wheelInfo.player.stats.wheelsections++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 25;
            continue;
          }else {
            wheelInfo.player.stats.wheelsections++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 3);
            wheelInfo.xpAward += 25;
            continue;
          }
        }
      }
      if(wheelInfo.wheelNumber >= 25 && wheelInfo.wheelNumber <= 36) {//WIN 3rd
        if(wheelInfo.winspots[i] == "3rd"){
          if(wheelInfo.whatcontains.has1st && wheelInfo.whatcontains.has2nd && wheelInfo.whatcontains.has3rd){
            wheelInfo.player.stats.wheelsections++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 25;
            continue;
          }else {
            wheelInfo.player.stats.wheelsections++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 3);
            wheelInfo.xpAward += 25;
            continue;
          }
        }
      }
      if(wheelInfo.wheelNumber == 0){//WIN 0
        if(numeral(wheelInfo.winspots[i]).value() == 0){
          wheelInfo.player.stats.wheel0++;
          wheelInfo.winAmount += (wheelInfo.betperspot * 37);
          wheelInfo.xpAward += 100;
          continue;
        }
      }else {//WIN OTHERNUM
        if(wheelInfo.winspots[i] != "1st" && wheelInfo.winspots[i] != "2nd" && wheelInfo.winspots[i] != "3rd"){
          if(numeral(wheelInfo.winspots[i]).value() == wheelInfo.wheelNumber){
            wheelInfo.player.stats.wheelNumber++;
            wheelInfo.winAmount += (wheelInfo.betperspot * 36);
            wheelInfo.xpAward += 75;
            continue;
          }
        }
      }
    }
  }
  checkValidWheel(bet){
    if(bet.toLowerCase() == "black"){return true;}
    if(bet.toLowerCase() == "red"){return true;}
    if(bet.toLowerCase() == "even"){return true;}
    if(bet.toLowerCase() == "odd"){return true;}
    if(bet.toLowerCase() == "low"){return true;}
    if(bet.toLowerCase() == "high"){return true;}
    if(bet.toLowerCase() == "1st"){return true;}
    if(bet.toLowerCase() == "2nd"){return true;}
    if(bet.toLowerCase() == "3rd"){return true;}
    if(bet.toLowerCase() == "0"){return true;}
    if(parseInt(bet) > 0 && parseInt(bet) <= 36 && parseInt(bet) == bet){return true;}
    return false;
  }
  doChannelCheck(command){
    if(command.msg.server == '236338097955143680'){
      if(command.msg.channel == '275395383071342594')return false;
      if(command.msg.channel == '236338097955143680')return false;
      if(command.msg.channel == '269892884688404482')return false;
      if(command.msg.channel == '268049832596340746')return false;
      return true;
    }else return true;
  }
  updateCoroutine(){
    var self = this;
    self.disnode.DB.Find("players", {}).then(function(players) {
      for (var i = 0; i < players.length; i++) {
        if(players[i].lastSeen == undefined){
          self.updateLastSeen(players[i]);
        }
        if(self.canGetIncome(players[i])){
          players[i].money += players[i].income;
        }
        players[i].lastMessage = null;
        self.disnode.DB.Update("players", {"id":players[i].id}, players[i]);
      }
    });
    self.disnode.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
    if(self.timer)self.timer = {};
    self.timer = new Countdown(1800000,function(){});
    self.timer.start();
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
