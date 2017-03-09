const Logging = require("./logging")
const jsonfile = require('jsonfile');
const async = require('async');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient
class DB {
	constructor(disnode) {
		Logging.DisnodeInfo("DB", "Constructor", "Started!")
		this.disnode = disnode;
		this.DB = {};

	}
	Init() {
		var self = this;
		return new Promise(function (resolve, reject) {
			var url = "mongodb://";
			if(self.disnode.botConfig.db.use_auth){
				var user = encodeURIComponent(self.disnode.botConfig.db.dba_user);
				var pwd = encodeURIComponent(self.disnode.botConfig.db.dba_pwd);
				url += user + ":" + pwd + "@";
			}
			if (!self.disnode.botConfig.db.db_host || self.disnode.botConfig.db.db_host == "") {
				reject("No MongoDB Host IP!");
				return;
			}
			url += self.disnode.botConfig.db.db_host;
			if(!self.disnode.botConfig.db.db_port || self.disnode.botConfig.db.db_port == ""){}else {
				url += ":" + self.disnode.botConfig.db.db_port;
			}
			if(!self.disnode.botConfig.db.db_defaultDB || self.disnode.botConfig.db.db_defaultDB == ""){}else {
				url += "/" + self.disnode.botConfig.db.db_defaultDB;
			}

			MongoClient.connect(url, function (err, db) {
				if (err) {
					reject(err);
					return;
				}
				resolve();
				self.DB = db;
				return;

				db.close();
			});
		});
	}

	Insert(plugin, data) {
		var self = this;

		return new Promise(function (resolve, reject) {
      var collection = self.DB.collection(plugin);
			collection.insert(data, function (err, result) {
				if(err){
          reject(err);
          return;
        }
				resolve(result);
			});
		});
	}

	Update(plugin, oldData, newData) {
		var self = this;

    return new Promise(function (resolve, reject) {
      var collection = self.DB.collection(plugin);
			collection.updateOne(oldData, {$set : newData}, function (err, result) {
				if(err){
          reject(err);
          return;
        }
				resolve(result);
			});
		});
	}
  Push(plugin, search, arrayName, data){
    var self = this;
    return new Promise(function (resolve, reject) {
      var collection = self.DB.collection(plugin);
      var pushObj = {};
      pushObj[arrayName] = data;
			collection.updateOne(search, {$push : pushObj}, function (err, result) {
				if(err){
          reject(err);
          return;
        }
				resolve(result);
			});
		});
  }
	Find(plugin, search) {
		var self = this;

		return new Promise(function (resolve, reject) {
      var collection = self.DB.collection(plugin);
			collection.find(search, function (err, docs) {
				if(err){
          reject(err);
          return;
        }
				resolve(docs.toArray());
			});
		});
	}

	Delete(plugin, search) {
		var self = this;

    return new Promise(function (resolve, reject) {
      var collection = self.DB.collection(plugin);
			collection.deleteOne(search, function (err, docs) {
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
