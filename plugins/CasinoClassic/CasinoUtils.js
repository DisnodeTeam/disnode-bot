const numeral = require('numeral');
const logger = require('disnode-logger');
const Countdown = require('countdownjs');

class CasinoUtils {
  constructor(disnode, classobj) {
    var self = this;
    this.disnode = disnode;
    this.class = classobj;
    this.casinoObj = {};
    this.recentBetters = [];
    this.testingmode = false;
    this.disnode.db.InitPromise({}).then(function(dbo) {
      self.DB = dbo;
      self.DB.Find("casinoObj", {}).then(function(res) {
        self.casinoObj = res[0];
        self.updateCoroutine();
      });
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
    var currentDate = new Date().getTime();
    player.lastMessage = parseInt(currentDate);
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
      self.DB.Find("players", {}).then(function(found) {
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
          money: 50000,
          income: 10000,
          xp: 0,
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
        self.DB.Insert("players", newPlayer);
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
      self.DB.Find("players", {}).then(function(players) {
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
  updateLastSeen(player){
      var date = new Date().getTime();
      player.lastSeen = parseInt(date);
    }
  canGetIncome(player){
    var self = this;
    var date = new Date().getTime();
    var elapsed = date - player.lastSeen;
    var elapsedObj = self.getElapsedTime(elapsed);
    if((elapsedObj.days >= 2)){
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
    if(parseInt(bet) >= 0 && parseInt(bet) <= 36 && parseInt(bet) == bet){return true;}
    return false;
  }
  doChannelCheck(command){
    if(command.msg.server == '236338097955143680'){
      if(command.msg.channel == '275395383071342594')return false;
      if(command.msg.channel == '236338097955143680')return false;
      if(command.msg.channel == '268049832596340746')return false;
      return true;
    }else return true;
  }
  AutoStatus() {
    var self = this;
    try {
      if(self.class.config.autoStatus) {
        return true
      }else {
        return false
      }
    }catch (err) {
      console.log(err);
      return false;
    }
  }
  updateCoroutine(){
    var self = this;
    if(self.testingmode)return;
    self.DB.Find("players", {}).then(function(players) {
      for (var i = 0; i < players.length; i++) {
        if(players[i].lastSeen == undefined){
          self.updateLastSeen(players[i]);
        }
        if(players[i].nextlv == undefined){
          players[i].nextlv = (players[i].lv * 1000);
        }
        if(self.canGetIncome(players[i])){
          players[i].money += players[i].income;
        }
        players[i].lastMessage = null;
        self.DB.Update("players", {"id":players[i].id}, players[i]);
      }
    });
    self.DB.Update("casinoObj", {"id":self.casinoObj.id}, self.casinoObj);
    if(self.timer)self.timer.stop();
    self.timer = new Countdown(1800000,function(){
      if(self.AutoStatus()) {
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
      }
      self.updateCoroutine();
    });
    self.timer.start();
  }
}
module.exports = CasinoUtils;
