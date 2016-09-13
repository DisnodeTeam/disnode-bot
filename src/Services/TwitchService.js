const Service = require("../Service.js");
const tmi = require("tmi.js");
class TwitchService extends Service {
    constructor(className, disnode) {
        super(className, disnode);
        this.defaultConfig = {
            user: "",
            auth: "",
            channels: ["#victoryforphil"]
        };

        this.client = {};
    }
    Connect() {
      super.Connect();
        var self = this;

        var ircoptions = {
            options: {
                debug: true
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: self.config.user,
                password: self.config.auth
            },
            channels: this.config.channels
        };
        self.client = new tmi.client(ircoptions);
        self.client.connect();
        self.client.on("connected", function(){
          self.OnConnected();
        });

    }

    OnConnected(){
      var self = this;


      self.client.say("#victoryforphil", "Hello World!");
      super.OnConnected();
    }

    SendMessage(data){
      if(!data.channel){
        return;
      }
      if(!data.msg){
        return;
      }

      this.client.say(data.channel,data.msg);
    }

}
module.exports = TwitchService;
