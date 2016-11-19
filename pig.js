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
      turnScore: 0,
    };}),
  };
}

function roll(state, diceValue = Math.floor(Math.random() * 6) + 1) {
  let currentTurnScore = state.players[state.activePlayer].turnScore;

  state.players[state.activePlayer].turnScore = diceValue === 1 ? 0 : currentTurnScore + diceValue;
  state.rolls += 1;
  return state;
}

function checkWinner(state) {
  let {activePlayer, targetScore} = state;
  let player = state.players[activePlayer];

  return player.score + player.turnScore >= targetScore ? activePlayer + 1 : 0;
}

function endTurn(state) {
  state.turns += 1;

  state.players[state.activePlayer].score += state.players[state.activePlayer].turnScore;
  state.players[state.activePlayer].turnScore = 0;

  state.activePlayer += 1;
  if (state.activePlayer === state.players.length) {state.activePlayer = 0;}

  return state;
}

module.exports = {
  init,
  roll,
  checkWinner,
  endTurn,
};
