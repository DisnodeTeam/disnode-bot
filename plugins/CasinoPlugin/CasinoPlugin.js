class CasinoPlugin {
  constructor() {

  }
  default (command) {
    var self = this;
    //self.getPlayer(command);
    self.disnode.DB.Find("casinoObj.players", {}).then(function(found) {
      console.dir(found);
    });
    self.disnode.bot.SendCompactEmbed(command.msg.channel, "Test", "Test");
  }

  commandSlot (command) {
    var self = this;
    self.disnode.bot.SendCompactEmbed(command.msg.channel, "Slot", "You bet was: " + command.params[0]);
  }
  getPlayer(data){
    var self = this;
    var players = [];
    var dbplayers = [];
    self.disnode.DB.Find("casinoObj.players", {}).then(function(found) {
      players = found;
      dbplayers = found;
    });
    for (var i = 0; i < players.length; i++) {
      if(data.msg.userId == players[i].id){
        return players[i];
      }
    }
    var newPlayer = {
      name:  data.msg.user,
      id: data.msg.userId,
      money: 50000,
      perUpdate: 10000,
      xp: 0,
      Premium: false,
      Admin: false,
      banned: false,
      banreason: "",
      stats: {
        moneyWon: 0,
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
    self.disnode.DB.Push("casinoObj",{},"players", newPlayer).then(function(res) {
      console.log(res);
    });
  }
}

module.exports = CasinoPlugin;
