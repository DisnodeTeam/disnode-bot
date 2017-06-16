class TestPlugin {
  constructor() {
    this.sendServer = "";

  }
  Init(){
    var self = this;
    var bot = self.disnode.bot;
    bot.on("message_delete", function(data){
      if(data.server != self.server){return;}
      console.log("Mesaged Deleted");
      bot.SendMessage("301778274928033793", "Message Deleted!")
      .catch(function(err){
        console.log("ERROR SENDING MESSAGE: " + err);
      })
    })
  }
  default(command){ // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping




  }

}
module.exports = TestPlugin;
