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
    //game.combat.setInitiative(update.id, calcNewInit(update.id, -1));
    game.combat.setInitiative(update.id, 0);
    createNextTurnDialog(update.id);
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
    //if(!game.combat.turns[update.turn].initiative) {
    //  return;
    //}
    if(document.getElementsByClassName("app window-app dialog") && document.getElementsByClassName("app window-app dialog").length > 0) {
      return;
    }
    await createNextTurnDialog(game.combat.turns[updateTurn].id);
    var currTurn = game.combat.turns[update.turn];
    var currInit = parseFloat(currTurn.initiative);
    if(currInit < -8) {
      var i;
      var longTurns = [];
      for(i = 0; i < game.combat.turns.length; i++) {
        var turnInit = parseFloat(game.combat.turns[i].initiative);
        if(turnInit <= -8) {
          longTurns.push(game.combat.turns[i].id);
        }
      }
      if(longTurns.length < game.combat.turns.length) {
        return;
      }
      longTurns.forEach(async function(val, index) {
        var j;
        var longInit = -1;
        for(j = 0; j < game.combat.turns.length; j++) {
          if(game.combat.turns[j].id == val) {
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
    if(game.combat.turns[i].id == id) {
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
  if(!game.user.isGM) {
    return;
  }
  if(document.getElementsByClassName("app window-app dialog") && document.getElementsByClassName("app window-app dialog").length > 0) {
    return;
  }
  await new Promise(resolve => {
    new Dialog({
      title: "Add Impulses",
      content: "<div class'blah'></div>",
      buttons: {
        One: {
          label: "1",
          //icon: "one",
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
        }
      },
      default: "One",
      close: () => resolve(resolve(this.addImpulses(0, id)))
    }).render(true);
  });
}

async function closeNextTurnDiag() {
  document.getElementById("altinitdialog").remove();
  return;
}

async function addImpulses(impulseInputVal, turnId) {
  if(impulseInputVal === 0) {
    game.combat.startCombat();
    return;
  }
  var turn;
  var i;
  for(i = 0; i < game.combat.turns.length; i++) {
    if(game.combat.turns[i].id == turnId) {
      turn = game.combat.turns[i];
      break;
    }
  }
  console.log("Impulses to add: " + impulseInputVal + " to " + turn.name);
  var turnInit = turn.initiative;
  if(turnInit > 0) {
    turnInit = 0;
  }
  turnInit = parseFloat(turnInit);
  impulseInputVal = parseFloat(impulseInputVal);

  await game.combat.setInitiative(turn.id, calcNewInit(turn.id, (turnInit - impulseInputVal)));
  game.combat.startCombat();
  //game.combat -- active
  //game.combats -- collection
}