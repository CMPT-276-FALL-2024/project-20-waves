//For Flashcards

let flashcardInfo = [
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' },
    { front : 'frontext', back : 'backtext' }
];

let flashCardNumber = 1;

//For options on practice page
const flashcardsButton = document.querySelector(".flashcards-option");
const generateQuizButton = document.querySelector(".generate-quiz-button");
const flashCards = document.querySelector(".flashcard");
const quiz = document.querySelector(".quiz");

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
 

 flashcardsButton.addEventListener("click", () => {
    flashCards.style.display = 'inline';
    quiz.style.display = 'none';
 });

 generateQuizButton.addEventListener("click", () => {
    flashCards.style.display = 'none';
    quiz.style.display = 'grid';
 });




