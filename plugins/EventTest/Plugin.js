const Logging = require('disnode-logger')

class Template {
  Init(done){
    var self = this;
    self.disnode.bot.on("message_delete", (info)=>{

      if(info.guild_id != self.guildId){return;}
      self.OnMessageDelete(info)
    })

    self.disnode.db.InitPromise({}).then(function(dbo) {
      Logging.Info("Moderation", "DB", "Started  ||  Plugin # " + self.disnode.util.ReturnInstances() + " || Servers # " + (Object.keys(self.disnode.bot.guilds).length - 1))
      self.DB = dbo;
      done();
    });
  }

  OnMessageDelete(info){
    this.disnode.bot.SendMessage("327282478496612352", "Messaged Deleted: ```" + JSON.stringify(info, " ", " ") + "```");
  }
}
module.exports = Template;
