var DBClass = require ("./db")
var logger = require('disnode-logger');
var merge = require('merge');
class DBManager{
  constructor(disnode){
    this.disnode = disnode;
    this.instances = [];
  }

  InitPromise(settings){
    var self = this;
    return new Promise(function(resolve, reject) {

      var DefaultDB = self.disnode.botConfig.db;

      settings = merge(DefaultDB, settings);


      logger.Info("DBManager", "InitPromise", "Requesting DB Instance: " + settings.DBName)
      if(!settings){reject("No Settings!"); return;}

      var _checkDB = self.CheckForInstance(settings.DBName);
      if(_checkDB != null){
        logger.Success("DBManager", "InitPromise", "DB Instance Found: " + settings.DBName)
        resolve(_checkDB);
        return;
      }
      logger.Info("DBManager", "InitPromise", "Creating and Connecting new DB Instance: " + settings.DBName)
      var _newDB = new DBClass(self.disnode,settings);
      self.instances.push(_newDB);
      _newDB.Connect().then(function(){
        logger.Success("DBManager", "InitPromise", "DB Instance Created and Connected: " + settings.DBName)
        resolve(_newDB);
        return;
      }).catch(reject);


    });
  }

  Init(settings){
    var self = this;
    var DefaultDB = self.disnode.botConfig.db;

    settings = merge(DefaultDB, settings);

    logger.Info("DBManager", "Init", "Requesting DB Instance: " + settings.DBName);

    if(!settings){return;}

    var _checkDB = self.CheckForInstance(settings.DBName);

    if(_checkDB != null){
      logger.Success("DBManager", "Init", "DB Instance Found: " + settings.DBName)
      return _checkDB;
    }

    logger.Info("DBManager", "Init", "Creating and Connecting new DB Instance: " + settings.DBName)

    var _newDB = new DBClass(self.disnode,settings);
    _newDB.Connect();
    self.instances.push(_newDB);
    return _newDB;

    logger.Success("DBManager", "Init", "DB Instance Created: " + settings.DBName)
}

  CheckForInstance(DBName){
    var self = this;
    for (var i = 0; i < self.instances.length; i++) {
      var instance = self.instances[i];
      if(instance.name = DBName){
        return(instance);
      }
    }

    return null;
  }
}

module.exports = DBManager;
