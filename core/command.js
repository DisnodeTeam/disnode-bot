const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
class Command {
    constructor() {
        this.commands = [];
        this.binds = [];
    }

    Load(path) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!path) {
                reject("No Path!");
            }

            var _ManagerFolders = [];

            //Load Directories. Its sync since this Function is already
            //wrapped in a Promise
            _ManagerFolders = fs.readdirSync(path);

            if (!_ManagerFolders) {
                reject("Managers Null!")
            }

            console.log("[CommandManager 'Load'] Loading Command");


            async.every(_ManagerFolders, function(folder, callback) {

                var className = folder + "-Commands.json";
                var fullPath = path + "/" + folder + "/" + className;

                async.waterfall([

                    function(callback) { //Check if file exists

                        fs.stat(fullPath, function(err, stats) {
                            if (err) {
                                console.log("[CommandManager 'Load'] Failed to find Command File (" + className + ") in: " + folder + "/" + className);
                                callback(err);
                                return;
                            } else {
                                console.log("[CommandManager 'Load'] Found Command File: " + className);
                                callback();
                            }
                        });

                    },

                    function(callback) { // Read File
                        jsonfile.readFile(fullPath, function(err, obj) {
                            if (err) {
                                callback(err, null);
                                return;
                            }
                            console.log("[CommandManager 'Load'] Loaded JSON File: " + className);
                            callback(null, obj);
                        });
                    },

                    function(imported, callback) { // Get Command
                        if (imported.commands) {
                            self.commands.push({
                                plugin: folder,
                                commands: imported.commands
                            });
                            console.log("[CommandManager 'Load'] Finished Loading: " + className);
                            callback();
                        } else {
                            callback("No Command Array");
                        }
                    },


                ], function(err, result) {
                    if (err) {
                        console.log("[CommandManager 'Load'] Error:", err);
                    }
                    callback(err, result); // Finish Waterfall
                });
            }, function(err, res) {
                console.log("[CommandManager 'Load'] Loaded " + self.commands.length + " plugin(s) commands");
                resolve();
            });
        });
    }


    AddListener(cmdID, toRun) {
        if (!cmdID || !toRun) {
            return;
        }

        binds.push({
            id: cmdID,
            run: toRun
        });

    }

    RunMessage(msgObj) {
        if (GetCommands(msg)) {
            console.log("Commands found: " + GetCommands(msg));
        }
        console.log("running MSG!");
        this.GetCommandData(msgObj, function(prefix, command, params){
            console.log("Command: " + prefix + command + params);
        });
    }

    GetCommandData(msgObj, callback) {
        var self = this;
        var msg = msgObj.content;
        var firstLetter = msg.substring(0, 1);
        console.log("Parsing: " + msg);
        if (fullCommand && firstLetter != self.prefix) {
            return;
        }

        var command = "";
        var prefixLength = "";

        if (fullCommand) {
            prefixLength = self.prefix.length;
        }
        if (!fullCommand) {
            msg = msg.substring(msg.indexOf(" ") + 1, msg.length);
        }


        var firstWord = "";
        var secondWord = "";
        //Gets Command
        if (CheckSpace(msg)) {
            var firstSpace = msg.indexOf(" ");
            var secoundSpace = msg.indexOf(" ", firstSpace + 1);

            firstWord = msg.substring(prefixLength, firstSpace);

            if (secoundSpace != -1) {
                secondWord = msg.substring(firstSpace + 1, secoundSpace);
            } else {
                secondWord = msg.substring(firstSpace + 1);
            }

            console.log(firstWord + " + " + secondWord);
        } else {
            firstWord = msg.substring(prefixLength);
        }

        var prefix = null;
        if (self.GetManagerPrefix(firstWord)) {
            command = secondWord;
            prefix = firstWord;
            console.log("PREFIX!");
        } else {
            command = firstWord;
        }


        command = command.toLowerCase();
        console.log(command);



        if (self.GetCommand(command)) {
            var cmbObject = self.GetCommand(command);

            var returnObj = {};
            returnObj.params = GetParams(msg);
            if (prefix != null) returnObj.params.splice(0, 1);
            returnObj.command = cmbObject;
            returnObj.msg = msgObj;
            console.log("FOUND!");
            if (cmbObject.response) {
                if (self.disnode.service) {
                    self.disnode.service.SendMessage(cmbObject.response, msgObj);
                }
            }
            if (prefix) {
                self.emit("Command_" + prefix + "_" + cmbObject.event, returnObj);
                console.log("Emitting: " + "Command_" + prefix + "_" + cmbObject.event);
            } else {
                self.emit("Command_" + cmbObject.event, returnObj);
                console.log("Emitting (No Prefix): " + "Command_" + cmbObject.event);
            }
        } else {
            var returnObj = {};
            returnObj.params = GetParams(msg);
            returnObj.command = command;
            returnObj.msg = msgObj;
            if (prefix) {
                self.emit("Command_" + prefix, returnObj);
                console.log("Emitting (No Command): " + "Command_" + prefix);
            } else {
                self.emit("RawCommand_" + command, returnObj);
                console.log("Emitting: " + "RawCommand_" + command);
            }

        }

    }

    GetCommands(plugin) {
        var toFind = null;
        var self = this;
        for (var i = 0; i < self.commands.length; i++) {
            if (self.commands[i].plugin == plugin) {
                toFind = self.commands[i].commands;
            }
        }

        return toFind;
    }
}

function CheckSpace(toCheck){
  if(toCheck.indexOf(" ") != -1){
    return true;
  }
  else{
    return false;
  }
}
function GetParams(raw){
  var parms = [];
  var lastSpace = -1;
  var end = false;
  while(!end){


    var BeginSpace = raw.indexOf(" ", lastSpace);
    var EndSpace = -1;
    if(BeginSpace != -1){
       EndSpace = raw.indexOf(" ", BeginSpace + 1);


       if(EndSpace == -1){
         EndSpace = raw.length;
         end = true;
       }

       var param = raw.substring(BeginSpace + 1, EndSpace);
       var containsQuoteIndex = param.indexOf('"');



       var BeginQuote = -1;
       var EndQuote = -1;
       if(containsQuoteIndex != -1){
         BeginQuote = raw.indexOf('"', BeginSpace);


         EndQuote = raw.indexOf('"', BeginQuote + 1);

         if(EndQuote != -1){
           BeginSpace = BeginQuote;
           EndSpace = EndQuote;
           param = raw.substring(BeginSpace + 1, EndSpace);


           console.log(" ");
         }
       }

       lastSpace = EndSpace;

       if(param != ""){
         parms.push(param);
       }else{

       }



    }else{
      end = true;
    }
  }
  return parms;
}

module.exports = Command;
