const Logging = require("./logging")
const jsonfile = require('jsonfile');
const async = require('async');
const fs = require('fs');
class DB{
  constructor(){
    Logging.DisnodeInfo("DB", "Constructor", "Started!")
    this.DataBase = [];
  }

  Set(plugin,key,value){
    var self = this;
    console.log(self.GetData(plugin));
    return new Promise(function(resolve, reject) {
      if(self.GetData(plugin)){
        self.GetData(plugin).data[key] = value
      }else{
        var newEntry = {plugin: plugin, data:{}};
        newEntry.data[key] = value;
        self.DataBase.push(newEntry)
      }
      resolve(self.DataBase)
    });
  }

  Add(plugin,key,value){
    var self = this;
    console.log(self.GetData(plugin));
    return new Promise(function(resolve, reject) {
      if(self.GetData(plugin)){
        if(!self.GetData(plugin).data[key]){
          self.GetData(plugin).data[key] = [];
        }
        self.GetData(plugin).data[key].push(value);

      }else{
        var newEntry = {plugin: plugin, data:{}};
        if(!newEntry.data[key]){
          newEntry.data[key] = [];
        }
        newEntry.data[key].push(value);
        self.DataBase.push(newEntry)
      }
      resolve(self.DataBase)
    });
  }

  Get(plugin,key,value){
    var self = this;
    console.log(self.GetData(plugin));
    return new Promise(function(resolve, reject) {
      if(self.GetData(plugin)){
        if(self.GetData(plugin).data[key]){
            resolve(self.GetData(plugin).data[key]);
        }
        reject("No DB Entry for this key!")
      }else{
        reject("No DB For This Plugin!")
      }
    });
  }

  GetData(name){
    var self = this;
    for (var i = 0; i < self.DataBase.length; i++) {
      if(self.DataBase[i].plugin == name){
        return self.DataBase[i] ;
      }
    }
  }

}

module.exports = DB;
