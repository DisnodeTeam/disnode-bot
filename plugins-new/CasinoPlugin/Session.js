const numeral = require('numeral');
const logger = require('disnode-logger');

class Session {
  constructor(id, game={}) {
    this.id = id;
    this.game = game;
    this.timeouts = [];
    logger.Success("Session", "New Session", "Created a new session with id: " + id);
  }
  createTimeout(func, time){
    var self = this;
    var tid = setTimeout(func, time);
    self.timeouts.push(tid);
    return tid;
  }
  removeTimeout(id){
    var self = this;
    for (var i = 0; i < self.timeouts.length; i++) {
      if(self.timeouts[i].id == id){
        clearTimeout(self.timeouts[i]);
        self.timeouts.splice(i,1);
        break;
      }
    }
  }
  cleanup(){
    var self = this;
    for (var i = 0; i < self.timeouts.length; i++) {
      clearTimeout(self.timeouts[i]);
    }
    logger.Success("Session", "Session End", "Session ended with id: " + self.id);
  }
}
module.exports = Session;
