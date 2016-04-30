"use strict"
// Command Handler Controls and Parses Every Message against a list of Commands/
// Consider the dispatcher of your app

class CommandHandler{
  // Set Inital Varibles
  // Prefix: The Command Prefix for this list.
  // List: List of Command Objects

  constructor(prefix,list){
    this.prefix = prefix;
    this.list = list;
  }

  // Parse the message and run any commands it contains
  RunMessage(msg){
    // Get the prefix
    var msgContent = msg.content;
    var firstLetter = msgContent.substring(0,1)

    // Check if it is the prefix, else ignore
    if(firstLetter == this.prefix){
      var command = "";

      // Check if the message has a space, require for command parsing
      if(CheckSpace(msgContent)){
        // Get command string as anything before the first space
        command = msgContent.substring(1,msgContent.indexOf(" "));
        console.log(command);
      }else {
        // Get the command as just the string (minus the prefix)
        command = msgContent.substring(1);
      }

      // Check if command is registered
      if(CheckForCommand(command, this.list)){
        // Get the command
        var commandObject = GetCommand(command, this.list);
        // Run the command
        commandObject.run(msg, GetParmas(msgContent));
      }
    }
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

function CheckForCommand(toSearch, list){
  for (var i = 0; i < list.length; i++) {
    if(list[i].cmd == toSearch){
      return true;
    }
  }
  return false;
}

function GetCommand(toSearch, list){
  var returnCommand;
  for (var i = 0; i < list.length; i++) {
    if(list[i].cmd == toSearch){
      returnCommand = list[i];
    }
  }
  return returnCommand;
}

function GetParmas(raw){
  var parms = [];
  var lastSpace = -1;
  var end = false;
  while(!end){
    console.log("=========== NEW PARM LOOP ==============");


    var BeginSpace = raw.indexOf(" ", lastSpace);
    var EndSpace = -1;
    if(BeginSpace != -1){
       EndSpace = raw.indexOf(" ", BeginSpace + 1);
       console.log("EndSpace: " + EndSpace);

       console.log("Begin Var State: ");
       console.log(" -- BeginSpace: " + BeginSpace);
       console.log(" -- EndSpace: " + EndSpace);
       console.log(" -- lastSpace: " + lastSpace);
       console.log("");

       if(EndSpace == -1){
         EndSpace = raw.length;
         end = true;
       }


       var param = raw.substring(BeginSpace , EndSpace);
       var containsQuoteIndex = param.indexOf('"');

       console.log(" PreQuoteCheck: ");
       console.log(" -- param: " + param );
       console.log(" -- containsQuoteIndex: " + containsQuoteIndex + "\n");

       var BeginQuote = -1;
       var EndQuote = -1;
       if(containsQuoteIndex != -1){
         BeginQuote = raw.indexOf('"', BeginSpace);

         console.log("QUOTE_FOUND");
         console.log(" -- BeginQuote: "+ BeginQuote);
         console.log(" ");
         EndQuote = raw.indexOf('"', BeginQuote + 1);

         if(EndQuote != -1){
           console.log("END_QUOTE_FOUND");
           BeginSpace = BeginQuote;
           EndSpace = EndQuote;
           param = raw.substring(BeginSpace + 1, EndSpace);
           console.log(" -- Param: " + param);
           console.log(" -- EndQuote: " + EndQuote);

           console.log(" ");
         }

       }

       lastSpace = EndSpace;

       if(param != ""){
         parms.push(param);
       }else{
         console.log("NULL_PARAM");
         console.log(" ");
       }

       console.log("End Var State: ");
       console.log(" -- BeginSpace: " + BeginSpace);
       console.log(" -- EndSpace: " + EndSpace);
       console.log(" -- lastSpace: " + lastSpace);
       console.log(" -- BeginQuote: " + BeginQuote);
       console.log(" -- EndQuote: " + EndQuote);
       console.log(" -- End: " + end);
       console.log(" ");

    }else{
      console.log("BEGIN_SPACE_NULL \n");
      end = true;
    }
  }
  return parms;
}
module.exports.CommandHandler = CommandHandler;
