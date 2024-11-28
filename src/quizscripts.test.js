test('Quiz option turns green when correct option selected', () => {
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
                answer: "a"
            }
        }
    ];

    let userAnswers = [
        'a'
    ];

    const option1 = document.getElementById('a1');
    const option2 = document.getElementById('b1');
    const option3 = document.getElementById('c1');
    const option4 = document.getElementById('d1');
    const quizSubmitButton = document.querySelector('.quiz-submit-button');

    let selectedButtons = [option1];

    let allButtons = [option1, option2, option3, option4]

    //When quiz submit button is clicked check answers and return results
    quizSubmitButton.addEventListener("click", () => {

        let userScore = 0;

        //Compare the user answer and actual answers
        for (let i = 0; i < 1; i++) {
            //If selected answer is correct make the button green and increment user score
            if (questions[i].data.answer.includes(userAnswers[i])) {
                selectedButtons[i].style.backgroundColor = 'lightgreen';
                userScore++;
            } 
            
            //If selected answer is incorrect make the button red
            else {
                selectedButtons[i].style.backgroundColor = 'red';
            }
        }

        //Make correct buttons green by going through each questions answer and by going thorugh the labels
        // 4 at a time (for each question) setting the correct label in the array to green
        // After its set to green go to the next 4 labels for the next 4 options in the next question

        let j = 0;

        for (let i = 0; i < 1; i++) {
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

    });

    quizSubmitButton.click();

    expect(option1.style.backgroundColor).toBe('lightgreen');
});

test('Quiz option turns red when incorrect', () => {
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
                answer: "a"
            }
        }
    ];

    let userAnswers = ["b"];

    const option1 = document.getElementById('a1');
    const option2 = document.getElementById('b1');
    const option3 = document.getElementById('c1');
    const option4 = document.getElementById('d1');
    const quizSubmitButton = document.querySelector('.quiz-submit-button');

    let selectedButtons = [option2];

    let allButtons = [option1, option2, option3, option4]

    //When quiz submit button is clicked check answers and return results
    quizSubmitButton.addEventListener("click", () => {

        //Compare the user answer and actual answers
        for (let i = 0; i < 1; i++) {
            //If selected answer is correct make the button green and increment user score
            if (questions[i].data.answer.includes(userAnswers[i])) {
                selectedButtons[i].style.backgroundColor = 'lightgreen';
            } 
            
            //If selected answer is incorrect make the button red
            else {
                selectedButtons[i].style.backgroundColor = 'red';
            }
        }

        //Make correct buttons green by going through each questions answer and by going thorugh the labels
        // 4 at a time (for each question) setting the correct label in the array to green
        // After its set to green go to the next 4 labels for the next 4 options in the next question

        let j = 0;

        for (let i = 0; i < 1; i++) {
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

    });

    quizSubmitButton.click();

    expect(option2.style.backgroundColor).toBe('red');
});

test('Correct option displayed when wrong one picked', () => {
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
                answer: "a"
            }
        }
    ];

    let userAnswers = ["b"];

    const option1 = document.getElementById('a1');
    const option2 = document.getElementById('b1');
    const option3 = document.getElementById('c1');
    const option4 = document.getElementById('d1');
    const quizSubmitButton = document.querySelector('.quiz-submit-button');

    let selectedButtons = [option2];

    let allButtons = [option1, option2, option3, option4]

    //When quiz submit button is clicked check answers and return results
    quizSubmitButton.addEventListener("click", () => {

        //Compare the user answer and actual answers
        for (let i = 0; i < 1; i++) {
            //If selected answer is correct make the button green and increment user score
            if (questions[i].data.answer.includes(userAnswers[i])) {
                selectedButtons[i].style.backgroundColor = 'lightgreen';
            } 
            
            //If selected answer is incorrect make the button red
            else {
                selectedButtons[i].style.backgroundColor = 'red';
            }
        }

        //Make correct buttons green by going through each questions answer and by going thorugh the labels
        // 4 at a time (for each question) setting the correct label in the array to green
        // After its set to green go to the next 4 labels for the next 4 options in the next question

        let j = 0;

        for (let i = 0; i < 1; i++) {
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

    });

    quizSubmitButton.click();

    expect(option1.style.backgroundColor).toBe('lightgreen');
});



test('Check if topic is being read and flash cards section is hidden when quiz topic entered', () => {

    document.body.innerHTML = `
        <input id="quiz-topic-textbox" type="text" placeholder="Type topic to create quiz about here" value="topic">
        <button class="generate-quiz-button">Generate Quiz</button>
        <section class="flashcard-section"></section>
    `

    const generateQuizButton = document.body.querySelector('.generate-quiz-button');
    const flashCardsSection = document.body.querySelector('.flashcard-section');
    const quizTopicTextBox = document.body.querySelector("#quiz-topic-textbox");


    //When generate quiz button is clicked, get the topic entered by the user and then call API
    generateQuizButton.addEventListener("click", () => {

        //Hide flash cards section
        flashCardsSection.style.display = 'none';

        //Get textbox value
        userTopic = quizTopicTextBox.value;

    });

    generateQuizButton.click();

    expect(flashCardsSection.style.display).toBe('none');
    expect(userTopic).toBe('topic');
});

test('Show error message if no topic entered', () => {

    document.body.innerHTML = `
        <input id="quiz-topic-textbox" type="text" placeholder="Type topic to create quiz about here" value="topic">
        <button class="generate-quiz-button">Generate Quiz</button>
        <div class="error-msg">Error: Please enter a topic</div>
        <div class="quiz"></section>
        <div class="quiz-score"></div>
        <button class="quiz-submit-button">Submit</button>

    `

    const generateQuizButton = document.body.querySelector('.generate-quiz-button');
    const errorMessage = document.body.querySelector(".error-msg");
    const quizSection = document.body.querySelector(".quiz");
    const quizScore = document.body.querySelector('.quiz-score');
    const quizSubmitButton = document.body.querySelector('.quiz-submit-button');


    //When generate quiz button is clicked, get the topic entered by the user and then call API
    generateQuizButton.addEventListener("click", () => {

        const userTopic = '';
        //If user topic is blank, display error message and dont call API
        if (!userTopic) {
            errorMessage.style.display = 'inline';
        } 

        //If user topic is entered hide all quiz components and call API
        else {
            errorMessage.style.display = 'none';
            quizSection.style.display = 'none';
            quizSubmitButton.style.display = 'none';
            quizScore.style.display = 'none';
        } 

    });

    generateQuizButton.click();

    expect(errorMessage.style.display).toBe('inline');
});

test('Hide error message, quiz section, quiz submit button, and quiz score if topic entered', () => {

    document.body.innerHTML = `
        <input id="quiz-topic-textbox" type="text" placeholder="Type topic to create quiz about here" value="topic">
        <button class="generate-quiz-button">Generate Quiz</button>
        <div class="error-msg">Error: Please enter a topic</div>
        <div class="quiz"></section>
        <div class="quiz-score"></div>
        <button class="quiz-submit-button">Submit</button>

    `

    const generateQuizButton = document.body.querySelector('.generate-quiz-button');
    const errorMessage = document.body.querySelector(".error-msg");
    const quizSection = document.body.querySelector(".quiz");
    const quizScore = document.body.querySelector('.quiz-score');
    const quizSubmitButton = document.body.querySelector('.quiz-submit-button');


    //When generate quiz button is clicked, get the topic entered by the user and then call API
    generateQuizButton.addEventListener("click", () => {

        const userTopic = 'topic';
        //If user topic is blank, display error message and dont call API
        if (!userTopic) {
            errorMessage.style.display = 'inline';
        } 

        //If user topic is entered hide all quiz components and call API
        else {
            errorMessage.style.display = 'none';
            quizSection.style.display = 'none';
            quizSubmitButton.style.display = 'none';
            quizScore.style.display = 'none';
        } 

    });

    generateQuizButton.click();

    expect(errorMessage.style.display).toBe('none');
    expect(quizSection.style.display).toBe('none');
    expect(quizSubmitButton.style.display).toBe('none');
    expect(quizScore.style.display).toBe('none');

});

/*
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyD59cvRLGTGbqq-oQRidggkpYzrNrw1K_I");

test('Check if API data is returned based on topic and if quiz displays with quiz data', () => {

    document.body.innerHTML = `
        <div class="quiz">
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
    `

    const quizSection = document.body.querySelector(".quiz");
    const quizSubmitButton = document.body.querySelector('.quiz-submit-button');

    const questionHeaders = document.body.querySelectorAll('.question');

    const optionAinputs = document.body.querySelectorAll('#option-a');
    const optionBinputs = document.body.querySelectorAll('#option-b');
    const optionCinputs = document.body.querySelectorAll('#option-c');
    const optionDinputs = document.body.querySelectorAll('#option-d');

    let questions = [
        {
            data: { 
                question: "",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                answer: ""
            }
        }
    ];

    async function geminiAPI() {

        const userTopic = 'Java';
    
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
        const prompt = "give a 1 question multiple choice quiz, with no code output questions, about " + userTopic;
    
        const result = await model.generateContent(prompt);
        const response = await result.response;
    
        const text = response.text();
    
        //Parse the API results into seperate question arrays
        const textArray = text.split("\n\n");
    
        //Parse each array within the outer array to get each part of each question into seperate elements
        for (let i = 0; i < 2; i++) {
            textArray[i] = textArray[i].split("\n");
        }
    
        //Parse the last element of the array (last element has all the answers as one element) into seperate elements and assign to array
        const answerArray = textArray[textArray.length - 1].split("\n");
        
        //Assign the question, options, and answer for each question into each question object in the questions array
        for (let i = 0; i < 1; i++) {
            questions[i].data.question = textArray[i + 1][0];
            questions[i].data.option1 = textArray[i + 1][1];
            questions[i].data.option2 = textArray[i + 1][2];
            questions[i].data.option3 = textArray[i + 1][3];
            questions[i].data.option4 = textArray[i + 1][4];
            questions[i].data.answer = answerArray[i + 1];
        }
    
        //For each question header, set the text to the question from the questions object
        let i = 0;
        questionHeaders.forEach(questionHeader => {
            questionHeader.innerHTML = questions[i].data.question;
            i++;
        });
    
        //For each option a, set the text to option 1 from the questions object
        i = 0;
        optionAinputs.forEach(optionAinput => {
            optionAinput.innerHTML = questions[i].data.option1;
            i++;
        });
    
        //For each option b, set the text to option 2 from the questions object
        i = 0;
        optionBinputs.forEach(optionBinput => {
            optionBinput.innerHTML = questions[i].data.option2;
            i++;
        });
    
        //For each option c, set the text to option 3 from the questions object
        i = 0;
        optionCinputs.forEach(optionCinput => {
            optionCinput.innerHTML = questions[i].data.option3;
            i++;
        });
    
        //For each option d, set the text to option 4 from the questions object
        i = 0;
        optionDinputs.forEach(optionDinput => {
            optionDinput.innerHTML = questions[i].data.option4;
            i++;
        });
    
        //Display quiz
        quizSection.style.display = 'grid';
        quizSubmitButton.style.display = 'inline';
    
    }

    geminiAPI();

    expect(response).not.toBe('');
    expect(quizSection.style.display).toBe('grid');
    expect(quizSubmitButton.style.display).toBe('inline');
    expect(questionHeaders[0].innerHTML).not.toBe('');
    expect(optionAinputs[0].innerHTML).not.toBe('');
    expect(optionBinputs[0].innerHTML).not.toBe('');
    expect(optionCinputs[0].innerHTML).not.toBe('');
    expect(optionDinputs[0].innerHTML).not.toBe('');
    expect(answerArray[0]).not.toBe('');

});
*/