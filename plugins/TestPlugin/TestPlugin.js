class TestPlugin {
  constructor() {
    console.log("Lol Loaded!");
  }

  commandTest(command){
    console.log("Running");
    command.msg.reply("Hello World! I am instance on server: " + this.server);
  }
}

module.exports = TestPlugin;
