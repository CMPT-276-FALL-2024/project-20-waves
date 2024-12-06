//set up Gemini API
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyD59cvRLGTGbqq-oQRidggkpYzrNrw1K_I");
//dinfing html elements
const input = document.querySelector("#chatbot-input");
const responsebox = document.getElementById("response");
const enterbutton = document.querySelector(".chatbot-enter");
//defin variables for user input
let userInput;

function checkWhitespace(str) {//funciton to check if str is a whitespace
  let j = 0;
  for (let i = 0; i < str.length; i++) {//iterates through all values of string
    if (str[i] == " ") {
      j++;//if string has whitespace for character, i , then keep trakc of it
    }
  }
  if (str == "" || j == str.length) {//if the amopunt of white space is = amount of characters, then the string is all white space
    return true;
  }
  return false;
}

function sendInput(string){ //function to send user input
  if (!checkWhitespace(input.value)) { //check for validity
    userInput = input.value; //assign input to userinput vairable to be used in gemeiniAPI fucniton
    geminiAPI(); //run function to send text to api
    input.value = ""; //reset input box
  }
  else{//error case
    responsebox.innerHTML = "ERROR: please enter a message"; //displya errror to user
    responsebox.style.color = "#ff0033" //change to text red
  }
}
//adds event listeners for input
input.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    sendInput(input.value);
  }
});

enterbutton.addEventListener("click", () => {
  sendInput(input.value);
});

//gemini prompt fucntion
async function geminiAPI() {
  //define model used
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  //set up prompt to send
  const prompt = userInput;
  //retrieve resuilts
  const result = await model.generateContent(prompt); //gets resuklt
  const response = await result.response; //gets reposnse
  const text = response.text(); //get text
  //display reponse form api
  responsebox.innerHTML = text;
  responsebox.style.color = "#000000" //changes text colour back to black
}
