const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pig = require("./pig.js");

let state = pig.init();

function main() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(JSON.stringify(state, null, 2));

  if (pig.checkWinner(state)) {
    process.stdout.write(`\nPlayer ${pig.checkWinner(state)} wins!\n`);
    rl.close();
    return;
  }

  rl.question(`Player ${state.activePlayer+1}: roll [y/n]? `, (yn)=>{
    yn = yn.toLowerCase();

    if (yn === "y") {
      pig.roll(state);
    }

    if (yn === "n" || pig.rolledAOne(state)) {
      pig.endTurn(state);
    }

    main();
  });
}

main();
