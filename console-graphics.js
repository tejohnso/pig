const pig = require("./pig.js");
const ui = require("./ui/console.js");

let state = pig.init();

ui.init(state);
ui.attachBackendHandler((event)=>{
  eventHandlers[event]();
});

let eventHandlers = {
  roll() {
    pig.roll(state);
    state.winner = pig.checkWinner(state);
    if (pig.rolledAOne(state)) {
      ui.log("PIG!");
      pig.endTurn(state);
    }
    ui.updateState(state);
  },
  stop() {
    pig.endTurn(state);
    ui.updateState(state);
  }
};
