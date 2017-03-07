class TestPlugin {
    constructor() {


    }
    default (command) {
      console.log(command);
        this.disnode.bot.SendMessage(command.msg.channel, "TEST", {});
    }
    commandTest(command) {
        console.log("Running");

        self.disnode.bot.SendMessage(command.msg.channel, "TEST", {});
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
