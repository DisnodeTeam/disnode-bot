"use strict"

class CleverManager {
  constructor(options){
    const Cleverbot = require('cleverbot-node');
    console.log("[Cleverbot] Init");
    if(options.channelid){
      this.channelid = options.channelid;
    }else{
      console.log("[Cleverbot INIT ERROR] No \'channelid\' found in options object, cannot use Cleverbot without a channelid");
      return;
    }
    this.cb = new Cleverbot;
    this.enabled = false;
    Cleverbot.prepare(function(){});
  }
  sendMsg(Message, cb){
    var self = this;
    self.cb.write(Message, function callb(reply){
      cb(reply['message'])
    });
  }
}

module.exports = CleverManager;
