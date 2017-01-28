

class DBChat {
  constructor() {

  }
  default(command){
    command.msg.reply("You have not entered a command! Heres default");
  }
  commandSet(command){
    var self = this;
    this.disnode.DB.Set(this.name,command.params[0], command.params[1]).then(function(db){
        self.disnode.SendCompactEmbed(command.msg.channel, "DataBase Set", JSON.stringify(db, null, 4))
    });

  }

  commandGet(command){
    var self = this;
    this.disnode.DB.Get(this.name,command.params[0]).then(function(db){
      self.disnode.SendCompactEmbed(command.msg.channel, "DataBase Get", JSON.stringify(db, null, 4))
    }).catch(function(err){
        command.msg.reply("Err: " + err);
    });

  }

  commandAdd(command){
    var self = this;
    this.disnode.DB.Add(this.name,command.params[0], command.params[1]).then(function(db){
        self.disnode.SendCompactEmbed(command.msg.channel, "DataBase Add", JSON.stringify(db, null, 4))
    });

  }
}

module.exports = DBChat;
