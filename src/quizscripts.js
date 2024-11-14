import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyD59cvRLGTGbqq-oQRidggkpYzrNrw1K_I");

let userTopic;
let userScore = 0;
const TOTALQUESTIONS = 10;

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

    console.log(questions);

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

}
const quizSection = document.body.querySelector(".quiz");

const quizTopicTextBox = document.body.querySelector("#quiz-topic-textbox");
const generateQuizButton = document.body.querySelector('.generate-quiz-button');
const questionHeaders = document.body.querySelectorAll('.question');

const optionAinputs = document.body.querySelectorAll('#option-a');
const optionBinputs = document.body.querySelectorAll('#option-b');
const optionCinputs = document.body.querySelectorAll('#option-c');
const optionDinputs = document.body.querySelectorAll('#option-d');

//Get text input value from quiz-topic-textbox and then call API
generateQuizButton.addEventListener("click", () => {
    userTopic = quizTopicTextBox.value;
    geminiAPI();
});

window.setUserAnswer =  function(questionNumber, choice) {
    userAnswers[questionNumber] = choice;
}

