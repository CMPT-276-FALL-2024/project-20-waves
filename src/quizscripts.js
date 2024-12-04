import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyD59cvRLGTGbqq-oQRidggkpYzrNrw1K_I");

//Questions object to hold data for each question returned by the APi
let questions = [
  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },

  {
    data: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    },
  },
];

//Arrays for users answers, user selected buttons for question options, and all buttons for question options
let userAnswers = [];
let selectedButtons = [];
let allButtons = [];

//Variable for keeping track if the quiz has already been submitted
let quizSubmitted = false;

//Variables for user topic and user quiz score
let userTopic;

//quiz section
const quizSection = document.body.querySelector(".quiz");

//Select all question headers
const questionHeaders = document.body.querySelectorAll(".question");

//Select quiz topic textbox
const quizTopicTextBox = document.body.querySelector("#quiz-topic-textbox");

//Select generate quiz button
const generateQuizButton = document.body.querySelector(".generate-quiz-button");

//Select all option input buttons
const optionAinputs = document.body.querySelectorAll("#option-a");
const optionBinputs = document.body.querySelectorAll("#option-b");
const optionCinputs = document.body.querySelectorAll("#option-c");
const optionDinputs = document.body.querySelectorAll("#option-d");

//Select quiz score
const quizScore = document.body.querySelector(".quiz-score");

//Select quiz submit button
const quizSubmitButton = document.body.querySelector(".quiz-submit-button");

//Select loading spinner
const loader = document.body.querySelector(".loader");

//Select error message
const errorMessage = document.body.querySelector(".error-msg");

//Select table
const table = document.getElementById("quiz-history");

//Select question not answered error message
const questionNotAnsweredErrorMessage = document.getElementById(
  "question-not-answered"
);

//Select quiz already submitted error message
const quizAlreadySubmittedErrorMessage = document.getElementById(
  "quiz-already-submitted"
);

//Select clear quiz history button
const clearQuizHistoryButton = document.body.querySelector(
  ".clear-quiz-history-button"
);

//API function
async function geminiAPI() {
  //Display loading spinner
  loader.style.display = "inline";

  //Hide error message
  quizAlreadySubmittedErrorMessage.style.display = "none";

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt =
    "give a 10 question multiple choice quiz, with no code output questions, about " +
    userTopic;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  const text = response.text();

  //Parse the API results into seperate question arrays
  const textArray = text.split("\n\n");

  //Parse each array within the outer array to get each part of each question into seperate elements
  for (let i = 0; i < 11; i++) {
    textArray[i] = textArray[i].split("\n");
  }

  //Parse the last element of the array (last element has all the answers as one element) into seperate elements and assign to array

  //If the data returned is of type object or returns the data in a different format, recall API until a string is returned for the data type
  if (
    typeof textArray[textArray.length - 1] === "object" ||
    textArray.length > 12
  ) {
    geminiAPI();
  }

  //If data is type string, split the answer element into its individual elements for each question
  else {
    const answerArray = textArray[textArray.length - 1].split(".");

    //If answer array contains '**answer key**' string at the front of the array, remove it
    if (answerArray[0].includes("*")) {
      answerArray.splice(0, 1);
    }

    //Assign the question, options, and answer for each question into each question object in the questions array
    for (let i = 0; i < 10; i++) {
      questions[i].data.question = textArray[i + 1][0];
      questions[i].data.option1 = textArray[i + 1][1];
      questions[i].data.option2 = textArray[i + 1][2];
      questions[i].data.option3 = textArray[i + 1][3];
      questions[i].data.option4 = textArray[i + 1][4];
      questions[i].data.answer = answerArray[i];
    }

    //Hide loading spinner
    loader.style.display = "none";

    //For each question header, set the text to the question from the questions object
    let i = 0;
    questionHeaders.forEach((questionHeader) => {
      questionHeader.innerHTML = questions[i].data.question;
      i++;
    });

    //For each option a, set the text to option 1 from the questions object
    i = 0;
    optionAinputs.forEach((optionAinput) => {
      optionAinput.innerHTML = questions[i].data.option1;
      i++;
    });

    //For each option b, set the text to option 2 from the questions object
    i = 0;
    optionBinputs.forEach((optionBinput) => {
      optionBinput.innerHTML = questions[i].data.option2;
      i++;
    });

    //For each option c, set the text to option 3 from the questions object
    i = 0;
    optionCinputs.forEach((optionCinput) => {
      optionCinput.innerHTML = questions[i].data.option3;
      i++;
    });

    //For each option d, set the text to option 4 from the questions object
    i = 0;
    optionDinputs.forEach((optionDinput) => {
      optionDinput.innerHTML = questions[i].data.option4;
      i++;
    });

    //Display quiz
    quizSection.style.display = "grid";
    quizSubmitButton.style.display = "inline";

    //Enable quiz submit button
    //quizSubmitButton.removeAttribute("disabled", "");
    // quizSubmitButton.setAttribute("enabled", "");

    quizAlreadySubmittedErrorMessage.style.display = "none";
    quizSubmitted = false;
  }
}

//When quiz submit button is clicked check answers and return results
quizSubmitButton.addEventListener("click", () => {
  if (userAnswers.length === 10 && !quizSubmitted) {
    //Hide questions not answered error message
    questionNotAnsweredErrorMessage.style.display = "none";

    //Select all labels
    const labels = document.querySelectorAll("label");

    //Select all radio buttons
    const radioButtons = document.body.querySelectorAll(".option");

    //Reset variables
    selectedButtons = [];
    allButtons = [];
    let userScore = 0;

    //If the radio button is checked, add the label of that radio button to the selected buttons array
    for (let i = 0; i < 40; i++) {
      if (radioButtons[i].checked) {
        selectedButtons.push(labels[i]);
      }

      //Add the label to the all buttons array
      allButtons.push(labels[i]);
    }

    //Compare the user answer and actual answers
    for (let i = 0; i < 10; i++) {
      //If selected answer is correct make the button green and increment user score
      if (questions[i].data.answer.includes(userAnswers[i])) {
        selectedButtons[i].style.backgroundColor = "lightgreen";
        userScore++;
      }

      //If selected answer is incorrect make the button red
      else {
        selectedButtons[i].style.backgroundColor = "rgb(245, 69, 69)";
      }
    }

    //Make correct buttons green by going through each questions answer and by going thorugh the labels
    // 4 at a time (for each question) setting the correct label in the array to green
    // After its set to green go to the next 4 labels for the next 4 options in the next question

    let j = 0;

    for (let i = 0; i < 10; i++) {
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

    //Display user score
    quizScore.innerHTML = "Score: " + userScore.toString() + "/10";
    quizScore.style.display = "inline";

    //Create object to hold quiz topic and score
    const quizHistoryItem = {
      topic: userTopic,
      score: userScore,
    };

    //Add object to local storage and assign it an id of localstorage length so the id in unique
    localStorage.setItem(localStorage.length, JSON.stringify(quizHistoryItem));

    //Add newest object to display in quiz history table
    displayQuizHistory(localStorage.length - 1);

    //set quiz submitted to be true
    quizSubmitted = true;
  }

  //If the quiz has been submitted already and all answers have been submitted, display error message
  else if (quizSubmitted && userAnswers.length === 10) {
    quizAlreadySubmittedErrorMessage.style.display = "inline";
  }
  //If not all answers have been submitted, display error message
  else {
    //Display questions not answered error message
    questionNotAnsweredErrorMessage.style.display = "inline";
  }
});

//When generate quiz button is clicked, get the topic entered by the user and then call API
generateQuizButton.addEventListener("click", () => {
  //Get textbox value
  userTopic = quizTopicTextBox.value;

  //Uncheck all radio buttons
  document
    .querySelectorAll('input[type="radio"]')
    .forEach((radio) => (radio.checked = false));

  //Reset all background colours of labels
  document
    .querySelectorAll("label")
    .forEach((label) => (label.style.backgroundColor = ""));

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
    geminiAPI();
  }
});

//Function to get the users input from the HTML file's radio buttons
window.setUserAnswer = function (questionNumber, choice) {
  userAnswers[questionNumber] = choice;
};

//Add all objects in localstorage to table to display starting from itemnumber
function displayQuizHistory(itemNumber) {
  //For each object in the local storage display the objects values
  for (itemNumber; itemNumber < localStorage.length; itemNumber++) {
    //Create a new row
    let row = document.createElement("tr");

    //Create a new column
    let column = document.createElement("td");

    //Set the column text to be topic - score for each object
    column.textContent =
      JSON.parse(localStorage[itemNumber]).topic +
      " - " +
      JSON.parse(localStorage[itemNumber]).score +
      "/10";

    //add the column to the row
    row.appendChild(column);

    //Add the row to the the table
    table.appendChild(row);
  }
}

//Button to clear quiz topic and score history
clearQuizHistoryButton.addEventListener("click", () => {
  //Clear local storage
  localStorage.clear();

  //Delete all rows in the table except for the header
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
});

//Display quiz history on page load
displayQuizHistory(0);
