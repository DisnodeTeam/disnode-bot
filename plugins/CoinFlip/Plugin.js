class CoinFlip {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var answer = Math.floor(Math.random()*2);
    if(answer == 1){
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Coin Flip", "Landed on... **HEADS**")
      .catch(function(err) {
        console.log(err);
        self.Destory();
      }).then(()=>{
        self.Destory();
      });
    }else{
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Coin Flip", "Landed on... **TAILS**")
      .catch(function(err) {
        console.log(err);
        self.Destory();
      }).then(()=>{
        self.Destory();
      });
    }
  }

}
module.exports = CoinFlip;
