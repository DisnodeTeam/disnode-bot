var Logger = require("disnode-logger");

class StateManager{
  constructor(disnode){
    this.disnode = disnode;
    this.states = {};
  }

  Init(plugin){
    var self = this;
    var id = plugin.id;

    Logger.Info("StateManager-"+ plugin.id, "Init", "Init for plugin: " + plugin.id);

    var state = self.GetStateByID(id);
    if(!state){
      state = self.CreateState(plugin);
    }
    if(state.plugins.length == 0){
      plugin.stateAuth = true;
      Logger.Info("StateManager-" + plugin.id, "Init", "Auth set true for: " + plugin.server);
    }
    state.plugins.push(plugin);
    return state;
  }


  CreateState(plugin){
    Logger.Success("StateManager-"+ plugin.id, "CreateState", "Creating State: " + plugin.id);
    this.states[plugin.id] = {plugins: [], data: {}, owner: plugin};
    this.states[plugin.id].CallFunction = function(name,params){
      var self = this;

      Logger.Info("StateManager-"+ self.owner.id, "CallFunction", "CallingFunction: " + name);

      for (var i = 0; i < self.plugins.length; i++) {
        var _plugin = self.plugins[i];
        _plugin[name](params);
      }

    }

    return this.states[plugin.id];
  }

  GetStateByID(pluginID){
    return this.states[pluginID];
  }


}

module.exports = StateManager;
