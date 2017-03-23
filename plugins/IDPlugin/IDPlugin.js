class IDPlugin {
  constructor() {


  }

  default (command) {

    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Commands", "!id roles \n");
  }
  commandRoles(command){
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

module.exports = IDPlugin;
