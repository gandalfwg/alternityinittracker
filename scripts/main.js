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

Hooks.on("updateCombat", async (combat, update, options, userId) => {
  console.log("updateCombat called.");

  const turnUpdate = !!getProperty(update, "turn");
  const roundUpdate = !!getProperty(update, "round");
  const initSkip = !!getProperty(update, "roundSkip");

  if(turnUpdate || roundUpdate) {
    if(!initSkip) {
      var updateTurn = update.turn - 1;
      if(updateTurn < 0) {
        updateTurn = game.combat.turns.length - 1;
      }
      createNextTurnDialog(game.combat.turns[updateTurn]._id);
    }
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
      longTurns.forEach(async function(val, index) {
        var j;
        var longInit = -1;
        for(j = 0; j < game.combat.turns.length; j++) {
          if(game.combat.turns[j]._id == val) {
            longInit = parseFloat(game.combat.turns[j].initiative) + 8;
            break;
          }
        }
        await game.combat.setInitiative(val, calcNewInit(longInit));
      });
    }
  }
  //update.turn => turn we're going to
  //update.turn - 1 => turn we just finished
});

function calcNewInit(init) {
  var originalInit = init;
  var init = Math.ceil(init);
  var ceilInit = Math.ceil(init);
  var i;
  for(i = 0; i < game.combat.turns.length; i++) {
    var turnInit = parseFloat(game.combat.turns[i].initiative);
    var ceilTurnInit = Math.ceil(turnInit);
    if(ceilTurnInit == ceilInit && turnInit <= init) {
      init = turnInit - .01;
    }
  }
  return init;
}

function createNextTurnDialog(id) {
  var diagDiv = document.createElement("div");
  diagDiv.id = "altinitdialog";
  diagDiv.classList += "app";
  diagDiv.setAttribute('data-turnId', id);
  var spanVar = document.createElement("span");
  spanVar.innerHTML = "How many Impulses to add?";
  diagDiv.appendChild(spanVar);
  var inputVar = document.createElement("input");
  inputVar.id = "altinitdiagimpulse";
  inputVar.type = "text";
  diagDiv.appendChild(inputVar);
  var buttonVar = document.createElement("button");
  buttonVar.type = "button";
  buttonVar.innerHTML = "Add";
  buttonVar.addEventListener("click", addImpulses);
  diagDiv.appendChild(buttonVar);
  document.body.appendChild(diagDiv);
}

async function addImpulses() {
  var impulseInputVal = document.getElementById("altinitdiagimpulse").value;
  if(impulseInputVal == "") {
    impulseInputVal = 0;
  }
  var diagDiv = document.getElementById("altinitdialog");
  var turnId = diagDiv.getAttribute("data-turnId");
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

  await game.combat.setInitiative(turn._id, calcNewInit((turnInit - impulseInputVal)));
  game.combat.startCombat();
  document.getElementById("altinitdialog").remove();
  //game.combat -- active
  //game.combats -- collection
}