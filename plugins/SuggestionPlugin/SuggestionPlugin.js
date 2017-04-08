//TODO: Change this!


class SuggestionPlugin {
  constructor() {


  }
  Launch(){
      this.db = this.disnode.db.Init({DBName: "SuggestionPlugin"});
  }
  default (command) {

    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Commands", "!id roles \n");
  }
  commandChannel(command){
    var server = this.disnode.bot.GetServerByID(command.msg.server);
    var final = "";
    for (var key in server.roles) {
    	if ( server.roles.hasOwnProperty(key)) {
        final += "`" +  server.roles[key].name + '` -- `' +  server.roles[key].id  + "`\n";
    	}
    }
    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Roles", final);
  }
}

module.exports = SuggestionPlugin;
