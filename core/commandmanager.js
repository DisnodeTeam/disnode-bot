var logger = require('disnode-logger');
var CommandInstance = require ('./command');


class CommandManager{
  constructor(disnode){

    this.disnode   = disnode;
    this.instances = [];

  }

  GetCommandInstance(server){
    var self = this;

    var _checkInstance = self.CheckForInstance(server);

    if(_checkInstance != null){
      return _checkInstance;
    }

    var _newInstance = new CommandInstance(self.disnode,server);
    self.instances.push(_newInstance);

    logger.Success("CommandManager", "GetCommandInstance", "Command Instance Created: " + server)

    return _newInstance;


  }

  CheckForInstance(server){
    var self = this;

    for (var i = 0; i < self.instances.length; i++) {
      var instance = self.instances[i];
      if(instance.server = server){
        return(instance);
      }
    }

    return null;
  }

}

module.exports = CommandManager;
