class Template {
  constructor() {
    var self = this;
    self.games = [];
  }
  Init(done){
    var self = this;
    self.initDB().then(function() {
      done();
    });
  }
  default(command){
    var self = this;
  }
  commandTest(command){
    var self = this;
    self.disnode.bot.SendMessage(command.msg.channel, "Working Command!: " );
  }
  copyObject(obj){
    return JSON.parse(JSON.stringify(obj))
  }
  initDB(){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.disnode.db.InitPromise(self.disnode.botConfig.cahdb).then(function(dbo) {
        self.DB = dbo;
        resolve();
      });
    });
  }
  getDeck(id){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.DB.Find("decks", {"id":id}).then(function(res) {
        for (var i = 0; i < res.length; i++) {
          if(res[i].id == id){
            resolve(res[i]);
          }
        }
        reject("Deck with id: " + id + " Not Found!");
      });
    });
  }
}
module.exports = Template;
