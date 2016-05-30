"use strict"

class CleverManager {
  constructor(CBot){
    this.cb = CBot;
  }
  sendMsg(Message, cb){
    this.cb.write(Message, function callb(reply){
      cb(reply['message'])
    });
  }
}

module.exports = CleverManager;
