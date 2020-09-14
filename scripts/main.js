console.log("Hello World! This code runs immediately when the file is loaded.");

Hooks.on("init", function() {
  console.log("This code runs once the Foundry VTT software begins it's initialization workflow.");
});

Hooks.on("ready", function() {
  console.log("This code runs once core initialization is ready and game data is available.");
});

Hooks.on("createCombatant", function() {
  console.log("createCombatant called.");
});

Hooks.on("updateCombatant", (combat, combatant, update, userId) => {
  console.log("updateCombatant called");

  const initUpdate = !!getProperty(update, "initiative");

  if(initUpdate && combatant.initiative >= 1) {
    //game.combat.setInitiative(update._id, calcNewInit(update._id, -1));
    game.combat.setInitiative(update._id, 0);
    createNextTurnDialog(update._id);
  }
});

Hooks.on("updateCombat", async (combat, update, options, userId) => {
  console.log("updateCombat called.");

  const turnUpdate = !!getProperty(update, "turn");
  const roundUpdate = !!getProperty(update, "round");
  if(!game.user.isGM) {
    return;
  }

  if(turnUpdate || roundUpdate) {
    var updateTurn = update.turn - 1;
    if(updateTurn < 0) {
      updateTurn = game.combat.turns.length - 1;
    }
    if(!game.combat.turns[update.turn].initiative) {
      return;
    }
    if(document.getElementById("altinitdialog") != null) {
      return;
    }
    await createNextTurnDialog(game.combat.turns[updateTurn]._id);
    var currTurn = game.combat.turns[update.turn];
    var currInit = parseFloat(currTurn.initiative);
    if(currInit < -8) {
      var i;
      var longTurns = [];
      for(i = 0; i < game.combat.turns.length; i++) {
        var turnInit = parseFloat(game.combat.turns[i].initiative);
        if(turnInit <= -8) {
          longTurns.push(game.combat.turns[i]._id);
        }
      }
      if(longTurns.length < game.combat.turns.length) {
        return;
      }
      longTurns.forEach(async function(val, index) {
        var j;
        var longInit = -1;
        for(j = 0; j < game.combat.turns.length; j++) {
          if(game.combat.turns[j]._id == val) {
            longInit = parseFloat(game.combat.turns[j].initiative) + 8;
            break;
          }
        }
        await game.combat.setInitiative(val, longInit);
      });
    }
  }
  //update.turn => turn we're going to
  //update.turn - 1 => turn we just finished
});

async function altSetInit(id, newInit) {
  await game.combat.setInitiative(id, calcNewInit(id, newInit));
}

function calcNewInit(id, init) {
  var originalInit = init;
  var init = Math.ceil(init);
  var ceilInit = Math.ceil(init);
  var i;
  for(i = 0; i < game.combat.turns.length; i++) {
    if(game.combat.turns[i]._id == id) {
      continue;
    }
    var turnInit = parseFloat(game.combat.turns[i].initiative);
    var ceilTurnInit = Math.ceil(turnInit);
    if(ceilTurnInit == ceilInit && turnInit <= init) {
      init = turnInit - .01;
    }
  }
  return init;
}

async function createNextTurnDialog(id) {
  const html = "";
  await new Promise(resolve => {
    new Dialog({
      title: "Add Impulses",
      content = html,
      buttons: {
        One: {
          label: "1",
          callback: () => resolve(this.addImpulses(1, id))
        },
        Two: {
          label: "2",
          callback: () => resolve(this.addImpulses(2, id))
        },
        Three: {
          label: "3",
          callback: () => resolve(this.addImpulses(3, id))
        },
        Four: {
          label: "4",
          callback: () => resolve(this.addImpulses(4, id))
        },
        Five: {
          label: "5",
          callback: () => resolve(this.addImpulses(5, id))
        },
        Six: {
          label: "6",
          callback: () => resolve(this.addImpulses(6, id))
        },
        Seven: {
          label: "7",
          callback: () => resolve(this.addImpulses(7, id))
        },
        Eight: {
          label: "8",
          callback: () => resolve(this.addImpulses(8, id))
        },
        Nine: {
          label: "9",
          callback: () => resolve(this.addImpulses(9, id))
        },
        Ten: {
          label: "10",
          callback: () => resolve(this.addImpulses(10, id))
        },
        Eleven: {
          label: "11",
          callback: () => resolve(this.addImpulses(11, id))
        },
        Twelve: {
          label: "12",
          callback: () => resolve(this.addImpulses(12, id))
        },
        Thirteen: {
          label: "13",
          callback: () => resolve(this.addImpulses(13, id))
        },
        Fourteen: {
          label: "14",
          callback: () => resolve(this.addImpulses(14, id))
        },
        Fifteen: {
          label: "15",
          callback: () => resolve(this.addImpulses(15, id))
        },
        Sixteen: {
          label: "16",
          callback: () => resolve(this.addImpulses(16, id))
        }
      },
      default: "normal",
      close: () => resolve(null)
    }).render(true);
  });
}

async function closeNextTurnDiag() {
  document.getElementById("altinitdialog").remove();
  return;
}

async function addImpulses(impulseInputVal, turnId) {
  var turn;
  var i;
  for(i = 0; i < game.combat.turns.length; i++) {
    if(game.combat.turns[i]._id == turnId) {
      turn = game.combat.turns[i];
      break;
    }
  }
  console.log("Impulses to add: " + impulseInputVal + " to " + turn.name);
  var turnInit = turn.initiative;
  turnInit = parseFloat(turnInit);
  impulseInputVal = parseFloat(impulseInputVal);

  await game.combat.setInitiative(turn._id, calcNewInit(turn._id, (turnInit - impulseInputVal)));
  game.combat.startCombat();
  document.getElementById("altinitdialog").remove();
  //game.combat -- active
  //game.combats -- collection
}