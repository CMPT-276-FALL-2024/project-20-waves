test('Flash card front updates', () => {
    document.body.innerHTML = `
        <div id="flashcard-number"></div>
        <div id="flashcard-front-text"></div>
    `;

    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' }
    ];

    let flashCardNumber = 0;


    const flashCardText = document.getElementById('flashcard-front-text');
    const cardNumber = document.getElementById('flashcard-number');


    //Update the front of the flash card
    function updateFlashCardFront() {
        flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
        cardNumber.innerHTML = (flashCardNumber + 1) + '/10';
    }

    updateFlashCardFront();

    expect(flashCardText.innerHTML).toBe('front 1');
    expect(cardNumber.innerHTML).toBe('1/10');
});

test('Flash card displays back from front when switching', () => {
    document.body.innerHTML = `
        <div id="flashcard-front-text"></div>
    `;

    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' }
    ];

    let flashCardCurrentSide = 'front';
    let flashCardNumber = 0;

    const flashCardText = document.getElementById('flashcard-front-text');


    function updateFlashCard() {
        if (flashCardCurrentSide == "front") {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].back;
           flashCardCurrentSide = "back";
        } else {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
           flashCardCurrentSide = "front";
        }
     }

     updateFlashCard();

     expect(flashCardText.innerHTML).toBe('back 1');
});

test('Flash card displays front from back switching', () => {
    document.body.innerHTML = `
        <div id="flashcard-front-text"></div>
    `;

    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' }
    ];

    let flashCardCurrentSide = 'back';
    let flashCardNumber = 0;

    const flashCardText = document.getElementById('flashcard-front-text');


    function updateFlashCard() {
        if (flashCardCurrentSide == "front") {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].back;
           flashCardCurrentSide = "back";
        } else {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
           flashCardCurrentSide = "front";
        }
     }

     updateFlashCard();

     expect(flashCardText.innerHTML).toBe('front 1');
});

test('Flash card displays back when clicked', () => {
    document.body.innerHTML = `
        <div id="flashcard-front-text"></div>
        <div class="flashcard-flip-clickbox"></div>
    `;

    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' }
    ];

    let flashCardCurrentSide = 'front';
    let flashCardNumber = 0;

    const flashCardText = document.getElementById('flashcard-front-text');
    const flashCardClick = document.querySelector('.flashcard-flip-clickbox');


    function updateFlashCard() {
        if (flashCardCurrentSide == "front") {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].back;
           flashCardCurrentSide = "back";
        } else {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
           flashCardCurrentSide = "front";
        }
     }

     flashCardClick.addEventListener("click", updateFlashCard);

     flashCardClick.click();

     expect(flashCardText.innerHTML).toBe('back 1');
});

test('Flash card displays front when clicked', () => {
    document.body.innerHTML = `
        <div id="flashcard-front-text"></div>
        <div class="flashcard-flip-clickbox"></div>
    `;

    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' }
    ];

    let flashCardCurrentSide = 'back';
    let flashCardNumber = 0;

    const flashCardText = document.getElementById('flashcard-front-text');
    const flashCardClick = document.querySelector('.flashcard-flip-clickbox');


    function updateFlashCard() {
        if (flashCardCurrentSide == "front") {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].back;
           flashCardCurrentSide = "back";
        } else {
           flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
           flashCardCurrentSide = "front";
        }
     }

     flashCardClick.addEventListener("click", updateFlashCard);

     flashCardClick.click();

     expect(flashCardText.innerHTML).toBe('front 1');
});

test('Flashcard menu displays when flashcard option clicked and quiz menu goes hidden', () => {
    document.body.innerHTML = `
        <button class="flashcards-option">Flash Cards</button>
        <section class="flashcard-section"></section>
        <div class="quiz"></div>
    `;

    const flashcardsButton = document.querySelector(".flashcards-option");
    const flashCards = document.querySelector(".flashcard-section");
    const quiz = document.querySelector(".quiz");

    flashcardsButton.addEventListener("click", () => {
        flashCards.style.display = 'inline';
        quiz.style.display = 'none';
     });

     flashcardsButton.click();

     expect(flashCards.style.display).toBe('inline');
     expect(quiz.style.display).toBe('none');

});

test('Quiz menu displays when quiz option clicked and flashcard menus go hidden', () => {
    document.body.innerHTML = `
        <button class="flashcards-option">Flash Cards</button>
        <button class="generate-quiz-button">Generate Quiz</button>
        <section class="flashcard-section"></section>
        <div class="edit-flashcards-menu"></div>
        <div class="quiz"></div>
    `;

    const generateQuizButton = document.querySelector(".generate-quiz-button");
    const flashCards = document.querySelector(".flashcard-section");
    const editFlashCardsMenu = document.querySelector(".edit-flashcards-menu");
    const quiz = document.querySelector(".quiz");

    generateQuizButton.addEventListener("click", () => {
        flashCards.style.display = 'none';
        quiz.style.display = 'grid';
        editFlashCardsMenu.style.display = 'none';
     });

     generateQuizButton.click();

     expect(flashCards.style.display).toBe('none');
     expect(editFlashCardsMenu.style.display).toBe('none');
     expect(quiz.style.display).toBe('grid');

});

test('Right flash appears when right button clicked and correct flash card number appears', () => {
    document.body.innerHTML = `
        <div id="flashcard-front-text"></div>
        <button id="right-flashcard-button">&gt</button>
        <div id="flashcard-number">1/10</div>
    `;

    const flashCardText = document.querySelector("#flashcard-front-text");
    const rightFlashCardButton = document.querySelector("#right-flashcard-button");
    const cardNumber = document.querySelector("#flashcard-number");

    let flashCardNumber = 0;
    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' },
        { front : 'front 2', back : 'back 2' }
    ];


    function updateFlashCardFront() {
        flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
        cardNumber.innerHTML = (flashCardNumber + 1) + '/10';
     }

    rightFlashCardButton.addEventListener("click", () => {
        if (flashCardNumber == 9) {
           flashCardNumber = 0;
        } else {
           flashCardNumber++;
        }
        updateFlashCardFront();
     });

     rightFlashCardButton.click();

     expect(flashCardText.innerHTML).toBe('front 2');
     expect(cardNumber.innerHTML).toBe('2/10');

});

test('Left flash appears when left button clicked and correct flash card number appears', () => {
    document.body.innerHTML = `
        <div id="flashcard-front-text"></div>
        <button id="left-flashcard-button">&lt</button>
        <div id="flashcard-number">2/10</div>
    `;

    const flashCardText = document.querySelector("#flashcard-front-text");
    const leftFlashCardButton = document.querySelector("#left-flashcard-button");
    const cardNumber = document.querySelector("#flashcard-number");

    let flashCardNumber = 1;
    let flashcardInfo = [
        { front : 'front 1', back : 'back 1' },
        { front : 'front 2', back : 'back 2' }
    ];

    function updateFlashCardFront() {
        flashCardText.innerHTML = flashcardInfo[flashCardNumber].front;
        cardNumber.innerHTML = (flashCardNumber + 1) + '/10';
     }

     leftFlashCardButton.addEventListener("click", () => {
        if (flashCardNumber == 0) {
           flashCardNumber = 9;
        } else {
           flashCardNumber--;
        }
        updateFlashCardFront();
     });

     leftFlashCardButton.click();

     expect(flashCardText.innerHTML).toBe('front 1');
     expect(cardNumber.innerHTML).toBe('1/10');

});

test('Flash card edit menu appears when clicked', () => {
    document.body.innerHTML = `
        <button id="edit-flashcards-button">Edit</button>
        <div class="edit-flashcards-menu"></div>
        <button id="done-edit-button">Done</button>
    `;

    const flashCardsEditButton = document.querySelector("#edit-flashcards-button");
    const editFlashCardsMenu = document.querySelector(".edit-flashcards-menu");
    const doneEditButton = document.querySelector("#done-edit-button");

    let editMenuToggled = false;

    flashCardsEditButton.addEventListener("click", () => {
        if (!editMenuToggled) {
           editFlashCardsMenu.style.display = 'flex';
           doneEditButton.style.display = 'inline';
           editMenuToggled = true;
        } else {
           editFlashCardsMenu.style.display = 'none';
           doneEditButton.style.display = 'none';
           editMenuToggled = false;
        }
     });

     flashCardsEditButton.click();

    expect(editFlashCardsMenu.style.display).toBe('flex');
     expect(doneEditButton.style.display).toBe('inline');
     expect(editMenuToggled).toBe(true);
    
});

test('Flash card edit menu disappears when clicked', () => {
    document.body.innerHTML = `
        <button id="edit-flashcards-button">Edit</button>
        <div class="edit-flashcards-menu"></div>
        <button id="done-edit-button">Done</button>
    `;

    const flashCardsEditButton = document.querySelector("#edit-flashcards-button");
    const editFlashCardsMenu = document.querySelector(".edit-flashcards-menu");
    const doneEditButton = document.querySelector("#done-edit-button");

    let editMenuToggled = true;

    flashCardsEditButton.addEventListener("click", () => {
        if (!editMenuToggled) {
           editFlashCardsMenu.style.display = 'flex';
           doneEditButton.style.display = 'inline';
           editMenuToggled = true;
        } else {
           editFlashCardsMenu.style.display = 'none';
           doneEditButton.style.display = 'none';
           editMenuToggled = false;
        }
     });

     flashCardsEditButton.click();

    expect(editFlashCardsMenu.style.display).toBe('none');
     expect(doneEditButton.style.display).toBe('none');
     expect(editMenuToggled).toBe(false);
    
});


test('Pressing done button in edit menu updates flash cards', () => {
    document.body.innerHTML = `
        <button id="done-edit-button">Done</button>
    `;

    let flashcardInfo = [
        { front : '', back : '' }
    ];

    let frontFlashCardValues = ['front1'];
    let backFlashCardValues = ['back1'];

    const doneEditButton = document.querySelector("#done-edit-button");
    
    doneEditButton.addEventListener("click", () => {
        for (let i = 0; i < 1; i++) {
           flashcardInfo[i].front = frontFlashCardValues[i];
           flashcardInfo[i].back = backFlashCardValues[i];
        }
     });

     doneEditButton.click();

     expect(flashcardInfo[0].front).toBe('front1');
     expect(flashcardInfo[0].back).toBe('back1');

});
