test('Quiz card displays quiz information', () => {
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