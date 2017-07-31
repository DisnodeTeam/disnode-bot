const axios = require('axios');
const Logger = require('disnode-logger');

class Discoin {
  constructor(authkey) {
    this.req = axios.create({
      baseURL: 'http://discoin-austinhuang.rhcloud.com/transaction/',
      timeout: 3000,
      headers: {'Authorization': authkey, 'json':'true'}
    })
  }
  postTransactionRequest(userID, amount, to){
    var self = this;
    to = to.toUpperCase();
    return new Promise(function(resolve, reject) {
      self.req.get('/' + userID + '/' + amount + '/' + to).then(function(resp) {
        console.log(resp.data);
        resolve(resp);
      }).catch(function(err) {
        reject(err);
      })
    });
  }
  setupInterval(funcToCall, time, caller){
    var self = this;
    setInterval(function() {
      console.log("Checking for new discoin transactions...");
      self.req.get().then(function(resp) {
        console.log(resp.data);
        funcToCall(resp.data, caller);
      });
    }, time);
  }
}
module.exports = Discoin;
