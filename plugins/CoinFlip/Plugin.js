class CoinFlip {
  constructor() {

  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var answer = Math.floor(Math.random()*2);
    if(answer == 1){
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Coin Flip", "Landed on... **HEADS**")
    }else{
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Coin Flip", "Landed on... **TAILS**")
    }
  }

}
module.exports = CoinFlip;
