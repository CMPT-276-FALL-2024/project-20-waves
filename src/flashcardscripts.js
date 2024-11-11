//Flashcard array
let flashcardInfo = [
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' },
    { front : '', back : '' }
];

//For getting the values of the flash card front and back text
const front1 = document.querySelector("#front1");
const front2 = document.querySelector("#front2");
const front3 = document.querySelector("#front3");
const front4 = document.querySelector("#front4");
const front5 = document.querySelector("#front5");
const front6 = document.querySelector("#front6");
const front7 = document.querySelector("#front7");
const front8 = document.querySelector("#front8");
const front9 = document.querySelector("#front9");
const front10 = document.querySelector("#front10");

const back1 = document.querySelector("#back1");
const back2 = document.querySelector("#back2");
const back3 = document.querySelector("#back3");
const back4 = document.querySelector("#back4");
const back5 = document.querySelector("#back5");
const back6 = document.querySelector("#back6");
const back7 = document.querySelector("#back7");
const back8 = document.querySelector("#back8");
const back9 = document.querySelector("#back9");
const back10 = document.querySelector("#back10");

//Putting the flashcard data objects into arrays
let frontFlashCardValues = [front1, front2, front3, front4, front5, front6, front7, front8, front9, front10];
let backFlashCardValues = [back1, back2, back3, back4, back5, back6, back7, back8, back9, back10];

//Variables
let flashCardNumber = 0;
let editMenuToggled = false;
let flashCardCurrentSide = "front";


//For options
const flashcardsButton = document.querySelector(".flashcards-option");
const generateQuizButton = document.querySelector(".generate-quiz-button");

//For flashcards
const flashCards = document.querySelector(".flashcard-section");
const cardNumber = document.querySelector("#flashcard-number");
const flashCardClick = document.querySelector(".flashcard-flip-clickbox");
const leftFlashCardButton = document.querySelector(".left-flashcard-button");
const rightFlashCardButton = document.querySelector(".right-flashcard-button");
const flashCardText = document.querySelector("#flashcard-front-text");
const shuffleFlashCardsButton = document.querySelector(".shuffle-flashcards-button");

//For editting the flash cards
const flashCardsEditButton = document.querySelector(".edit-flashcards-button");
const editFlashCardsMenu = document.querySelector(".edit-flashcards-menu");
const doneEditButton = document.querySelector("#done-edit-button");

//For quiz
const quiz = document.querySelector(".quiz");


//Flash card option button
flashcardsButton.addEventListener("click", () => {
   flashCards.style.display = 'inline';
   quiz.style.display = 'none';
});

//Generate quiz option button
generateQuizButton.addEventListener("click", () => {
   flashCards.style.display = 'none';
   quiz.style.display = 'grid';
   editFlashCardsMenu.style.display = 'none';
});

//Update the front of the flash card
function updateFlashCardFront() {
   flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
   cardNumber.innerHTML = (flashCardNumber + 1) + '/10';
}

//Update the text on the flash card
function updateFlashCard() {
   if (flashCardCurrentSide == "front") {

      
      flashCardText.style.animation = 'fadeOut 0.3s';
      flashCardText.style.opacity = '0';

      setTimeout(() => {
         flashCardText.innerHTML = flashcardInfo[flashCardNumber].back;

         flashCardText.style.animation = 'fadeIn 0.3s';
         flashCardText.style.opacity = '1';
      }, 300);

      flashCardCurrentSide = "back";

   } else {
      flashCardText.style.animation = 'fadeOut 0.3s';
      flashCardText.style.opacity = '0';

      setTimeout(() => {
         flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;

         flashCardText.style.animation = 'fadeIn 0.3s';
         flashCardText.style.opacity = '1';
      }, 300);

      flashCardCurrentSide = "front";
   }
}
 
//Flash card left button
rightFlashCardButton.addEventListener("click", () => {
   if (flashCardNumber == 9) {
      flashCardNumber = 0;
   } else {
      flashCardNumber++;
   }
   updateFlashCardFront();
});

//Flash card right button
leftFlashCardButton.addEventListener("click", () => {
   if (flashCardNumber == 0) {
      flashCardNumber = 9;
   } else {
      flashCardNumber--;
   }
   updateFlashCardFront();
});

//Flash card edit menu button
flashCardsEditButton.addEventListener("click", () => {
   if (!editMenuToggled) {
      editFlashCardsMenu.style.animation = 'fadeIn 0.3s';
      editFlashCardsMenu.style.display = 'flex';
      doneEditButton.style.display = 'inline';
      editMenuToggled = true;
   } else {
      editFlashCardsMenu.style.animation = 'fadeOut 0.3s';

      setTimeout(() => {
         editFlashCardsMenu.style.display = 'none';
      }, 300);

      doneEditButton.style.display = 'none';
      editMenuToggled = false;
   }
});

//For shuffling the flashcard array when the shuffle button is clicked
shuffleFlashCardsButton.addEventListener("click", shuffleFlashCards);

//For when the flash card is clicked to turn it around
flashCardClick.addEventListener("click", updateFlashCard);

//Done editting flash cards button
doneEditButton.addEventListener("click", () => {
   for (let i = 0; i < 10; i++) {
      flashcardInfo[i].front = frontFlashCardValues[i].value;
      flashcardInfo[i].back = backFlashCardValues[i].value;
   }
   updateFlashCardFront();
});

//For shuffling the flash cards
function shuffleFlashCards() {
   for (let i = 0; i < 10; i++) {
      let randomNumber = Math.floor(Math.random() * 10);

      let tempfront = flashcardInfo[i].front;
      let tempback = flashcardInfo[i].back;

      flashcardInfo[i].front = flashcardInfo[randomNumber].front;
      flashcardInfo[i].back = flashcardInfo[randomNumber].back;

      flashcardInfo[randomNumber].front = tempfront;
      flashcardInfo[randomNumber].back = tempback;
   }
}