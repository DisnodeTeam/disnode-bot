class TestPlugin {
    constructor() {


    }
    default (command) {
      console.log(command);
        this.disnode.bot.SendMessage(command.msg.channel, "TEST", {});
    }
    commandTest(command) {
      var self = this;
        console.log("Running");
        console.log(  self.disnode.bot.GetUserRoles(command.msg.server, command.msg.userID));
        this.disnode.bot.SendMessage(command.msg.channel, "TE3ST", {});
    }

    commandWhitelist(command) {

      var self = this;
      console.log(command);
        if(command.command.userAllowed == true){
          self.disnode.bot.SendMessage(command.msg.channel, "You're Allowed!", {});
          self.disnode.bot.SetStatus(command.params[0]);
        }else{
          self.disnode.bot.SendMessage(command.msg.channel, "You're Not Allowed: " + command.command.whitelist, {});
        }


    }
    commandLoaded(command) {
      var self = this;
      var loadedPlugins = self.disnode.plugin.loaded;
      var Repsonse = "Current Plugins Loaded: \n";

      for (var i = 0; i <loadedPlugins.length; i++) {
        var cur = loadedPlugins[i];
        Repsonse += "!" + cur.name + "\n"
      }
      self.disnode.bot.SendMessage(command.msg.channel,Repsonse, {});


    }
    commandJoinVoice(commandObject){
        this.disnode.bot.SendMessage(commandObject.msg.channel,"Joining Voice channel", {});
      this.disnode.bot.JoinUsersVoiceChannel(commandObject.msg.server, commandObject.msg.userID);

    }
    commandRole(commandObj) {
      var self = this;
      var PrintRoles = [];
      for (var i = 0; i <  commandObj.command.roles.length; i++) {
        var role = commandObj.command.roles[i];
        PrintRoles.push(self.disnode.bot.GetRoleById(commandObj.msg.server, role).name);
      }
        if(commandObj.command.roleAllowed == true){
          self.disnode.bot.SendMessage(commandObj.msg.channel, "You're Allowed!" + PrintRoles, {});
        }else{

          self.disnode.bot.SendMessage(commandObj.msg.channel, "You're Not Allowed: " + PrintRoles, {});
        }
    }


    commandGif(command) {

        var exec = require('child_process').exec;


        var proc = exec('blender -b plugins\\TestPlugin\\test.blend --python test.py -o //images/'+command.msg.id+'/frame_ -F PNG -x 1 -a -- "' +command.params[0]+'"' , function callback(error, stdout, stderr) {

        });
        proc.on('exit', function() {
            console.log("DONE! " + new Date().getSeconds());

            var GIFEncoder = require('gifencoder');
            const async = require('async');
            var encoder = new GIFEncoder(300 , 300);
            var pngFileStream = require('png-file-stream');
            var fs = require('fs');

            var path = "./plugins/TestPlugin/images/"+ command.msg.id;

            var images = fs.readdirSync(path);

            async.each(images, function(file, callback) {
              var newName = file.replace(/0/g, "");
              fs.rename(path +'/'+ file, path +'/' + newName, callback);

            }, function(err) {
                if (err) {
                    console.log('A file failed to process', err);
                } else {
                    console.log('All files have been processed successfully');
                }
                setTimeout(function () {
                  var fsStream = fs.createWriteStream(path +'/result.gif');

                  pngFileStream(path + '/frame_?.png')
                      .pipe(encoder.createWriteStream({
                          repeat: -1,
                          delay: 0.4,
                          quality: 3
                      }))
                      .pipe(fsStream)

                  fsStream.on('finish', function() {
                    console.log("Done Creating Gif! Sending..");
                      command.msg.channel.sendMessage("test", {
                          file: path +'/result.gif'
                      }).catch(function(err){
                        console.log(err);
                      })
                  })
                }, 10);

            });
        });
    }
}

module.exports = TestPlugin;
