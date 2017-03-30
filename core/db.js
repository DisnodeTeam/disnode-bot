const Logging = require("disnode-logger")
const jsonfile = require('jsonfile');
const async = require('async');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient
class DB {
	constructor(disnode) {
		Logging.Info("DB", "Constructor", "Started!")
		this.disnode = disnode;
		this.DB = {};
	}
	Init(db) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var url = "mongodb://";
			if(db.use_auth){
				var user = encodeURIComponent(db.dba_user);
				var pwd = encodeURIComponent(db.dba_pwd);
				url += user + ":" + pwd + "@";
			}
			if (!db.db_host || db.db_host == "") {
				reject("No MongoDB Host IP!");
				return;
			}
			url += db.db_host;
			if(!db.db_port || db.db_port == ""){}else {
				url += ":" + db.db_port;
			}
			if(!db.db_defaultDB || db.db_defaultDB == ""){}else {
				url += "/" + db.db_defaultDB;
			}

			MongoClient.connect(url, function (err, connectedDB) {
				if (err) {
					reject(err);
					return;
				}
				self.DB = connectedDB;
				resolve();

				return;

			});
		});
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
			_collection.updateOne(identifier, {$set : newData}, function (err, result) {
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
