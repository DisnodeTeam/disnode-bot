const axios = require('axios');
const Logger = require('disnode-logger');
const DiscordURL = 'https://discordapp.com/api/';


exports.APIGet = function (endpoint, key, data) {
  var self = this;
  return new Promise(function(resolve, reject) {
    axios.get(DiscordURL + endpoint,{headers: {'Authorization': "Bot " + key}})
    .then(function(response){
      return resolve(response.data);
    })
    .catch(function(error){
      if(!error.response){
        error.response = {
          data: error,
          status: error.code
        }
      }

      var ErrorObject = {
        message: error.response.data.message,
        data: error.response.data ,
        status: error.response.status,
        display: "Error ["+error.response.status+"] " + error.response.data.message
      }
      return reject(ErrorObject);
    });
  });
};

exports.APIPost = function (endpoint, key, data) {

};

exports.APIPut = function (endpoint, key, data) {

};
