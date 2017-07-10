const Logging = require('disnode-logger')

class Template {
  Init(done){
    var self = this;
    self.disnode.bot.on("message_delete", (info)=>{

      if(info.guild_id != self.guildId){return;}
      self.OnMessageDelete(info)
    })

    self.disnode.db.InitPromise({}).then(function(dbo) {

      self.DB = dbo;
      Logging.Info("TestPlugin - " + self.disnode.bot.guilds[self.guildId].name, "Init", "INIT'D!");
      done();
    });
  }

  OnMessageDelete(info){
    this.disnode.bot.SendMessage("327282478496612352", "Messaged Deleted: ```" + JSON.stringify(info, " ", " ") + "```");
  }
}
module.exports = Template;
