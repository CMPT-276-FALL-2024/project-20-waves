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
        question1 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        question2 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        question3 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }, 
    
    {
        question4 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        question5 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        question6 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }, 
    
    {
        question7 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        question8 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    },

    {
        question9 : {
            question : "",
            option1 : "",
            option2 : "",
            option3 : "",
            option4 : "",
            answer : ""
        }  
    }, 
    
    {
        question10 : {
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



const generateQuizButton = document.querySelector(".generate-quiz-button");

 //Generate quiz option button
generateQuizButton.addEventListener("click", () => {
    flashCards.style.display = 'none';
    quiz.style.display = 'grid';
    editFlashCardsMenu.style.display = 'none';
 });