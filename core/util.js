var Logger = require("disnode-logger");
var Axios = require('axios');
/**
 * Useful functions
 * @constructor
 * @param {DisnodeObj} disnode - Refrence to Disnode Class (disnode.js)
 */
class Util {
    constructor(disnode) {
        this.disnode = disnode;
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
}

module.exports = Util;