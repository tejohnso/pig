function init(playerCount = 2) {
  return {
    targetScore: 100,
    currentTurn: 0,
    turns: 0,
    rolls: 0,
    activePlayer: Math.floor(Math.random() * playerCount),
    players: Array(playerCount).fill("").map(e=>{return {
      name: "Player",
      score: 0,
      lastRoll: 1,
      turnScore: 0,
      rolled: false,
    };}),
  };
}

function roll(state, diceValue = Math.floor(Math.random() * 6) + 1) {
  let player = state.players[state.activePlayer];
  let currentTurnScore = state.players[state.activePlayer].turnScore;

  player.lastRoll = diceValue;
  player.turnScore = diceValue === 1 ? 0 : currentTurnScore + diceValue;
  player.rolled = true;
  state.rolls += 1;
  return state;
}

function checkWinner(state) {
  let {activePlayer, targetScore} = state;
  let player = state.players[activePlayer];

  return player.score + player.turnScore >= targetScore ? activePlayer + 1 : 0;
}

function endTurn(state) {
  let player = state.players[state.activePlayer];
  state.turns += 1;

  player.score += state.players[state.activePlayer].turnScore;
  player.turnScore = 0;

  state.activePlayer += 1;
  if (state.activePlayer === state.players.length) {state.activePlayer = 0;}
  player.rolled = false;

  return state;
}

function rolledAOne(state) {
  let player = state.players[state.activePlayer];
  return player.rolled && player.turnScore === 0;
}

module.exports = {
  init,
  roll,
  checkWinner,
  endTurn,
  rolledAOne,
};
