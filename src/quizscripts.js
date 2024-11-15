import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const genAI = new GoogleGenerativeAI("");

let userTopic;
let userScore = 0;

let questions = [
    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }, 
    
    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }, 
    
    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }, 
    
    {
        data : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }
];

let userAnswers = [];

async function geminiAPI() {

    loader.style.display = 'inline';

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = "give a 10 question multiple choice quiz about " + userTopic;

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
    const answerArray = textArray[textArray.length - 1].split("\n");
    
    //Assign the question, options, and answer for each question into each question object in the questions array
    for (let i = 0; i < 10; i++) {
        questions[i].data.question = textArray[i + 1][0];
        questions[i].data.option1 = textArray[i + 1][1];
        questions[i].data.option2 = textArray[i + 1][2];
        questions[i].data.option3 = textArray[i + 1][3];
        questions[i].data.option4 = textArray[i + 1][4];
        questions[i].data.answer = answerArray[i + 1];
    }

    loader.style.display = 'none';

    //Display question cards
    let i = 0;
    questionHeaders.forEach(questionHeader => {
        questionHeader.innerHTML = questions[i].data.question;
        i++;
    });

    i = 0;
    optionAinputs.forEach(optionAinput => {
        optionAinput.innerHTML = questions[i].data.option1;
        i++;
    });

    i = 0;
    optionBinputs.forEach(optionBinput => {
        optionBinput.innerHTML = questions[i].data.option2;
        i++;
    });
    i = 0;
    optionCinputs.forEach(optionCinput => {
        optionCinput.innerHTML = questions[i].data.option3;
        i++;
    });
    i = 0;
    optionDinputs.forEach(optionDinput => {
        optionDinput.innerHTML = questions[i].data.option4;
        i++;
    });

    //Display quiz
    quizSection.style.display = 'grid';
    quizSubmitButton.style.display = 'inline';

}
const quizSection = document.body.querySelector(".quiz");
const flashCardsSection = document.body.querySelector(".flashcard-section");

const quizTopicTextBox = document.body.querySelector("#quiz-topic-textbox");
const generateQuizButton = document.body.querySelector('.generate-quiz-button');
const questionHeaders = document.body.querySelectorAll('.question');

const optionAinputs = document.body.querySelectorAll('#option-a');
const optionBinputs = document.body.querySelectorAll('#option-b');
const optionCinputs = document.body.querySelectorAll('#option-c');
const optionDinputs = document.body.querySelectorAll('#option-d');

const quizScore = document.body.querySelector('.quiz-score')


const quizSubmitButton = document.body.querySelector('.quiz-submit-button');

const loader = document.body.querySelector(".loader");

const errorMessage = document.body.querySelector(".error-msg");

//Select all radio buttons
const radioButtons = document.body.querySelectorAll(".option");
const labels = document.querySelectorAll('label');

let selectedButtons = [];
let allButtons =[];

quizSubmitButton.addEventListener("click", () => {

    selectedButtons = [];
    allButtons =[];

    //Get array of selected radio buttons

    //If the radio button is checked, push the coresponding label to the 
    for (let i = 0; i < 40; i++) {
        if (radioButtons[i].checked) {
            selectedButtons.push(labels[i]);
        }
        allButtons.push(labels[i]);
    }

    //Compare the user answer and actual answers
    for (let i = 0; i < 10; i++) {
        //If selected answer is correct make the button green

        if (questions[i].data.answer.includes(userAnswers[i])) {
            selectedButtons[i].style.backgroundColor = 'lightgreen';
            userScore++;
        } 
        
        //If selected answer is incorrect make the button red
        else {
            selectedButtons[i].style.backgroundColor = 'red';
        }
    }

    let j = 0;
    //Make correct buttons green
    for (let i = 0; i < 10; i++) {
        if (questions[i].data.answer.includes('a')) {
            allButtons[j].style.backgroundColor = 'lightgreen';
        }

        else if (questions[i].data.answer.includes('b')) {
            allButtons[j + 1].style.backgroundColor = 'lightgreen';
        }
        
        else if (questions[i].data.answer.includes('c')) {
            allButtons[j + 2].style.backgroundColor = 'lightgreen';
        }
        
        else if (questions[i].data.answer.includes('d')) {
            allButtons[j + 3].style.backgroundColor = 'lightgreen';
        }

        j+=4;
     }


    quizScore.innerHTML = 'Score: ' + userScore.toString() + '/10'; 
    quizScore.style.display = 'inline'
});

//Get text input value from quiz-topic-textbox and then call API
generateQuizButton.addEventListener("click", () => {
    flashCardsSection.style.display = 'none';
    userTopic = quizTopicTextBox.value;

    if (!userTopic) {
        errorMessage.style.display = 'inline';
    } else {
        errorMessage.style.display = 'none';
        quizSection.style.display = 'none';
        quizSubmitButton.style.display = 'none';
        geminiAPI();
    } 
});

window.setUserAnswer =  function(questionNumber, choice) {
    userAnswers[questionNumber] = choice;
}

