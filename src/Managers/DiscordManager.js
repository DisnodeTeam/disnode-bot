"use strict"
const colors = require('colors');
class DiscordManager {
  constructor(options){
    const FS = require('fs');
    this.bot = options.disnode.bot;
    this.fs = FS;
  }
  setGame(Game, cb){
    var self = this;
    if(Game == undefined || Game == ""){
      self.bot.setPlayingGame(null, function(err){
        cb(err);
      });
    }else {
      self.bot.setPlayingGame(Game, function(err){
        cb(err);
      });
    }
  }
  setAvatar(path, cb){
    var self = this;
    self.fs.readFile(path, {encoding: 'base64'},function(err, data) {
    if(err){
      cb(err);
    }
    var data = "data:image/jpeg;base64," + data;
    console.log("[DiscordManager]".grey + " Image Icon Read. Setting.");
     self.bot.setAvatar(data, function(err){
       if(err){
         cb(err);
       }else {
         cb("SET");
       }
     });
  });
  }
  setName(Name, cb){
    if(Name == undefined || Name == "" || Name == null){
      cb("NAME_NULL");
      return;
    }else{
      self.bot.setUsername(Name, function(err){
        if(err != null){
          cb(err);
        }else{
          cb("OK")
        }
      });
    }
  }
}
module.exports = DiscordManager;
