class TestPlugin {
  constructor() {


  }
  default(command){
    command.msg.reply("You have not entered a command! Heres default");
  }
  commandTest(command){
    console.log("Running");
    
    command.msg.reply("Hello World! I am instance on server: " + this.server);
  }
}

module.exports = TestPlugin;
