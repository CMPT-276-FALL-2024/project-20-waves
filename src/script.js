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

//For options on practice page
const flashcardsButton = document.querySelector(".flashcards-option");
const flashCards = document.querySelector(".flashcard")

flashcardsButton.addEventListener("mouseover", () => {
   flashcardsButton.style.backgroundColor = 'darkgray';
});

flashcardsButton.addEventListener("mouseout", () => {
    flashcardsButton.style.backgroundColor = 'lightgray';
 });

 flashcardsButton.addEventListener("click", () => {
    flashCards.style.display = 'inline';
 })

