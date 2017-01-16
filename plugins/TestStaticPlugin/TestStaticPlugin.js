class TestPlugin {
  constructor() {

  }

  commandLaunched(command){
    console.log("Running");
    var final = "Instances:";
    for (var i = 0; i < this.disnode.plugin.launched.length; i++) {
      var plugin = this.disnode.plugin.launched[i];
      final += "\n - " + plugin.name + " - " + plugin.server;
    }
    command.msg.reply(final);
  }
}

module.exports = TestPlugin;
