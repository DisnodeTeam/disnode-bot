var CurrentFeeling;
var Greetings = [
  {msg:"hi.. :( ", feeling: 0.1},
  {msg:"hi.", feeling: 0.2},
  {msg:"hey...", feeling: 0.3},
  {msg:"Hey.", feeling: 0.4},
  {msg:"Hello.", feeling: 0.5},
  {msg:"Hey o/.", feeling: 0.6},
  {msg:"Hi!", feeling: 0.7},
  {msg:"Sup. XD", feeling: 0.8},
  {msg:"Helloow !", feeling: 0.9},
  {msg:"Helloowww World :) :) ", feeling: 1},
];

var Feeling = [
  {feeling:"depressed", val: "0.1"},
  {feeling:"miserable", val: "0.2"},
  {feeling:"sad", val: "0.3"},
  {feeling:"downed", val: "0.4"},
  {feeling:"all right", val: "0.5"},
  {feeling:"fine", val: "0.6"},
  {feeling:"good", val: "0.8"},
  {feeling:"happy", val: "0.9"},
  {feeling:"great", val: "1"},
];

CurrentFeeling = random(0.1,1);
console.log("Feeling: " + CurrentFeeling);


function getGreeting() {
  for (var i = 0; i < Greetings.length; i++) {
    if(Greetings[i].feeling == Math.round(CurrentFeeling * 10) / 10){
      return Greetings[i];
    }
  }
}
function getCurrentFeeling() {
  for (var i = 0; i < Feeling.length; i++) {
    if(Feeling[i].val == Math.round(CurrentFeeling * 10) / 10){
      return Feeling[i];
    }
  }
}


function random (low, high) {
    return Math.random() * (high - low) + low;
}

module.exports.getGreeting = getGreeting;
module.exports.getCurrentFeeling = getCurrentFeeling;
