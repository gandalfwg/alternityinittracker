console.log("Hello World! This code runs immediately when the file is loaded.");

Hooks.on("init", function() {
  console.log("This code runs once the Foundry VTT software begins it's initialization workflow.");
});

Hooks.on("ready", function() {
  console.log("This code runs once core initialization is ready and game data is available.");
});

var combatVar;

Hooks.on("createCombatant", function(){
  console.log("createCombatant called.");
  combatVar = this;
});

function setNewCombatantInit() {
  var newCombatant = combatVar.combantants[combatVar.combantants.length - 1];
}

Hooks.on("nextTurn", function(){
  console.log("nextTurn called.");
  combatVar = this;
  createNextTurnDialog();
});

function createNextTurnDialog(){
  var diagDiv = document.createElement("div");
  diagDiv.id = "altinitdialog";
  diagDiv.classList += "app";
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
  buttonVar.addEventListener(addImpulses);
  diagDiv.appendChild(buttonVar);
  document.body.appendChild(diagDiv);
}

function addImpulses(){
  var impulseInput = document.getElementById("altinitdiagimpulse").value;
  console.log("Impulses to add: " + impulseInput.value);
  document.getElementById("altinitdialog").remove();
}

function setPrevActorInit(){

}