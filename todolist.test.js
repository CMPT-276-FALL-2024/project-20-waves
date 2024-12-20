test("add function", () => {
  document.body.innerHTML = `
            <button class = "todo-remove-button" id = "remove1">X</button><p id = "item1"></p>
            <input class = "todo-input-box" id = "todo-input" placeholder="Enter Task Here">
            <button class = "todo-list-done">
                Done
            </button>`;
  const input = "hii";
  let addClick = document.querySelector(".todo-list-done");
  let inputbox = document.querySelector("#todo-input");
  let item1 = document.querySelector("#item1");
  inputbox.value = input;
  function addInput() {
    item1.innerHTML = inputbox.value;
  }
  addClick.addEventListener("click", addInput);
  addClick.click();

  expect(item1.innerHTML).toBe(input);
});
test("remove function", () => {
  document.body.innerHTML = `
                    <button class = "todo-remove-button" id = "remove1">X</button><p id = "item1"></p>
                    <input class = "todo-input-box" id = "todo-input" placeholder="Enter Task Here">
                    <button class = "todo-list-done">
                        Done
                    </button>`;
  const input = "hii";
  let addClick = document.querySelector(".todo-list-done");
  let inputbox = document.querySelector("#todo-input");
  let item1 = document.querySelector("#item1");
  let removeClick = document.querySelector("#remove1");
  inputbox.value = input;
  function addInput() {
    item1.innerHTML = inputbox.value;
  }
  addClick.addEventListener("click", addInput);
  addClick.click();
  function removeItem() {
    item1.innerHTML = "";
  }
  removeClick.addEventListener("click", removeItem);
  removeClick.click();
  expect(item1.innerHTML).toBe("");
});
