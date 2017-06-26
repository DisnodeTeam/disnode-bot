var Logger = require("disnode-logger");
var Axios = require('axios');

class Platform {
    constructor(disnode) {
        this.disnode = disnode;
    }
    GetUserData(userID){
      var self = this;

      return new Promise(function (resolve, reject) {
          Axios.get("https://api.disnodeteam.com/user/" + userID)
          .then(function (res) {
              if (res.data.type == "ERR") {
                  reject(res.data.data);
                   return;
               }
              resolve(res.data.data);
          }).catch(function (err) {
              reject(err.message)
          })
      });
    }
    GetUltraUsers(){
      var self = this;

      return new Promise(function (resolve, reject) {
          Axios.get("https://api.disnodeteam.com/user/ultra")
          .then(function (res) {
              if (res.data.type == "ERR") {
                  reject(res.data.data);
                   return;
               }
              resolve(res.data.data);
          }).catch(function (err) {
              reject(err.message)
          })
      });
    }
    GetUserUltra(userID) {
        var self = this;

        return new Promise(function (resolve, reject) {
            Axios.get("https://api.disnodeteam.com/user/" + userID + "/ultra")
            .then(function (res) {
                if (res.data.type == "ERR") {

                    reject(res.data.data);
                     return;
                 }
                resolve(res.data.data);
            }).catch(function (err) {
                reject(err.message)
            })
        });
    }

}

module.exports = Platform;
