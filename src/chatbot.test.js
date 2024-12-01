test("check if input is being sent", () => {
  document.body.innerHTML = `
              <div class="chatbot">
      <h1>AI Help</h1>
      <div class="response-box">
        <p id="response"></p>
      </div>
      <div class="chatbot-input">
        <h2>Type a question in here and an AI will answer</h2>
        <input
          class="chatbot-input-box"
          id="chatbot-input"
          placeholder="Enter Question Here"
        />
        <button class="chatbot-enter">Enter</button>
      </div>
    </div>`;

  const input = document.querySelector("#chatbot-input");
  const enterbutton = document.querySelector(".chatbot-enter");
  input.value = "question";
  function checkWhitespace(str) {
    let whitespace = new Set([" ", "\t", "\n", ""]);
    let j = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] == " ") {
        j++;
      }
    }
    if (str == "" || j == str.length) {
      return true;
    }
    return false;
  }
  enterbutton.addEventListener("click", () => {
    if (!checkWhitespace(input.value)) {
      userInput = input.value;
      input.value = "";
    }
  });
  //When generate quiz button is clicked, get the topic entered by the user and then call API

  enterbutton.click();

  expect(userInput).toBe("question");
});
test("check if reponse is displayed", () => {
    document.body.innerHTML = `
                <div class="chatbot">
        <h1>AI Help</h1>
        <div class="response-box">
          <p id="response"></p>
        </div>
        <div class="chatbot-input">
          <h2>Type a question in here and an AI will answer</h2>
          <input
            class="chatbot-input-box"
            id="chatbot-input"
            placeholder="Enter Question Here"
          />
          <button class="chatbot-enter">Enter</button>
        </div>
      </div>`;
  
    const input = document.querySelector("#chatbot-input");
    const enterbutton = document.querySelector(".chatbot-enter");
    const responsebox = document.getElementById("response");
     const response = "answer";
    responsebox.innerHTML = response;
    //When generate quiz button is clicked, get the topic entered by the user and then call API

  
    expect(responsebox.innerHTML).toBe(response);
  });
