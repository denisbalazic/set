let buttons = document.querySelector("#players");


let deck = [];
let table = [];
let selectedIndexes = [];
let selectedCards = [];
let numOfCards = 81;
let numOfSelected = 0;
let score = 0;

const colors = ["255, 0, 0", "0, 128, 0", "0, 0, 200"];
const shapes = ["0px", "25% / 50%", "20% 80% 20% 80% / 0% 100% 0% 100%"];
const fills = ["0", "0.2", "1"];

init();

function init() {
  createDeck();
  let hasSet = false;
  while(!hasSet){
    table = pickRandomCards(12);
    hasSet = checkTable(table);
  }
  // pass in copy of table as argument so it can be manipulated in function leaving table arr intact
  populateTable([...table]);
}


/**************************************************************
 * Create deck of cards permutating 4 different characteristics
 * each with 3 different values
 */
function createDeck() {
  let cardNo = 1;
  for(let i = 0; i < 3; i++) {
    let repeat = i + 1;
    for(let j = 0; j < 3; j++) {
      let color = colors[j];
      for(let k = 0; k < 3; k++) {
        let shape = shapes[k];
        for(let l = 0; l < 3; l++) {
          let fill = fills[l];
          let cardObj = {
            color: color,
            repeat: repeat,
            shape: shape,
            fill: fill,
            cardNo: cardNo
          };
          deck.push(cardObj);
          cardNo += 1;
        }
      }
    }
  }
}


/*************************************************************
 * Return one randomly picked card object, remove it from deck
 * and decrease number of cards in deck by 1
 */
function pickRandomCards(num) {
  let randCards = [];
  for(let i = 0; i < num; i++) {
    let rand = Math.floor(Math.random() * numOfCards);
    numOfCards -= 1;
    randCards.push(deck.splice(rand, 1)[0]); // this removes card from deck
  }
  return randCards;
}

/*************************************
 * Populate empty card-containers with 
 * randomly selected cards from deck
 */
function populateTable(cards) {
  const cardContainers = document.querySelectorAll(".card-container");
  const cardContainersArr = [...cardContainers];  // nodeList to array
  const emptyCardContainers = cardContainersArr.filter(container => !container.firstChild);
  for (cardContainer of emptyCardContainers) {
    const newCard = createCard(cards.shift());
    cardContainer.append(newCard);
  }
}

/*********************************************
 * Create one card in DOM with characteristics
 * given from card object
 */
function createCard(cardObj) {
  const newCard = document.createElement("div");
  newCard.classList.add("card");
  newCard.id = cardObj.cardNo;
  // creates required number of symbols (1, 2 or 3) for one card
  for(let i = 0; i < cardObj.repeat; i++) {
    const symbol = document.createElement("div");
    symbol.classList.add("symbol");
    symbol.style.border = `2px solid rgb(${cardObj.color})`;
    symbol.style.backgroundColor = `rgba(${cardObj.color}, ${cardObj.fill})`;
    symbol.style.borderRadius = cardObj.shape;
    newCard.append(symbol);
  }
  newCard.addEventListener("click", selectCard);
  return newCard;
}

/**************************************************
 * Execute when card is selected
 * Add to set, check if set is correct
 */
function selectCard(e) {
  numOfSelected += 1;  
  let selectedCard = e.target.closest(".card");
  selectedCard.classList.add("selected");
  selectedCards.push(selectedCard);
  let id = parseInt(selectedCard.id);
  let index = table.map(card => card.cardNo).indexOf(id);
  selectedIndexes.push(index);
  // selectedCardObjs.push(table.splice(index, 1, "placeholder")[0]);
  // let selectedCardObj = table.filter(card => card.cardNo === id)[0].isSelected = true;
  // selectedCardObjs.push(selectedCardObj);
  console.log(table);
  console.log(selectedIndexes);
  // when set of 3 cards is selected 
  if(numOfSelected === 3) {
    if(checkSet(...selectedIndexes)) {
      setCorrect();
    } else {
      resetIncorect();
    }    
  }
}

/*********************************
 * Style selected cards and
 * enable buttons for adding score
 */
function setCorrect() {
  for (card of selectedCards) {
    card.classList.add("isSet");
  }
  let tableCards = document.querySelectorAll(".card");
  for (card of tableCards) {
    card.removeEventListener("click", selectCard);
  }
  buttons.addEventListener("click", addWinner);
}

/****************************************************
 * Do stuff when winner is decided by pressing button
 */
function addWinner(e) {
  let score = parseInt(e.target.innerText) || 0;
  score += 1;
  e.target.innerText = score;
  buttons.removeEventListener("click", addWinner);
  for(card of selectedCards) {
    card.remove();
  }
  let newHand = [];
  let hasSet = false;
  while(!hasSet) {
    newHand = pickRandomCards(3);
    let i = 0;
    for(index of selectedIndexes) {
      table[index] = newHand[i];
      i++;
      // table.splice(index, 1, card);
    }
    hasSet = checkTable(table);
    // !hasSet && table.splice(-3, 3);
  }
  populateTable(newHand);
  let tableCards = document.querySelectorAll(".card");
  for(card of tableCards) {
    card.addEventListener("click", selectCard);
  }
  selectedCards = [];
  selectedIndexes = [];
  numOfSelected = 0;
}

/*****************************************
 * Style selected cards and reset for play
 */
function resetIncorect() {
  for (card of selectedCards) {
    card.classList.add("isNotSet");
  }
  setTimeout(function () {
    for (card of selectedCards) {
      card.classList.remove("selected");
      card.classList.remove("isNotSet");
    }
    selectedCards = [];
    selectedIndexes = [];
    numOfSelected = 0;
  }, 1000);
}





/******************************************
 * Check for correctness of set
 */
function checkSet(a, b, c) {
  let characteristics = ["color", "shape", "repeat", "fill"];
  let isSet = characteristics.every(char =>
    (table[a][char] === table[b][char] 
    && table[b][char] === table[c][char])
    || 
    (table[a][char] !== table[b][char] 
    && table[b][char] !== table[c][char] 
    && table[c][char] !== table[a][char])
  );
  return isSet;
}

/********************************************
 * Check if there is set on the table
 */
function checkTable(tableCardObjs) {
  let setIsFound = false;
  for(let i = 0; i < tableCardObjs.length - 2; i++) {
    for(let j = i + 1; j < tableCardObjs.length - 1; j++) {
      for(let k = j + 1; k < tableCardObjs.length; k++) {
        setIsFound = checkSet(i, j, k);
        if(setIsFound || (i === 9 && j === 10 && k === 11)) {
          console.log(i, j, k);
          console.log(tableCardObjs[i].cardNo);
          console.log(tableCardObjs[j].cardNo);
          console.log(tableCardObjs[k].cardNo);
          return setIsFound;
        }
      }
    }
  }
}