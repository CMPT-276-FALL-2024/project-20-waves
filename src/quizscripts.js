import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const genAI = new GoogleGenerativeAI('');

async function geminiAPI() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = "give a 10 question quiz about " + "java";

    const result = await model.generateContent(prompt);
    const response = await result.response;

    //Parse the API results then place into array with objects
    const text = response.text();

    const regexExpression = /(\d+\.[^0-9]+)/g;

    const responseQuestions = [...text.matchAll(regex)];

    const questionsArray = responseQuestions.map(question => question[0]);

    for (let i = 0; i < 10; i++) {
        questions[i].data.question = questionsArray[i];
    }

    for (let i = 0; i < 10; i++) {
        console.log(questionsArray[i]);
    }
}

geminiAPI();

//Get text input value from quiz-topic-textbox and then call API
//Parse the API results then place into array with objects
//Set each question to the question from array
//Set each questions options values to the options from the API call
//Create an answers array to store the users answers
//Display quiz
//When an option is selected place the value of that radio button into user answer array
//When quiz is submitted compare the user answer array to the results arrays answers
//Return score

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

let userAnswers = {
    question1 : "",
    question2 : "",
    question3 : "",
    question4 : "",
    question5 : "",
    question6 : "",
    question7 : "",
    question8 : "",
    question9 : "",
    question10 : ""
};


/*
const generateQuizButton = document.querySelector(".generate-quiz-button");
const quizTopicTextBox = document.querySelector("#quiz-topic-textbox");

//Generate quiz option button
generateQuizButton.addEventListener("click", () => {
    flashCards.style.display = 'none';
    quiz.style.display = 'grid';
    editFlashCardsMenu.style.display = 'none';
 });

 generateQuizButton.addEventListener("click", () => {
    //Get textbox value
    let topic = quizTopicTextBox.value;
    let prompt = "give a 1 question quiz about java";
 });

*/



