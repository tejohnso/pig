const assert = require("assert");
const pig = require("../pig.js");

describe("PIG", function() {
  it("adds dice value to player turn score or sets score to 0 on dice value 1", ()=>{
    let state = pig.init();

    pig.roll(state, 2);
    assert.equal(state.players[state.activePlayer].turnScore, 2);
    pig.roll(state, 2);
    assert.equal(state.players[state.activePlayer].turnScore, 4);
    pig.roll(state, 1);
    assert.equal(state.players[state.activePlayer].turnScore, 0);
  });

  it("indicates player 1 (having activePlayer index 0) wins when target score is reached", ()=>{
    let result = pig.checkWinner(
      {
        targetScore: 100,
        activePlayer: 0,
        players: [{turnScore: 0, score: 100}],
      }
    );
    assert.equal(result, 1);
  });

  it("indicates player 2 (having activePlayer index 1) wins when target score is reached", ()=>{
    let result = pig.checkWinner(
      {
        targetScore: 100,
        activePlayer: 1,
        players: [{turnScore: 0, score: 100}, {turnScore: 6, score: 94}],
      }
    );
    assert.equal(result, 2);
  });

  it("indicates no winner when target score is not reached", ()=>{
    let result = pig.checkWinner(
      {
        targetScore: 100,
        activePlayer: 1,
        players: [{score: 100}, {score: 99}],
      }
    );
    assert.equal(result, 0);
  });

  it("sets next active player", ()=>{
    let state = pig.init(2);
    state.activePlayer = 0;
    pig.endTurn(state);
    assert.equal(state.activePlayer, 1);
    pig.endTurn(state);
    assert.equal(state.activePlayer, 0);
  });

  it("checks if a one was rolled", ()=>{
    let state = pig.init();
    state.players[0].rolled = true;
    assert.ok(pig.rolledAOne(state));
  });

  it("can simulate a game where all players randomly hold", ()=>{
    let state = pig.init();
    let failsafe = 50000;

    do {
      failsafe--;
      if (!failsafe) {throw Error(`failed to produce a winner after ${failsafe} turns`);}
      pig.roll(state);

      if (!state.players[state.activePlayer].turnScore || Math.random() >= 0.5) {
        pig.endTurn(state);
      }
    } while (!pig.checkWinner(state));

    console.log(`Player ${pig.checkWinner(state)} wins after ${state.turns} turns and ${state.rolls} rolls.`);
  });

  it("can simulate a game where all players hold at turn score 20", ()=>{
    let state = pig.init();
    let failsafe = 50000;

    do {
      failsafe--;
      if (!failsafe) {throw Error(`failed to produce a winner after ${failsafe} turns`);}
      pig.roll(state);

      if (!state.players[state.activePlayer].turnScore || state.players[state.activePlayer].turnScore > 19) {
        pig.endTurn(state);
      }
    } while (!pig.checkWinner(state));

    console.log(`Player ${pig.checkWinner(state)} wins after ${state.turns} turns and ${state.rolls} rolls.`);
  });
});
