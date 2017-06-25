const axios = require('axios');
const Logger = require('disnode-logger');
const DiscordURL = 'https://discordapp.com/api/';

function DataToParams(url, data){
  var finalURL = url + "?";
  for (var prop in data) {
    finalURL += prop +"=" +data[prop] +"&";
  }


  return finalURL;
}

exports.APIGet = function (key,endpoint, data=null) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var url = DiscordURL + endpoint;
    if(data){
      
      url = DataToParams(url, data)
    }

    axios.get(url,{headers: {'Authorization': "Bot " + key}})
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
        status: error.response.status,
        display: "Error ["+error.response.status+"] " + error.response.data.message,
        raw: error
      }
      return reject(ErrorObject);
    });
  });
};

exports.APIPost = function ( key,endpoint, data) {
  var self = this;
  return new Promise(function(resolve, reject) {
    axios.post(DiscordURL + endpoint,data,{headers: {'Authorization': "Bot " + key}})
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
        message: error.response.statusText || error.response.data.message,
        status: error.response.status,
        display: "Error ["+error.response.status+"] " + error.response.data.message,
        raw: error
      }
      return reject(ErrorObject);
    });
  });
};

exports.APIPut = function ( key, endpoint, data) {
  var self = this;
  return new Promise(function(resolve, reject) {
    axios.put(DiscordURL + endpoint,data,{headers: {'Authorization': "Bot " + key}})
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
        status: error.response.status,
        display: "Error ["+error.response.status+"] " + error.response.data.message,
        raw: error
      }
      return reject(ErrorObject);
    });
  });
};
exports.APIPatch = function ( key,endpoint, data) {
  var self = this;
  return new Promise(function(resolve, reject) {
    axios.patch(DiscordURL + endpoint,data,{headers: {'Authorization': "Bot " + key}})
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
        status: error.response.status,
        display: "Error ["+error.response.status+"] " + error.response.data.message,
        raw: error
      }
      return reject(ErrorObject);
    });
  });
};


exports.APIDelete = function ( key,endpoint) {
  var self = this;
  return new Promise(function(resolve, reject) {
    axios.delete(DiscordURL + endpoint,{headers: {'Authorization': "Bot " + key}})
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
        status: error.response.status,
        display: "Error ["+error.response.status+"] " + error.response.data.message,
        raw: error
      }
      return reject(ErrorObject);
    });
  });
};
