var Logger = require("disnode-logger");
var Axios = require('axios');
var Hex2RGB = require('hex-rgb-converter');
/**
 * Useful functions
 * @constructor
 * @param {DisnodeObj} disnode - Refrence to Disnode Class (disnode.js)
 */
class Util {
    constructor(disnode) {
        this.disnode = disnode;
        this.plugininstances = 0;
    }
    avatarCommandUser(command) {
      var self = this;
      if (command.msg.author.avatar != null) {
        if (command.msg.author.avatar.indexOf('_') > -1) {
          return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.author.id + "\/" + command.msg.author.avatar + ".gif";
        } else {
          return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.author.id + "\/" + command.msg.author.avatar + ".png";
        }
      }
    }

    /**
     * Converts an array to and object using a key as the object name. Useful for quick object look up
     * @example
     * var array =  [{id:"123", name: "Phil", age: 21}, {id:"456", name: "Fire", age: 22}]
     * var object = this.disnode.util.arrayToObject(array, "id"); //Can also use nested properties like 'user.id' in {user: {id: 123}}
     * //object = {123: {name: "Phil", age: 21}, 456: { name: "Fire", age: 22 }}
     * //Easily look up via ID using: object[id]
     * @return {Object} Converted Object
     */
    arrayToOject(array, selector) {
        var obj = {};
        for (var i = 0; i < array.length; i++) {

            var key = this.ObjectbyString(array[i], selector);
            obj[key] = array[i];

        }
        return obj;
    }
    /**
     * Convers a Snowflake ID to a JS Date Object
     * @param {String} resourceID - The Snowflake ID you want to convert
     * @return {Date} Converted Date
     */
    GetSnowflakeDate(resourceID) {
      return new Date(parseInt(resourceID) / 4194304 + 1420070400000);
    }

    CommandHelpBuilder(command, description){
      return "`" + this.disnode.botConfig.prefix + command + "` - **" + description + "**";
    }
    ObjectbyString(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, ''); // strip a leading dot
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
    /**
     * Pagify results
     * @param {array} arr - Array to be paged
     * @param {integer} page - Page number
     * @param {integer} perPage - Results per page
     */
    pageResults(arr, page, perPage = 10) {
      var returnArr = [];
      var maxindex;
      var startindex;
      if (page == 1) {
        page = 1;
        startindex = 0
        maxindex = perPage;
      } else {
        maxindex = (page * perPage);
        startindex = maxindex - perPage;
      }
      for (var i = startindex; i < arr.length; i++) {
        if (i == maxindex) break;
        returnArr.push(arr[i]);
      }
      return returnArr;
    }
    JoinParams(params, startIndex = 0){
      var finalParams = [];

      for(var i=0;i<params.length;i++){
        if(i >startIndex && i < endIndex){
          finalParams[startIndex] += " " +  params[i];
        }else{
          finalParams.push(params[i]);
        }
      }

      return finalParams;
    }
    CountInstance(){
      var self = this;
      self.plugininstances++;
    }
    ReturnInstances(){
      var self = this;
      return self.plugininstances;
    }
    RGBInt(hexcode) {
      var rgb = Hex2RGB.toRGB(hexcode);
      var res = (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2]);
      return res;
   }
}

module.exports = Util;
