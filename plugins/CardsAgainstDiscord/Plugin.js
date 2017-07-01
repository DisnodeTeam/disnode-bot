const Session = require('./Session.js');

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

  commandNew(command){
    var self = this;
    var currentSession = self.findGame(command.msg.author.id);
    if(!currentSession){
      var newGame = {
        hostName: command.msg.author.username,
        public: false,
        players: [],
        decks: [
          {
            id:0,
            name:"Default Deck"
          }
        ],
        blackCards: [],
        whiteCards: [],
        hasStarted: false,
        pointsToWin: 5,
        allowJoinInProgress: true,
        stage: 0,
        mode: 0,
        origchat: command.msg.channel_id,
        currentBlackCard: {},
        currentWhiteCards: [],
        currentCardCzar: {},
        CzarOrderCount: 0
      }
      self.getDeck(0).then(function(deck) {
        newGame.blackCards = self.copyObject(deck.blackCards);
        newGame.whiteCards = self.copyObject(deck.whiteCards);
        var newSession = new Session(command.msg.author.id, newGame);
        newSession.createTimeout(function() {
          newSession.cleanup();
          for (var i = 0; i < self.games.length; i++) {
            if(self.games[i].id == newSession.id){
              self.games.splice(i,1);
            }
          }
        }, 3600000);
        self.games.push(newSession);
        console.log(newSession);
        self.disnode.bot.SendEmbed(command.msg.channel_id,{
          color: 3447003,
          author: {},
          fields: [ {
            name: 'New Game',
            inline: true,
            value: "New game created! Others can join this game by typing `" + self.disnode.botConfig.prefix + self.config.prefix + " join @person` Where @person is the user that created the game in the form of a mention.",
          }, {
            name: 'Discord Server',
            inline: false,
            value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
          }],
            footer: {}
        });
        self.joinGame(newSession.game.id,command.msg.author.id,command.msg.author.username);
        self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Joined", "You joined the game!");
      });
    }
  }
  commandJoin(command){
    var self = this;
    if(!self.checkIfUserInGame()){
      var game = self.findGame(self.parseMention(command.params[0]));
      if(!game){
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "Invalid game, try `" + self.disnode.botConfig.prefix + self.config.prefix + " join @person` Where @person is the user that created the game in the form of a mention. If that wont work then maybe there is no running game.");
      }else {
        if(game.game.hasStarted){
          if(game.game.allowJoinInProgress){
            self.joinGame(game.id,command.msg.author.id,command.msg.author.username);
            self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Joined", "You joined the game!");
          }else {
            self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Error", "This game has join in Progress disabled so you cannot join.");
          }
        }else {
          self.joinGame(game.id,command.msg.author.id,command.msg.author.username);
          self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Joined", "You joined the game!");
        }
      }
    }else {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You are already in a game!");
    }
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
  findGame(id){
    for (var i = 0; i < this.games.length; i++) {
      if(this.games[i].id == id){
        return this.games[i];
      }
    }
    return false;
  }
  checkIfUserInGame(userID){
    var self = this;
    for (var i = 0; i < self.games.length; i++) {
      self.games[i]
      for (var j = 0; j < self.games[i].game.players.length; j++) {
        if(self.games[i].game.players[j].id == userID){
          return true;
        }
      }
    }
    return false;
  }
  joinGame(gameID, playerID, playerName){
    var self = this;
    for (var i = 0; i < self.games.length; i++) {
      if(self.games[i].id == gameID){
        var newPlayer = {
          name:  playerName,
          id: playerID,
          points: 0
        }
        self.games[i].game.players.push(newPlayer);
      }
    }
  }
  parseMention(dataString){
    var self = this;
    var returnV = dataString;
    returnV = returnV.replace(/\D/g,'');
    return returnV;
  }
}
module.exports = Template;
