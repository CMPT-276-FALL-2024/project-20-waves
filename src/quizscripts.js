import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const genAI = new GoogleGenerativeAI('');

async function geminiAPI() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = "give a 10 question multiple choice quiz about java";

    const result = await model.generateContent(prompt);
    const response = await result.response;

    //Parse the API results then place into array with objects
    const text = response.text();
    
    const textArray = text.split("\n\n");

    for (let i = 0; i < 11; i++) {
        textArray[i] = textArray[i].split("\n");
        
    }


    const answerArray = textArray[textArray.length - 1].split("\n");
    
    for (let i = 0; i < 10; i++) {
        questions[i].data.question = textArray[i + 1][0];
        questions[i].data.option1 = textArray[i + 1][1];
        questions[i].data.option2 = textArray[i + 1][2];
        questions[i].data.option3 = textArray[i + 1][3];
        questions[i].data.option4 = textArray[i + 1][4];
        questions[i].data.answer = answerArray[i + 1];
    }

    console.log(questions);




    



    
    


    





    
    
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


