const blessed = require("blessed");
let screen;
let log;
let stateListeners = [];
let backendHandler;

module.exports = {
  init(state) {
    screen = blessed.screen({
      smartCSR: true,
      title: "PIG",
    });

    screen.key(["escape", "q", "C-c"], function(ch, key) {
      return process.exit(0);
    });

    log = blessed.log({
      parent: screen,
      bottom: 0,
      height: (100 / (2 * state.players.length + 1)) + "%",
      width: "100%",
      label: "Log",
      tags: false,
      border: {
        type: "line"
      },
      style: {
        fg: "whilte",
        bg: "black",
        border: {
          fg: "#f0f0f0"
        }
      }
    });

    log.add("PIG v1.0");
    log.add("Q or Ctrl-C to quit");
    module.exports.showSplash(state, ()=>{
      module.exports.setUpBoard(state);
      module.exports.updateState(state);
    });
  },
  showSplash(state, cb) {
    let icon = blessed.image({
      parent: screen,
      top: 0,
      type: "ansi",
      height: 100 - (100 / (2 * state.players.length + 1)) + "%",
      left: "center",
      file: require("path").join(__dirname, "img", "pig-very-small.jpg"),
      search: false
    });

    screen.render();
    setTimeout(()=>{icon.destroy();cb(state);}, 3500);
  },
  endUI() {
    screen.destroy();
  },
  setUpBoard(state) {
    let playerBoxes = Array.from(Array(state.players.length), (e,i)=>blessed.box({
      parent: screen,
      name: "player-box-" + i,
      width: "100%",
      height: (200 / (2 * state.players.length + 1)) + "%",
      top: ((200 / (2 * state.players.length + 1)) * i) + "%",
      label: "Player " + (i + 1),
      tags: false,
      border: {
        type: "line"
      },
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "#f0f0f0"
        },
        focus: {
          border: {
            fg: "red"
          }
        }
      }
    }));

    playerBoxes.forEach((box, i)=>{
      box.key("s", keyStop.bind(null, i + 1));
      box.key("r", keyRoll.bind(null, i + 1));

      stateListeners.push((state)=>{
        if (state.activePlayer === i) {
          box.focus();
          log.add("player " + (state.activePlayer + 1) + " turn with " + state.players[state.activePlayer].turnScore);
        }
        if (state.winner) {
          box.unkey("s", keyStop);
          box.unkey("r", keyStop);
        }
        if (state.winner == i + 1) {
          box.label = "Winner!";
          log.add("Player " + state.winner + " wins!");
        }
      });

      function keyStop(player) {
        log.add(`Player ${player} stops `);
        backendHandler("stop");
      }
      function keyRoll(player) {
        log.add(`Player ${player} rolls `);
        backendHandler("roll");
      }
    });

    let playerScoreBoxes = Array.from(Array(state.players.length), (e,i)=>blessed.box({
      parent: playerBoxes[i],
      width: "50%",
      left: 0,
    }));

    let playerDiceBoxes = Array.from(Array(state.players.length), (e,i)=>blessed.box({
      parent: playerBoxes[i],
      width: "50%",
      right: 0,
    }));

    let playerInputForms = Array.from(Array(state.players.length), (e,i)=>blessed.form({
      keys: true,
      parent: playerScoreBoxes[i],
      height: "50%",
      bottom: 0
    }));

    let stopButtons = Array.from(Array(state.players.length), (e,i)=>blessed.button({
      parent: playerInputForms[i],
      name: "button-stop-player-" + i,
      content: "STOP",
      clickable: state.activePlayer === i && !state.winner,
      keyable: true,
      shrink: true,
      left: "center",
      bottom: 0,
      style: {
        bg: "grey",
        fg: "white",
        bold: true,
        focus: {
          bg: "blue"
        }
      }
    }));

    stopButtons.forEach((button, i)=>{
      button.on("click", ()=>{
        log.add("Player " + (i + 1) + " stops");
        backendHandler("stop");
      });

      stateListeners.push((state)=>{
        button.show();
        if (state.activePlayer !== i || state.winner) {button.hide();}
        if (state.winner) {button.destroy();}
      });
    });

    let rollButtons = Array.from(Array(state.players.length), (e,i)=>blessed.button({
      parent: playerInputForms[i],
      name: "button-roll-player-" + i,
      content: "ROLL",
      shrink: true,
      clickable: state.activePlayer === i && !state.winner,
      left: "center",
      keyable: true,
      top: 0,
      style: {
        bg: "grey",
        fg: "white",
        bold: true,
        focus: {
          bg: "blue"
        }
      }
    }));

    rollButtons.forEach((button, i)=>{
      button.on("click", ()=>{
        log.add("Player " + (i + 1) + " rolls");
        backendHandler("roll");
      });

      stateListeners.push((state)=>{
        button.show();
        if (state.activePlayer !== i || state.winner) {button.hide();}
        if (state.winner) {button.destroy();}
      });
    });
    let dice = Array.from(Array(state.players.length), (e,i)=>blessed.image({
      parent: playerDiceBoxes[i],
      type: "ansi",
      top: "center",
      height: "80%",
      left: "center",
      file: __dirname + "/dice-" + state.players[i].lastRoll + "-no-border.png",
      width: "100%",
    }));

    dice.forEach((die, i)=>{
      die.on("click", ()=>{
        log.add("Player " + (i + 1) + " rolls");
        backendHandler("roll");
      });
      stateListeners.push((state)=>{
        die.setImage(require("path").join(__dirname, "img", "dice-" + state.players[i].lastRoll + "-no-border.png"));
        if (state.activePlayer !== i) {die.hide();} else {die.show();}
        if (state.winner) {die.free();}
      });
    });
    let playerTables = Array.from(Array(state.players.length), (e,i)=>blessed.table({
      parent: playerScoreBoxes[i],
      left: "center",
      data: [
        ["", ""],
        ["Score", ""+state.players[i].score],
        ["Turn score", ""+state.players[i].turnScore],
      ],
      style: {
        cell: {
          bg: "grey",
          fg: "white"
        }
      }
    }));

    playerTables.forEach((table, i)=>{
      stateListeners.push((state)=>{
        table.setData([
          ["",""],
          ["Score", ""+state.players[i].score],
          ["Turn score", ""+state.players[i].turnScore],
        ]);
      });
    });

    playerBoxes[state.activePlayer].focus();

    screen.render();
    if (state.winner) {
      log.add(`Player ${state.winner} wins.`);
      screen.unkey(["r", "R", "s", "S"]);
    }
  },
  updateState(state) {
    stateListeners.forEach(listener=>listener(state));
    screen.render();
  },
  attachBackendHandler(cb) {
    backendHandler = cb;
  } ,
  log(msg) {log.add(msg);}
};
