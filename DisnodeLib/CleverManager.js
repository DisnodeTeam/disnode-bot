"use strict"
class CleverManager {
  constructor(CBot, CleverAPI){
    this.cb = CBot;
    this.capi = CleverAPI;
  }
  sendMsg(Message, cb){
    this.cb.write(Message, function callb(reply){
      cb(reply['message'])
    });
  }
}

module.exports.CleverManager = CleverManager;
