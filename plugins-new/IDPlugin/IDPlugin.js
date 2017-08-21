class IDPlugin {
  constructor() {


  }
  test(){
    console.log("WORKIN!");
  }
  default (command) {

    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Commands", "!id roles \n");
  }
  commandRoles(command){
    var server = this.disnode.bot.GetServerByID(command.msg.server);
    var final = "";
    for (var key in server.roles) {
    	if ( server.roles.hasOwnProperty(key)) {
        final += "`" +  server.roles[key].name + '` --- `' +  server.roles[key].id  + "`\n";

    	}
    }
    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Roles", final);
  }

  commandEmojis(command){
    var server = this.disnode.bot.servers[this.server];
    var final = "";

    for (var i=0;i<server.emojis.length; i++) {
      final += "`" +  server.emojis[i].name + '` --- `' +  server.emojis[i].id  + "`\n";
    }
    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Roles", final);
  }
}

module.exports = IDPlugin;
