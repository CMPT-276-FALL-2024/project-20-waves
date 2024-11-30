import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyD59cvRLGTGbqq-oQRidggkpYzrNrw1K_I");
//dinfing variables
const input = document.querySelector("#chatbot-input");
const responsebox = document.getElementById('response');
const enterbutton = document.querySelector('#chatbot-enter');
let userInput;

let userresponsearray = []


function checkWhitespace(str) {
    let whitespace = new Set([" ", "\t", "\n", ""]);
        let j = 0;
        for (let i =0; i<str.length; i++){
            if (str[i] == " "){
                j++;
            }
        }
        if (str == ""||j == str.length ) {
            return true;
        }
    return false;
}

input.addEventListener("keyup", ({key}) => {
    if(key === "Enter"){
        if (!checkWhitespace(input.value) ){
            console.log(input.value);
            userInput = input.value
            geminiAPI();
            
            input.value = "";
        }}

 })

enterbutton.addEventListener("click", () => { 
        if (!checkWhitespace(input.value) ){
            console.log(input.value);
            userInput = input.value
            geminiAPI();
            
            input.value = "";
        }
 })
 MathJax.typesetPromise().then(() => {
    // modify the DOM here
    MathJax.typesetPromise();
  }).catch((err) => console.log(err.message));
let promise = Promise.resolve();  // Used to hold chain of typesetting calls

function typeset(code) {
  promise = promise.then(() => MathJax.typesetPromise(code()))
                   .catch((err) => console.log('Typeset failed: ' + err.message));
  return promise;
}

//gemini prompt fucntion
async function geminiAPI() {

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = userInput;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();
    typeset(() => {
        responsebox.innerHTML = text;
        return [text];
      });
    
}