//For Flashcards

let flashcardInfo = [
    { front : 'front text1', back : 'backtext' },
    { front : 'front text2', back : 'backtext' },
    { front : 'front text3', back : 'backtext' },
    { front : 'front text4', back : 'backtext' },
    { front : 'front text5', back : 'backtext' },
    { front : 'front text6', back : 'backtext' },
    { front : 'front text7', back : 'backtext' },
    { front : 'front text8', back : 'backtext' },
    { front : 'front text9', back : 'backtext' },
    { front : 'front text10', back : 'backtext' }
];

let flashCardNumber = -1;

//For options on practice page
const flashcardsButton = document.querySelector(".flashcards-option");
const generateQuizButton = document.querySelector(".generate-quiz-button");
const flashCards = document.querySelector(".flashcard-section");
const flashCardsEditButton = document.querySelector("#edit-flashcards-button");
const editFlashCardsMenu = document.querySelector(".edit-flashcards-menu");
const quiz = document.querySelector(".quiz");

//Number that appears out of 10 at the top of the flash card
const cardNumber = document.querySelector("#flashcard-number");




//For flashcard left and right buttons
const leftFlashCardButton = document.querySelector("#left-flashcard-button");
const rightFlashCardButton = document.querySelector("#right-flashcard-button");

const flashCardText = document.querySelector("#flashcard-front-text");

rightFlashCardButton.addEventListener("click", () => {
   if (flashCardNumber == 9) {
      flashCardNumber = 0;
   } else {
      flashCardNumber++;
   }
   updateFlashCard();
});

leftFlashCardButton.addEventListener("click", () => {
   if (flashCardNumber == 0) {
      flashCardNumber = 9;
   } else {
      flashCardNumber--;
   }
   updateFlashCard();
});

function updateFlashCard() {
   flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
   cardNumber.innerHTML = (flashCardNumber + 1) + '/10';
}





//Button change colours
flashcardsButton.addEventListener("mouseover", () => {
   flashcardsButton.style.backgroundColor = 'darkgray';
});

flashcardsButton.addEventListener("mouseout", () => {
    flashcardsButton.style.backgroundColor = 'lightgray';
 });

 generateQuizButton.addEventListener("mouseover", () => {
    generateQuizButton.style.backgroundColor = 'darkgray';
 });
 
 generateQuizButton.addEventListener("mouseout", () => {
    generateQuizButton.style.backgroundColor = 'lightgray';
  });


flashCardsEditButton.addEventListener("mouseover", () => {
   flashCardsEditButton.style.backgroundColor = 'darkgray';
});

flashCardsEditButton.addEventListener("mouseout", () => {
   flashCardsEditButton.style.backgroundColor = 'lightgray';
});


 

 flashcardsButton.addEventListener("click", () => {
    flashCards.style.display = 'inline';
    quiz.style.display = 'none';
 });

 generateQuizButton.addEventListener("click", () => {
    flashCards.style.display = 'none';
    quiz.style.display = 'grid';
    editFlashCardsMenu.style.display = 'none';
 });


 //For flashcard edit menu
let menuToggled = false;

function toggleMenu() {
   if (!menuToggled) {
      editFlashCardsMenu.style.display = 'flex';
      menuToggled = true;
   } else {
      editFlashCardsMenu.style.display = 'none';
      menuToggled = false;
   }
}

 flashCardsEditButton.addEventListener("click", toggleMenu);




