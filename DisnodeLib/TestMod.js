"use strict"

class TestMod{
  constructor(options){
    var self = this;
    if(options.saying){
      self.saying = options.saying;
    }else{
      self.saying = "DEFAULT ";
    }

  }

  TestFunc(){
    var self = this;
    console.log("[TestMod] Test Worked: " + self.saying);
  }
}
module.exports = TestMod;
