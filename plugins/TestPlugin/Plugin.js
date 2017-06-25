class TestPlugin {
  constructor() {
    this.stage = 0;
    this.createChannel = ""
  }
  default (command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    if(command.params[0]){
      this.stage = parseInt(command.params[0])
      this.disnode.bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Setting Stage to: **" +   this.stage)
    }

    self.RunTest();
  }

  RunTest() {
    var self = this;
    var bot = this.disnode.bot;

    if(this.stage > 5){
      bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Test Suite Completed**")
      return;
    }
    switch (this.stage) {
      case 0:
        self.disnode.bot.SendCompactEmbed(this.config.channel, "Test Suite", "**Running Stage: GetChannel **")
        bot.GetChannel(self.config.channel)
          .then(function(data) {
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Successful: Get Channel** (`"+data.name+"`) :white_check_mark:")
            setTimeout(function () {
              self.stage += 1;
              self.RunTest();
            }, 1000);
          })
          .catch(function(err) {
            bot.SendMessage(self.config.channel, "```json\n ERROR:" + JSON.stringify(err, " ", " ") + "```")
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Failed: GetChannel :x:**")
          })
      break;

      case 1:
        self.disnode.bot.SendCompactEmbed(this.config.channel, "Test Suite", "**Running Stage: CreateChannel **")
        var chanObj= {
          name: "spawned-chan",
          position: 0,
          topic: "Created: " + new Date(),
        }
        bot.CreateChannel(self.config.guild,chanObj)
          .then(function(data) {
            self.createChannel = data.id;
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Successful: CreateChannel** (`"+data.id+"`) :white_check_mark:")
            setTimeout(function () {
              self.stage += 1;
              self.RunTest();
            }, 1000);
          })
          .catch(function(err) {

            bot.SendMessage(self.config.channel, "```json\n ERROR:" + JSON.stringify(err, " ", " ") + "```")
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Failed: CreateChannel :x:**")
          })
      break;

      case 2:
        self.disnode.bot.SendCompactEmbed(this.config.channel, "Test Suite", "**Running Stage: EditChannel **")
        var chanObj= {
          name: "edited-chan",
        }
        bot.UpdateChannel(self.createChannel,chanObj)
          .then(function(data) {

            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Successful: UpdateChannel** (`"+data.name+"`) :white_check_mark:")
            setTimeout(function () {
              self.stage += 1;
              self.RunTest();
            }, 1000);
          })
          .catch(function(err) {

            bot.SendMessage(self.config.channel, "```json\n ERROR:" + JSON.stringify(err, " ", " ") + "```")
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Failed: UpdateChannel :x:**")
          })
      break;

      case 3:
        self.disnode.bot.SendCompactEmbed(this.config.channel, "Test Suite", "**Running Stage: EditChannelPermissions **")

        bot.EditChannelPermissions(self.createChannel,"320695302409551872", "261184", "262144", "role")
          .then(function(data) {
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Successful: EditChannelPermissions** (`"+data+"`) :white_check_mark:")
            setTimeout(function () {
              self.stage += 1;
              self.RunTest();
            }, 1000);
          })
          .catch(function(err) {

            bot.SendMessage(self.config.channel, "```json\n ERROR:" + JSON.stringify(err, " ", " ") + "```")
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Failed: EditChannelPermissions :x:**")
          })

      break;

      case 4:
        self.disnode.bot.SendCompactEmbed(this.config.channel, "Test Suite", "**Running Stage: DeleteChannel **")
        var chanObj= {
          name: "edited-chan",
        }
        bot.DeleteChannel(self.createChannel,chanObj)
          .then(function(data) {

            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Successful: DeleteChannel** (`"+data.id+"`) :white_check_mark:")
            setTimeout(function () {
              self.stage += 1;
              self.RunTest();
            }, 1000);
          })
          .catch(function(err) {

            bot.SendMessage(self.config.channel, "```json\n ERROR:" + JSON.stringify(err, " ", " ") + "```")
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Failed: DeleteChannel :x:**")
          })
      break;

      case 5:
        self.disnode.bot.SendCompactEmbed(this.config.channel, "Test Suite", "**Running Stage: GetMessages **")

        bot.GetMessages(self.config.channel,{before:"328679534490812426", limit:"5"})
          .then(function(data) {

            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Successful: GetMessages** (`"+data[0].content+" / "+data.length+" messages`) :white_check_mark:")
            setTimeout(function () {
              self.stage += 1;
              self.RunTest();
            }, 1000);
          })
          .catch(function(err) {

            bot.SendMessage(self.config.channel, "```json\n ERROR:" + JSON.stringify(err, " ", " ") + "```")
            bot.SendCompactEmbed(self.config.channel, "Test Suite", "**Stage Failed: GetMessages :x:**")
          })
      break;
    }
  }

}
module.exports = TestPlugin;
