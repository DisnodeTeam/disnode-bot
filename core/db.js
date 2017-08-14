const Logging = require("disnode-logger")
const jsonfile = require('jsonfile');
const async = require('async');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient
class DB {
	constructor(disnode, settings) {

		this.reconnect = null;
		Logging.Info("DB", "Constructor", "Started" )
		this.disnode = disnode;
		this.DB = {};
		this.settings = settings;
		this.name = settings.DBName;

	}

	Connect(){

		var self = this;
		return new Promise(function (resolve, reject) {
			var url = "mongodb://";

			if(self.settings.auth){
				var user = encodeURIComponent(self.settings.user);
				var pwd =  encodeURIComponent(self.settings.pass);
				url += user + ":" + pwd + "@";
			}
			if (!self.settings.host || self.settings.host == "") {
				reject("No MongoDB Host IP!");
				return;
			}
			url += self.settings.host;
			if(!self.settings.port || self.settings.port == ""){}else {
				url += ":" + self.settings.port;
			}
			if(!self.settings.DBName || self.settings.DBName == ""){}else {
				url += "/" + self.settings.DBName;
			}
			MongoClient.connect(url, function (err, connectedDB) {
				if (err) {
					reject(err);
					return;
				}
				if(self.reconnect != null){
					clearInterval(reconnect);
					reconnect = null;
				}
				self.DB = connectedDB;
				self.DB.on('close', function () {
					Logging.Error("DB", "Error", "DB Closed, AttemptReconnect" );
    			self.AttemptReconnect();
  			});
				self.DB.on('error', function () {
					Logging.Error("DB", "Error", "DB Error, AttemptReconnect" );
    			self.AttemptReconnect();
  			});
				self.DB.on('timeout', function () {
					Logging.Error("DB", "Error", "DB timeout, AttemptReconnect" );
    			self.AttemptReconnect();
  			});
				resolve();

				return;

			});
		});
	}

	AttemptReconnect(){
		var self = this;
		self.reconnect = setInterval(function () {
			Logging.Info("DB", "Reconnect", "Attempting Connection" );
			this.Connect();
		}, 5000);
	}

	Insert(collection, data) {
		var self = this;

		return new Promise(function (resolve, reject) {
      var _collection = self.DB.collection(collection);
			_collection.insert(data, function (err, result) {
				if(err){
          reject(err);
          return;
        }
				resolve(result);
			});
		});
	}

	Update(collection, identifier, newData) {
		var self = this;

    return new Promise(function (resolve, reject) {
      var _collection = self.DB.collection(collection);
			_collection.updateOne(identifier, {$set : newData}, {upsert: true}, function (err, result) {
				if(err){
          reject(err);
          return;
        }
				resolve(result);
			});
		});
	}
  Push(collection, search, arrayName, data){
    var self = this;
    return new Promise(function (resolve, reject) {
      var _collection = self.DB.collection(collection);
      var pushObj = {};
      pushObj[arrayName] = data;
			_collection.updateOne(search, {$push : pushObj}, function (err, result) {
				if(err){
          reject(err);
          return;
        }
				resolve(result);
			});
		});
  }
	Find(collection, search) {
		var self = this;

		return new Promise(function (resolve, reject) {
      var _collection = self.DB.collection(collection);
			_collection.find(search, function (err, docs) {
				if(err){
          reject(err);
          return;
        }
				resolve(docs.toArray());
			});
		});
	}

	Delete(collection, search) {
		var self = this;

    return new Promise(function (resolve, reject) {
      var _collection = self.DB.collection(collection);
			_collection.deleteOne(search, function (err, docs) {
				if(err){
          reject(err);
          return;
        }
				resolve();
			});
		});
	}

}

module.exports = DB;
