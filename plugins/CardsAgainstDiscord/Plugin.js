const Session = require('./Session.js');
const logger = require('disnode-logger');
const cc = require('cardcast-api');
class CAHPlugin {
  constructor() {
    var self = this;
    self.games = [];
    self.ccapi = new self.cc.CardcastAPI();
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
  commandStart(command){
    var self = this;
    var game = self.findGame(command.msg.author.id);
    if(!game){
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You don't have an active game or you are in a game where you are not the host.");
    }else {
      if(game.game.hasStarted){
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "The game has already started!");
        return;
      }
      if(game.game.players.length >= 3){
        game.game.origchat = command.msg.channel_id;
        game.game.hasStarted = true;
        self.DealCards(game.game);
      }else {
        if(command.params[0] == "true" && game.game.players.length == 2){
          game.game.origchat = command.msg.channel_id;
          game.game.hasStarted = true;
          self.DealCards(game.game);
        }else {
          self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "CAH requires 3 people to be an enjoyable game, however you can start with 2 people in game with `" self.disnode.botConfig.prefix + self.config.prefix + " start true`");
        }
      }
    }
  }
  commandNew(command){
    var self = this;
    var currentSession = self.findGame(command.msg.author.id);
    if(!currentSession){
      var newGame = {
        hostName: command.msg.author.username,
        id: command.msg.author.id,
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
        }, 7200000);
        self.games.push(newSession);
        self.disnode.bot.SendEmbed(command.msg.channel_id,{
          color: 3447003,
          author: {},
          fields: [ {
            name: 'New Game',
            inline: true,
            value: "New game created! Others can join this game by typing `" + self.disnode.botConfig.prefix + self.config.prefix + " join @person` Where @person is the user that created the game in the form of a mention. Note: the game will end in 2 hours automatically to conserve bot resources",
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
            self.sendEmbedToAllPlayers(game, {
              color: 3447003,
              author: {},
              fields: [ {
                name: 'Game Status',
                inline: true,
                value: command.msg.author.username + " has joined the game!",
              }],
                footer: {}
            });
            self.joinGame(game.id,command.msg.author.id,command.msg.author.username);
            self.gameFunc(game.game);
            self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Joined", "You joined the game!");
          }else {
            self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Error", "This game has join in Progress disabled so you cannot join.");
          }
        }else {
          self.sendEmbedToAllPlayers(game, {
            color: 3447003,
            author: {},
            fields: [ {
              name: 'Game Status',
              inline: true,
              value: command.msg.author.username + " has joined the game!",
            }],
              footer: {}
          });
          self.joinGame(game.id,command.msg.author.id,command.msg.author.username);
          self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Joined", "You joined the game!");
        }
      }
    }else {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You are already in a game!");
    }
  }
  commandLeave(command){
    var self = this;
    if(self.checkIfUserInGame()){
      var game = self.getGameUserIsIn(command.msg.author.id);
      if(!game){
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "Invalid game, try `" + self.disnode.botConfig.prefix + self.config.prefix + " join @person` Where @person is the user that created the game in the form of a mention. If that wont work then maybe there is no running game.");
      }else {
        if(game.game.currentCardCzar != command.msg.author.id){
          var toRemove = [];
          for (var i = 0; i < game.game.currentWhiteCards.length; i++) {
            if(game.game.currentWhiteCards[i].sender == command.msg.author.id){
              toRemove.push(i);
            }
          }
          for (var i = 0; i < toRemove.length; i++) {
            game.game.currentWhiteCards.splice(toRemove[i],1);
          }
          self.leaveGame(game.id,command.msg.author.id);
          self.sendEmbedToAllPlayers(game, {
            color: 3447003,
            author: {},
            fields: [ {
              name: 'Game Status',
              inline: true,
              value: command.msg.author.username + " has left the game!",
            }],
              footer: {}
          });
          self.gameFunc(game.game);
          self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Left", "You left the game!");

        }else {
          self.disnode.bot.SendDMCompactEmbed(command.msg.author.id, "Error", "You are not allowed to leave the game if you are card czar!");
        }
      }
    }else {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You must be in a game to leave one!");
    }
  }
  commandSubmit(command){
    var self = this;
    if(self.checkIfUserInGame()){
      var game = self.getGameUserIsIn(command.msg.author.id);
      if(!game.hasStarted)return;
      if(game.currentCardCzar == command.msg.author.id){
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You can't do this as the card Czar!");
        return;
      }else {
        for (var i = 0; i < game.players.length; i++) {
          if(game.players[i].id == command.msg.author.id){
            var player = game.players[i];
            if(player.cards.length < 10){
              self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You already submitted a card!");
              return;
            }
            if(command.params[0]){
              if(command.params[0] >= 1 && command.params[0] < 11){
                var index = command.params[0];
                index--;
                var submitCard = player.cards[index];
                submitCard.sender = player.id;
                game.currentWhiteCards.push(submitCard);
                player.cards.splice(index,1);
                self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Submitted!", "You submitted:`" + submitCard.text + "`");
              }else {
                self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "The card you picked was outside of the range (1-10)!");
              }
            }else {
              self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "Pick the index of the card you want to submit and add it to the end of the command!");
            }
            self.gameFunc(game);
          }
        }
      }
    }else {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You must be in a game to do this!");
    }
  }
  commandPick(command){
    var self = this;
    if(self.checkIfUserInGame()){
      var game = self.getGameUserIsIn(command.msg.author.id);
      if(!game.hasStarted)return;
      if(!game.currentCardCzar == command.msg.author.id){
        self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You can't do this you must be card Czar!");
        return;
      }else {
        if(game.currentWhiteCards.length < (game.players.length - 1)){
          self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You can't pick a card yet!");
          return;
        }
        if(command.params[0]){
          if(command.params[0] >= 1 && command.params[0] < game.currentWhiteCards.length){
            var index = command.params[0];
            index--;
            var picked = game.whiteCards[index];
            var p;
            for(var i = 0; i < game.players.length; i++){
              if(game.players[i].id == picked.player.id){
                game.players[i].points++;
                p = game.players[i];
                break;
              }
            }//fix these embed sends
            self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Card Picked!", "Card: :`" + picked.text + "` Submitted by");
          }else {
            self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "The card you picked was outside of the range (1-" + game.currentWhiteCards.length +")!");
          }
        }else {
          self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "Pick the index of the card you want to submit and add it to the end of the command!");
        }
        self.gameFunc(game);
      }
    }else {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "You must be in a game to do this!");
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
  getGameUserIsIn(userID){
    var self = this;
    for (var i = 0; i < self.games.length; i++) {
      self.games[i]
      for (var j = 0; j < self.games[i].game.players.length; j++) {
        if(self.games[i].game.players[j].id == userID){
          return self.games[i].game;
        }
      }
    }
    return false;
  }
  //
  //    GAME FUNCTION
  //
  gameFunc(game){
    var self = this;
    if(!game.hasStarted)return;
    switch (game.state) {
      case 0: //Pick Card Czar and move on
        if(game.CzarOrderCount < game.players.length){
          game.currentCardCzar = game.players[game.CzarOrderCount];
          game.CzarOrderCount++;
        }else{
          game.CzarOrderCount = 0;
          game.currentCardCzar = game.players[game.CzarOrderCount];
          game.CzarOrderCount++;
        }
        self.drawBlackCard(game).then(function(card) {
          game.blackCard = card;
        }).catch(function(err) {
          console.log(err);
        });
        break;
      case 1: //Allow player to submit a white card for the black card move on to stage 2
        if(game.currentWhiteCards.length < (game.players.length - 1)){
          self.sendQuickEmbedToAllPlayers(game, "Submitted Cards", "`" + game.currentWhiteCards.length + "/" + (game.players.length - 1) + "`");
        }else {
          if(game.players.length <= 3){
            var card = game.currentWhiteCards.splice(self.getRandomIntInclusive(0,1), 1)[0];
            game.currentWhiteCards.push(card);
          }else {
            for (var i = 0; i < game.currentWhiteCards.length; i++) {
              var card = game.currentWhiteCards.splice(self.getRandomIntInclusive(0,(game.currentWhiteCards.length - 1)),1)[0];
              game.currentWhiteCards.push(card);
            }
          }
          var msg = " ";
          for(var i = 0; i < game.currentWhiteCards.length; i++){
            if(i == (game.currentWhiteCards.length - 1)){
              msg += "╚[ " + (i + 1) + " ] - " + game.currentWhiteCards[i].text + "\n";
            }else{
              msg += "╠[ " + (i + 1) + " ] - " + game.currentWhiteCards[i].text + "\n";
            }
          }
          self.sendEmbedToAllPlayers(game,{
            color: 3447003,
            author: {},
            fields: [ {
              name: 'Black Card',
              inline: true,
              value: game.currentBlackCard.text,
            }, {
              name: 'White Cards',
              inline: false,
              value: msg,
            }, {
              name: 'Actions',
              inline: false,
              value: "Now the Card Czar must `!cah pick [index]` to pick what white card he/she likes the most.",
            }],
              footer: {}
          });
        }
        break;
      case 2: //Card Czar will pick the winning card and points are awarded then move on to stage 3
        msg = " ";
        for(var i = 0; i < game.players.length; i++){
          msg += "**[" + game.players[i].name + "]** Points: " + game.players[i].points + " \n";
        }
        self.sendQuickEmbedToAllPlayers(game, "Current Standings", msg);
        game.state = 3;
        self.gameFunc(game);
        break;
      case 3: //(check if there is a winner if no winner then draw up to ten cards and go back to stage 0)
        for(var i = 0; i < game.players.length; i++){
          if(game.players[i].points >= game.pointsToWin){
            self.sendQuickEmbedToAllPlayers(game, "A player has Won!", "Winner: `" + game.players[i].name + '`');
            self.endGame(game);
            return;
          }
        }
        self.DrawUpTopTen(game);
        game.state = 0;
        self.GameFunction(game);
        break;
      default:
        break;
    }
  }
  //
  //    END GAME FUNCTION
  //
  getHand(player){
    var self = this;
    var msg = " ";
    for (var i = 0; i < player.cards.length; i++) {
      var card = player.cards[i];
      if(i == 9){
        msg += "╚**[" + (i+1) + "** - " + card.text + "]\n";
      }else{
        msg += "╠**[" + (i+1) + "** - " + card.text + "]\n";
      }
    }
    self.disnode.bot.SendDMCompactEmbed(player.id, msg);
  }
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  drawBlackCard(game){
    var self = this;
    return new Promise(function(resolve, reject) {
      var card = game.blackCards.splice(self.getRandomIntInclusive(0,game.blackCards.length - 1),1)[0];
      if(game.blackCards.length == 0){
        for (var i = 0; i < game.decks.length; i++) {
          self.getDeck(game.decks[i].id).then(function(deck) {
            var blacks = self.copyObject(deck.blackCards);
            game.blackCards = [];
            for (var i = 0; i < blacks.length; i++) {
              game.blackCards.push(blacks[i]);
            }
          }).catch(function(err) {
            console.log(err);
          });
        }
        game.blackCard = card;
        resolve(card);
      }else {
        game.blackCard = card;
        resolve(card);
      }
    });
  }
  DealCards(game){
    var self = this;
    var players = game.players;
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      for (var j = 0; j < 10; j++) {
        self.drawWhiteCard(game, p);
      }
    }
    self.gameFunc(game);
  }
  DrawUpTopTen(game){
    var self = this;
    var players = game.players;
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      for (var j = p.cards.length; j < 10; j++) {
        self.drawWhiteCard(game, p);
      }
    }
  }
  drawWhiteCard(game,player){
    var self = this;
    return new Promise(function(resolve, reject) {
      var card = game.whiteCards.splice(self.getRandomIntInclusive(0,game.whiteCards.length - 1),1)[0];
      if(game.whiteCards.length == 0){
        for (var i = 0; i < game.decks.length; i++) {
          self.getDeck(game.decks[i].id).then(function(deck) {
            var whites = self.copyObject(deck.whiteCards);
            game.whiteCards = [];
            for (var i = 0; i < whites.length; i++) {
              game.whiteCards.push(whites[i]);
            }
          }).catch(function(err) {
            console.log(err);
          });
        }
        player.cards.push(card);
        resolve(card);
      }else {
        player.cards.push(card);
        resolve(card);
      }
    });
  }
  sendEmbedToAllPlayers(game,embed){
    if(game.mode == 0){
      for (var i = 0; i < game.players.length; i++) {
        self.disnode.bot.SendDMEmbed(game.players[i].id, embed);
      }
    }else {
      self.disnode.bot.SendEmbed(game.origchat, embed);
    }
  }
  sendQuickEmbedToAllPlayers(game,title, body){
    if(game.mode == 0){
      for (var i = 0; i < game.players.length; i++) {
        self.disnode.bot.SendDMCompactEmbed(game.players[i].id, title,body);
      }
    }else {
      self.disnode.bot.SendEmbed(game.origchat, embed);
    }
  }
  joinGame(gameID, playerID, playerName){
    var self = this;
    for (var i = 0; i < self.games.length; i++) {
      if(self.games[i].id == gameID){
        var newPlayer = {
          name:  playerName,
          id: playerID,
          cards: [],
          points: 0
        }
        self.games[i].game.players.push(newPlayer);
      }
    }
  }
  leaveGame(gameID, playerID){
    var self = this;
    for (var i = 0; i < self.games.length; i++) {
      if(self.games[i].id == gameID){
        for (var j = 0; j < self.games[i].players.length; j++) {
          if(self.games[i].players[j].id == playerID){
            self.games[i].players.splice(j,1);
          }
        }
      }
    }
  }
  endGame(game){
    var self = this;
    var session = findGame(game.id)
    session.cleanup();
    for (var i = 0; i < self.games.length; i++) {
      if(self.games[i].id == session.id){
        self.games.splice(i,1);
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
module.exports = CAHPlugin;
