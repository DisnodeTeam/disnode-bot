var logger = require('disnode-logger');
const CommandManager = require ('./commandmanager');
const PluginManager   = require ("./pluginmanager");

class ServerManager{
  constructor(disnode){

    this.disnode   = disnode;
    this.commandManagers = [];
    this.pluginManagers  = [];
    this.DBManagers      = [];

  }

  GetCommandInstance(server){
    var self = this;

    var _checkInstance = self.CheckForCommandInstance(server);

    if(_checkInstance != null){
      return _checkInstance;
    }

    var _newInstance = new CommandManager(self.disnode,server);
    self.commandManagers.push(_newInstance);
    self.disnode.stats.commandManagers++;

    logger.Success("ServerManager", "GetCommandInstance", "CommandManager Created: " + server)

    return _newInstance;
  }

  GetCommandInstancePromise(server){
    var self = this;

    return new Promise(function(resolve, reject) {
      var _checkInstance = self.CheckForCommandInstance(server);

      if(_checkInstance != null){

        resolve(_checkInstance);
        return;
      }

      var _newInstance = new CommandManager(self.disnode,server,function(){
        self.commandManagers.push(_newInstance);
          self.disnode.stats.commandManagers++;
        logger.Success("ServerManager", "GetCommandInstance", "CommandManager Created: " + server)

        resolve(_newInstance);
      });

    });
  }


  GetPluginInstance(server){
    var self = this;

    var _checkInstance = self.CheckForPluginInstance(server);

    if(_checkInstance != null){
      return _checkInstance;
    }

    var _newInstance = new PluginManager(self.disnode,server);
    self.pluginManagers.push(_newInstance);
      self.disnode.stats.pluginManagers++;
    logger.Success("ServerManager", "GetCommandInstance", "PluginManager Created: " + server)

    return _newInstance;


  }

  CheckForCommandInstance(server){
    var self = this;

    for (var i = 0; i < self.commandManagers.length; i++) {
      var instance = self.commandManagers[i];
      if(instance.server == server){
        return(instance);
      }
    }

    return null;
  }

  CheckForPluginInstance(server){
    var self = this;

    for (var i = 0; i < self.pluginManagers.length; i++) {
      var instance = self.pluginManagers[i];
      if(instance.server == server){
        return(instance);
      }
    }

    return null;
  }

  CheckForDBInstance(server){
    var self = this;

    for (var i = 0; i < self.DBManagers.length; i++) {
      var instance = self.DBManagers[i];
      if(instance.server = server){
        return(instance);
      }
    }

    return null;
  }

}

module.exports = ServerManager;
