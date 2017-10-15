
const axios = require("axios")
const ENDPOINT = "http://127.0.0.1:9999"
module.exports = class CAHUtil {
    constructor() {
        this.request = axios.create({
            baseURL: ENDPOINT,
            timeout: 50000,
            headers: { 'auth': 'FlWo39AEgJuw8hvl6diIqcekictExUbcqkMV16DPGJAXdz4v71Lzm2QBJUo5M2gU' }
        });

        this.tokens = {};
    }

    NewGame(creator) {
        var self = this;
        return new Promise((resolve, reject) => {

            var creatorObject = {
                creator: creator.id
            }
            self.request.post(ENDPOINT + "/game", creatorObject).then((res) => {
                var GameCode = res.data.data.toUpperCase();
                
                return self.JoinGame(GameCode, creator).then(resolve);
            }).catch((err) => {
              
                return reject(err);
            });
        });
    }

    JoinGame(gameCode, user){

        var self = this;
        return new Promise((resolve, reject) => {
            var joinObject = {
                player: user
            }
          
            self.request.post(ENDPOINT + "/game/"+gameCode+"/players", joinObject).then((response) => {
                self.tokens[user.id] = response.token;
                return resolve(response.data.data)
            }).catch((err) => {
   
                return reject(err);
            });
        });
    }

    GetGame(gameCode){
        var self = this;
        return new Promise((resolve, reject) => {

          
            self.request.get(ENDPOINT + "/game/"+gameCode).then((response) => {

                return resolve(response.data.data)
            }).catch((err) => {
   
                return reject(err);
            });
        });
    }
    

    
}