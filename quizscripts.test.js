test("Quiz option turns green when correct option selected", () => {
  document.body.innerHTML = `
         <div class="quiz-question-card">
            <div class="question"></div>

            <div class="multiple-choice-options">
                <input type="radio" class ="option" id="a1" name="q1" onclick="setUserAnswer(0, 'a')">
                <label id="option-a" for="a1"></label>

                <input type="radio" class ="option" id="b1" name="q1" onclick="setUserAnswer(0, 'b')">
                <label id="option-b" for="b1"></label>
                                    
                <input type="radio" class ="option" id="c1" name="q1" onclick="setUserAnswer(0, 'c')">
                <label id="option-c" for="c1"></label>
                
                <input type="radio" class ="option" id="d1" name="q1" onclick="setUserAnswer(0, 'd')">
                <label id="option-d" for="d1"></label>
            </div>

        </div>

        <button class="quiz-submit-button">Submit</button>
    `;

  let questions = [
    {
      data: {
        question: "question",
        option1: "option1",
        option2: "option2",
        option3: "option3",
        option4: "option4",
        answer: "a",
      },
    },
  ];

  let userAnswers = ["a"];

  const option1 = document.getElementById("a1");
  const option2 = document.getElementById("b1");
  const option3 = document.getElementById("c1");
  const option4 = document.getElementById("d1");
  const quizSubmitButton = document.querySelector(".quiz-submit-button");

  let selectedButtons = [option1];

  let allButtons = [option1, option2, option3, option4];

  //When quiz submit button is clicked check answers and return results
  quizSubmitButton.addEventListener("click", () => {
    let userScore = 0;

    //Compare the user answer and actual answers
    for (let i = 0; i < 1; i++) {
      //If selected answer is correct make the button green and increment user score
      if (questions[i].data.answer.includes(userAnswers[i])) {
        selectedButtons[i].style.backgroundColor = "lightgreen";
        userScore++;
      }

      //If selected answer is incorrect make the button red
      else {
        selectedButtons[i].style.backgroundColor = "red";
      }
    }

    //Make correct buttons green by going through each questions answer and by going thorugh the labels
    // 4 at a time (for each question) setting the correct label in the array to green
    // After its set to green go to the next 4 labels for the next 4 options in the next question

    let j = 0;

    for (let i = 0; i < 1; i++) {
      if (questions[i].data.answer.includes("a")) {
        allButtons[j].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("b")) {
        allButtons[j + 1].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("c")) {
        allButtons[j + 2].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("d")) {
        allButtons[j + 3].style.backgroundColor = "lightgreen";
      }

      j += 4;
    }
  });

  quizSubmitButton.click();

  expect(option1.style.backgroundColor).toBe("lightgreen");
});

test("Quiz option turns red when incorrect", () => {
  document.body.innerHTML = `
         <div class="quiz-question-card">
            <div class="question"></div>

            <div class="multiple-choice-options">
                <input type="radio" class ="option" id="a1" name="q1" onclick="setUserAnswer(0, 'a')">
                <label id="option-a" for="a1"></label>

                <input type="radio" class ="option" id="b1" name="q1" onclick="setUserAnswer(0, 'b')">
                <label id="option-b" for="b1"></label>
                                    
                <input type="radio" class ="option" id="c1" name="q1" onclick="setUserAnswer(0, 'c')">
                <label id="option-c" for="c1"></label>
                
                <input type="radio" class ="option" id="d1" name="q1" onclick="setUserAnswer(0, 'd')">
                <label id="option-d" for="d1"></label>
            </div>

        </div>

        <button class="quiz-submit-button">Submit</button>
    `;

  let questions = [
    {
      data: {
        question: "question",
        option1: "option1",
        option2: "option2",
        option3: "option3",
        option4: "option4",
        answer: "a",
      },
    },
  ];

  let userAnswers = ["b"];

  const option1 = document.getElementById("a1");
  const option2 = document.getElementById("b1");
  const option3 = document.getElementById("c1");
  const option4 = document.getElementById("d1");
  const quizSubmitButton = document.querySelector(".quiz-submit-button");

  let selectedButtons = [option2];

  let allButtons = [option1, option2, option3, option4];

  //When quiz submit button is clicked check answers and return results
  quizSubmitButton.addEventListener("click", () => {
    //Compare the user answer and actual answers
    for (let i = 0; i < 1; i++) {
      //If selected answer is correct make the button green and increment user score
      if (questions[i].data.answer.includes(userAnswers[i])) {
        selectedButtons[i].style.backgroundColor = "lightgreen";
      }

      //If selected answer is incorrect make the button red
      else {
        selectedButtons[i].style.backgroundColor = "red";
      }
    }

    //Make correct buttons green by going through each questions answer and by going thorugh the labels
    // 4 at a time (for each question) setting the correct label in the array to green
    // After its set to green go to the next 4 labels for the next 4 options in the next question

    let j = 0;

    for (let i = 0; i < 1; i++) {
      if (questions[i].data.answer.includes("a")) {
        allButtons[j].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("b")) {
        allButtons[j + 1].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("c")) {
        allButtons[j + 2].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("d")) {
        allButtons[j + 3].style.backgroundColor = "lightgreen";
      }

      j += 4;
    }
  });

  quizSubmitButton.click();

  expect(option2.style.backgroundColor).toBe("red");
});

test("Correct option displayed when wrong one picked", () => {
  document.body.innerHTML = `
         <div class="quiz-question-card">
            <div class="question"></div>

            <div class="multiple-choice-options">
                <input type="radio" class ="option" id="a1" name="q1" onclick="setUserAnswer(0, 'a')">
                <label id="option-a" for="a1"></label>

                <input type="radio" class ="option" id="b1" name="q1" onclick="setUserAnswer(0, 'b')">
                <label id="option-b" for="b1"></label>
                                    
                <input type="radio" class ="option" id="c1" name="q1" onclick="setUserAnswer(0, 'c')">
                <label id="option-c" for="c1"></label>
                
                <input type="radio" class ="option" id="d1" name="q1" onclick="setUserAnswer(0, 'd')">
                <label id="option-d" for="d1"></label>
            </div>

        </div>

        <button class="quiz-submit-button">Submit</button>
    `;

  let questions = [
    {
      data: {
        question: "question",
        option1: "option1",
        option2: "option2",
        option3: "option3",
        option4: "option4",
        answer: "a",
      },
    },
  ];

  let userAnswers = ["b"];

  const option1 = document.getElementById("a1");
  const option2 = document.getElementById("b1");
  const option3 = document.getElementById("c1");
  const option4 = document.getElementById("d1");
  const quizSubmitButton = document.querySelector(".quiz-submit-button");

  let selectedButtons = [option2];

  let allButtons = [option1, option2, option3, option4];

  //When quiz submit button is clicked check answers and return results
  quizSubmitButton.addEventListener("click", () => {
    //Compare the user answer and actual answers
    for (let i = 0; i < 1; i++) {
      //If selected answer is correct make the button green and increment user score
      if (questions[i].data.answer.includes(userAnswers[i])) {
        selectedButtons[i].style.backgroundColor = "lightgreen";
      }

      //If selected answer is incorrect make the button red
      else {
        selectedButtons[i].style.backgroundColor = "red";
      }
    }

    //Make correct buttons green by going through each questions answer and by going thorugh the labels
    // 4 at a time (for each question) setting the correct label in the array to green
    // After its set to green go to the next 4 labels for the next 4 options in the next question

    let j = 0;

    for (let i = 0; i < 1; i++) {
      if (questions[i].data.answer.includes("a")) {
        allButtons[j].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("b")) {
        allButtons[j + 1].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("c")) {
        allButtons[j + 2].style.backgroundColor = "lightgreen";
      } else if (questions[i].data.answer.includes("d")) {
        allButtons[j + 3].style.backgroundColor = "lightgreen";
      }

      j += 4;
    }
  });

  quizSubmitButton.click();

  expect(option1.style.backgroundColor).toBe("lightgreen");
});
let userTopic;
test("Check if topic is being read and flash cards section is hidden when quiz topic entered", () => {
  document.body.innerHTML = `
        <input id="quiz-topic-textbox" type="text" placeholder="Type topic to create quiz about here" value="topic">
        <button class="generate-quiz-button">Generate Quiz</button>
    `;

  const generateQuizButton = document.body.querySelector(
    ".generate-quiz-button"
  );
  const quizTopicTextBox = document.body.querySelector("#quiz-topic-textbox");

  //When generate quiz button is clicked, get the topic entered by the user and then call API
  generateQuizButton.addEventListener("click", () => {
    //Get textbox value
    userTopic = quizTopicTextBox.value;
  });

  generateQuizButton.click();

  expect(userTopic).toBe("topic");
});

test("Show error message if no topic entered", () => {
  document.body.innerHTML = `
        <input id="quiz-topic-textbox" type="text" placeholder="Type topic to create quiz about here" value="topic">
        <button class="generate-quiz-button">Generate Quiz</button>
        <div class="error-msg">Error: Please enter a topic</div>
        <div class="quiz"></section>
        <div class="quiz-score"></div>
        <button class="quiz-submit-button">Submit</button>

    `;

  const generateQuizButton = document.body.querySelector(
    ".generate-quiz-button"
  );
  const errorMessage = document.body.querySelector(".error-msg");
  const quizSection = document.body.querySelector(".quiz");
  const quizScore = document.body.querySelector(".quiz-score");
  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  //When generate quiz button is clicked, get the topic entered by the user and then call API
  generateQuizButton.addEventListener("click", () => {
    const userTopic = "";
    //If user topic is blank, display error message and dont call API
    if (!userTopic) {
      errorMessage.style.display = "inline";
    }

    //If user topic is entered hide all quiz components and call API
    else {
      errorMessage.style.display = "none";
      quizSection.style.display = "none";
      quizSubmitButton.style.display = "none";
      quizScore.style.display = "none";
    }
  });

  generateQuizButton.click();

  expect(errorMessage.style.display).toBe("inline");
});

test("Hide error message, quiz section, quiz submit button, and quiz score if topic entered", () => {
  document.body.innerHTML = `
        <input id="quiz-topic-textbox" type="text" placeholder="Type topic to create quiz about here" value="topic">
        <button class="generate-quiz-button">Generate Quiz</button>
        <div class="error-msg">Error: Please enter a topic</div>
        <div class="quiz"></section>
        <div class="quiz-score"></div>
        <button class="quiz-submit-button">Submit</button>

    `;

  const generateQuizButton = document.body.querySelector(
    ".generate-quiz-button"
  );
  const errorMessage = document.body.querySelector(".error-msg");
  const quizSection = document.body.querySelector(".quiz");
  const quizScore = document.body.querySelector(".quiz-score");
  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  //When generate quiz button is clicked, get the topic entered by the user and then call API
  generateQuizButton.addEventListener("click", () => {
    const userTopic = "topic";
    //If user topic is blank, display error message and dont call API
    if (!userTopic) {
      errorMessage.style.display = "inline";
    }

    //If user topic is entered hide all quiz components and call API
    else {
      errorMessage.style.display = "none";
      quizSection.style.display = "none";
      quizSubmitButton.style.display = "none";
      quizScore.style.display = "none";
    }
  });

  generateQuizButton.click();

  expect(errorMessage.style.display).toBe("none");
  expect(quizSection.style.display).toBe("none");
  expect(quizSubmitButton.style.display).toBe("none");
  expect(quizScore.style.display).toBe("none");
});

test("Quiz topics are correctly added to quiz history box", () => {
  document.body.innerHTML = `
          <table id="quiz-history">
            <th>Quiz History</th>
          </table>
          <button class="quiz-submit-button">Submit</button>
    `;

  const storageArray = [{ topic: "test", score: "0" }];

  const quizHistoryTable = document.body.querySelector("#quiz-history");

  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  //Add all objects in localstorage to table to display starting from itemnumber
  function displayQuizHistory(itemNumber) {
    //For each object in the local storage display the objects values
    for (itemNumber; itemNumber < storageArray.length; itemNumber++) {
      //Create a new row
      let row = document.createElement("tr");

      //Create a new column
      let column = document.createElement("td");

      //Set the column text to be topic - score for each object
      column.textContent =
        storageArray[itemNumber].topic +
        " - " +
        storageArray[itemNumber].score +
        "/10";

      //add the column to the row
      row.appendChild(column);

      //Add the row to the the table
      quizHistoryTable.appendChild(row);
    }
  }

  quizSubmitButton.addEventListener("click", () => {
    displayQuizHistory(storageArray.length - 1);
  });

  quizSubmitButton.click();

  const rows = document.querySelectorAll("tr");

  expect(rows.length).toBe(2);

  expect(rows[1].querySelector("td").textContent).toBe("test - 0/10");
});

test("Quiz already submitted error message correctly displays", () => {
  document.body.innerHTML = `
          <div class="error-msg" id="quiz-already-submitted">
            Error: Quiz already submitted. Please create a new one
          </div>
          <button class="quiz-submit-button">Submit</button>
    `;

  const quizAlreadySubmittedErrorMessage = document.body.querySelector(
    "#quiz-already-submitted"
  );
  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  const quizSubmitted = true;

  const userAnswers = ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a"];

  quizAlreadySubmittedErrorMessage.style.display = "none";

  quizSubmitButton.addEventListener("click", () => {
    if (quizSubmitted && userAnswers.length === 10) {
      quizAlreadySubmittedErrorMessage.style.display = "inline";
    }
  });

  quizSubmitButton.click();

  expect(quizAlreadySubmittedErrorMessage.style.display).toBe("inline");
});

test("Quiz already submitted error message doesnt display when quiz hasnt already been submitted", () => {
  document.body.innerHTML = `
          <div class="error-msg" id="quiz-already-submitted">
            Error: Quiz already submitted. Please create a new one
          </div>
          <button class="quiz-submit-button">Submit</button>
    `;

  const quizAlreadySubmittedErrorMessage = document.body.querySelector(
    "#quiz-already-submitted"
  );
  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  const quizSubmitted = false;

  const userAnswers = ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a"];

  quizAlreadySubmittedErrorMessage.style.display = "none";

  quizSubmitButton.addEventListener("click", () => {
    if (quizSubmitted && userAnswers.length === 10) {
      quizAlreadySubmittedErrorMessage.style.display = "inline";
    }
  });

  quizSubmitButton.click();

  expect(quizAlreadySubmittedErrorMessage.style.display).toBe("none");
});

test("Quiz incomplete error message displays when quiz isnt finished and is trying to be submitted", () => {
  document.body.innerHTML = `
          <div class="error-msg" id="question-not-answered">
            Error: Not all questions answered
          </div>
          <button class="quiz-submit-button">Submit</button>
    `;

  const questionNotAnsweredErrorMessage = document.body.querySelector(
    "#question-not-answered"
  );
  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  const userAnswers = ["a", "a", "a", "a", "a", "a", "a", "a", "a"];

  questionNotAnsweredErrorMessage.style.display = "none";

  quizSubmitButton.addEventListener("click", () => {
    //Display questions not answered error message
    if (userAnswers.length !== 10) {
      questionNotAnsweredErrorMessage.style.display = "inline";
    }
  });

  quizSubmitButton.click();

  expect(questionNotAnsweredErrorMessage.style.display).toBe("inline");
});

test("Quiz incomplete error message doesnt displays when quiz when all questions are answered", () => {
  document.body.innerHTML = `
          <div class="error-msg" id="question-not-answered">
            Error: Not all questions answered
          </div>
          <button class="quiz-submit-button">Submit</button>
    `;

  const questionNotAnsweredErrorMessage = document.body.querySelector(
    "#question-not-answered"
  );
  const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

  const userAnswers = ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a"];

  questionNotAnsweredErrorMessage.style.display = "none";

  quizSubmitButton.addEventListener("click", () => {
    //Display questions not answered error message
    if (userAnswers.length !== 10) {
      questionNotAnsweredErrorMessage.style.display = "inline";
    }
  });

  quizSubmitButton.click();

  expect(questionNotAnsweredErrorMessage.style.display).toBe("none");
});

test("Loading screen displays when quiz generate button is clicked", () => {
  document.body.innerHTML = `
          <div class="loader">
            <img src="./public/duck-walking.gif" id="duck-gif" />
            <h3>Generating quiz...</h3>
          </div>
          <button class="generate-quiz-button">Generate Quiz</button>
    `;

  const loadingScreen = document.querySelector(".loader");

  loadingScreen.style.display = "none";

  const generateQuizButton = document.body.querySelector(
    ".generate-quiz-button"
  );

  generateQuizButton.addEventListener("click", () => {
    //Get textbox value
    loadingScreen.style.display = "inline";
  });

  generateQuizButton.click();

  expect(loadingScreen.style.display).toBe("inline");
});
