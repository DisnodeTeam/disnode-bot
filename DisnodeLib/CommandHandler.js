"use strict"
// Command Handler Controls and Parses Every Message against a list of Commands/
// Consider the dispatcher of your app
const colors = require('colors');
class CommandHandler{
  // Set Inital Varibles
  // Prefix: The Command Prefix for this list.
  // List: List of Command Objects

  constructor(options){

    this.prefix = options.prefix;
    this.contexts = [];
    this.list = [];
    console.log("[CommandHandler] Loaded!".green);
  }

  LoadList(newList){

    console.log("[CommandHandler] Loading Commands...");
    var self = this;

    for (var i = 0; i < newList.length; i++) {

      var currentCmd = newList[i];

      var SUCCESS = true;
      var FailReason;
      // RUN: context[commandObject.run]({msg: msg, params:GetParmas(msgContent)});
      var Context = GetContextByName(self.contexts, currentCmd.context);
      if(Context){

        if(currentCmd.require){
          if(CheckRequirements(Context.obj, currentCmd.require)){
            self.list.push(currentCmd);
            SUCCESS = true;
          }else{
            SUCCESS = false;
            FailReason = "Missing Requirements: " + currentCmd.require;
          }
        }else{
          self.list.push(currentCmd);
          SUCCESS = true;

        }
      }else{
        SUCCESS = false;
          FailReason = "No Context: " + currentCmd.context;
      }

      if(SUCCESS)
      {
        console.log(colors.green("[CommandHandler] Adding Command ("+currentCmd.cmd+") SUCCESSFUL!"));
      }else{
        console.log(colors.red("[CommandHandler] Adding Command ("+currentCmd.cmd+") FAILED: " + FailReason));
      }

    }
  }

  AddContext(context, name){
    var self = this;
    self.contexts.push({name: name, obj: context});
    console.log("[CommandHandler] Adding new Context: ".cyan + name);
  }

  AddCommand(currentCmd)
  {
    var Context = GetContextByName(self.contexts, currentCmd.context);
    if(Context){

      if(currentCmd.require){
        if(CheckRequirements(Context.obj, currentCmd.require)){
          self.list.push(currentCmd);
          console.log("[CommandHandler] |----- SUCCESS: Met Requirements");
        }else{
          console.log("[CommandHandler] |----- FAIL: Missing Requirements");
        }
      }else{
        self.list.push(currentCmd);
        console.log(i);
        console.log("[CommandHandler] |----- SUCCESS: No Requirements");

      }
    }else{
      console.log("[CommandHandler] |----- FAILED: No Context with Name:" + currentCmd.context);
    }
  }
  // Parse the message and run any commands it contains
  RunMessage(msg){
    // Get the prefix
    var self = this;
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
        console.log(commandObject.run);

        var context = GetContextByName(self.contexts,commandObject.context).obj;
        if(context){
          if(commandObject.params){
            context[commandObject.run]({msg: msg, params:GetParmas(msgContent)}, commandObject.params);
          }else{
            context[commandObject.run]({msg: msg, params:GetParmas(msgContent)});
          }

        }
      }
    }
  }
}

function CheckRequirements(context, requirements){
  var foundAllRequires = true;

  for(var i=0;i<requirements.length;i++){
    if(!context[requirements[i]]){
      foundAllRequires = false;
    }
  }

  return foundAllRequires;
}

function GetContextByName(list, name){
  var found;
  for (var i = 0; i < list.length; i++) {
    if(list[i].name == name){
      found =list[i];
    }
  }

  return found;
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
module.exports = CommandHandler;
