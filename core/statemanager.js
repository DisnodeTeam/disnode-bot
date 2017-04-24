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
    state.plugins.push(plugin);
    return state;
  }

  CallFunction(plugin, name,params){
    var self = this;
    Logger.Info("StateManager-"+ plugin.id, "CallFunction", "CallingFunction: " + name);

    for (var i = 0; i < self.states[plugin.id].plugins.length; i++) {
      var _plugin = self.states[plugin.id].plugins[i];
      _plugin[name](params);
    }

  }

  CreateState(plugin){
    Logger.Success("StateManager-"+ plugin.id, "CreateState", "Creating State: " + plugin.id);
    this.states[plugin.id] = {plugins: [], data: {}};

    return this.states[plugin.id];
  }

  GetStateByID(pluginID){
    return this.states[pluginID];
  }


}

module.exports = StateManager;
