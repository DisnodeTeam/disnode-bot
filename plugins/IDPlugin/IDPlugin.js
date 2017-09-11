class IDPlugin {
  constructor() {


  }

  default (command) {
    var self = this;
    this.disnode.bot.SendCompactEmbed(command.msg.channelID, "Commands", "!id roles \n")
    .catch(function(err) {
      console.log(err);
      self.Destory();
    }).then(()=>{
      self.Destory();
    });
  }
  commandRoles(command){
    var self = this;
    var server = this.disnode.bot.guilds.Get(command.msg.guildID);
    
    console.log(command.msg);
    var final = "";
    for (var key in server.roles) {
    	if ( server.roles.hasOwnProperty(key)) {
        final += "`" +  server.roles[key].name + '` --- `' +  server.roles[key].id  + "`\n";

    	}
    }
    this.disnode.bot.SendCompactEmbed(command.msg.channelID, "Roles", final)
    .catch(function(err) {
      console.log(err);
      self.Destory();
    }).then(()=>{
      self.Destory();
    });
  }

  commandEmojis(command){
    var self = this;
    var server = this.disnode.bot.guilds.Get(this.server);
    var final = "";

    for (var i=0;i<server.emojis.length; i++) {
      final += "`" +  server.emojis[i].name + '` --- `' +  server.emojis[i].id  + "`\n";
    }
    this.disnode.bot.SendCompactEmbed(command.msg.channelID, "Roles", final)
    .catch(function(err) {
      console.log(err);
      self.Destory();
    }).then(()=>{
      self.Destory();
    });
  }
}

module.exports = IDPlugin;
