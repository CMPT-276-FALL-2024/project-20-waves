// defining constants for todolist items
const item1 = document.querySelector("#item1");
const item2 = document.querySelector("#item2");
const item3 = document.querySelector("#item3");
const item4 = document.querySelector("#item4");
const item5 = document.querySelector("#item5");
const item6 = document.querySelector("#item6");
const item7 = document.querySelector("#item7");
const item8 = document.querySelector("#item8");
const item9 = document.querySelector("#item9");
const item10 = document.querySelector("#item10");
const remove1 = document.querySelector("#remove1");
const remove2 = document.querySelector("#remove2");
const remove3 = document.querySelector("#remove3");
const remove4 = document.querySelector("#remove4");
const remove5 = document.querySelector("#remove5");
const remove6 = document.querySelector("#remove6");
const remove7 = document.querySelector("#remove7");
const remove8 = document.querySelector("#remove8");
const remove9 = document.querySelector("#remove9");
const remove10 = document.querySelector("#remove10");
const removearray = [
  remove1,
  remove2,
  remove3,
  remove4,
  remove5,
  remove6,
  remove7,
  remove8,
  remove9,
  remove10,
];
const itemarray = [
  item1,
  item2,
  item3,
  item4,
  item5,
  item6,
  item7,
  item8,
  item9,
  item10,
];
// defining buttons
const donebutton = document.querySelector(".todo-list-done");
const todolist = document.querySelector(".todo-list");
const maxitems = 10;
// let todovalues = ["","","","","","","","","",""];
let input = document.querySelector("#todo-input");
//defining variables
let items = 0;

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

input.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    if (!checkWhitespace(input.value)) {
      if (items <= maxitems - 1) {
        itemarray[items].innerHTML = input.value;
        items++;
      }
      input.value = "";
    }
  }
});

donebutton.addEventListener("click", () => {
  if (!checkWhitespace(input.value)) {
    if (items <= maxitems - 1) {
      itemarray[items].innerHTML = input.value;
      items++;
    }
    input.value = "";
  }
});

for (let i = 0; i < maxitems; i++) {
  removearray[i].addEventListener("click", () => {
    let j = i;
    if (items == maxitems) {
      while (itemarray[j + 1].innerHTML != "") {
        itemarray[j].innerHTML = itemarray[j + 1].innerHTML;
        console.log(j);
        j++;
        if (j == maxitems - 1) {
          break;
        }
      }
      itemarray[items - 1].innerHTML = "";
      items--;
    } else if (itemarray[i].innerHTML !== "") {
      while (itemarray[j + 1].innerHTML != "") {
        itemarray[j].innerHTML = itemarray[j + 1].innerHTML;
        j++;
      }
      itemarray[j].innerHTML = "";
      items--;
    }
  });
}
