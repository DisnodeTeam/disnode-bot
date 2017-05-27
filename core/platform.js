var Logger = require("disnode-logger");
var Axios = require('axios');

class Platform {
    constructor(disnode) {
        this.disnode = disnode;
    }

    GetUserRole(userID) {
        var self = this;
        console.log("RUNNING CHECK!");

        return new Promise(function (resolve, reject) {
            Axios.get("https://www.disnodeteam.com/api/user/" + userID + "/ultra")
            .then(function (res) {
                if (res.data.type == "ERR") {
                    console.log(res.data)
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
