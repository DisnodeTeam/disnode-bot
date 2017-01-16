const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
class Command {
    constructor() {

        //test
        this.prefix = "!";

        this.commands = [];
        this.binds = [];
    }

    Load(path) {
        var self = this;

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
        console.log("running MSG!");
        this.GetCommandData(msgObj,true, function(prefix, command, params){
            console.log("Command: " + prefix + command + params);
        });
    }

    GetCommandData(msgObj, fullCommand, callback) {
        var self = this;
        var msg = msgObj.content;
        var firstLetter = msg.substring(0, 1);


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
