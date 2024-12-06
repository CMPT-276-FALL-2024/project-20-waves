// defining todolist items
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
// defining remove buttons
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
// creates array for each remove button
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
// creates array for each item
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
// defining buttons from the html file
const donebutton = document.querySelector(".todo-list-done");
const todolist = document.querySelector(".todo-list");
const maxitems = 10;
let input = document.querySelector("#todo-input");
//defining variables
let items = 0;
//function for checking wether the string inputted by user is only whitespace
function checkWhitespace(str) {
  let j = 0;
  for (let i = 0; i < str.length; i++) {
    //iterates through all values of string
    if (str[i] == " ") {
      j++; //if string has whitespace for character, i , then keep trakc of it
    }
  }
  if (str == "" || j == str.length) {
    //if the amopunt of white space is = amount of characters, then the string is all white space
    return true;
  }
  return false;
}
function addItem(string) {
  if (!checkWhitespace(string)) {
    //hcecks for valid input
    if (items <= maxitems - 1) {
      //makes sure list isnt full
      itemarray[items].innerHTML = string; //adds item
      items++; //increment items
    }
    input.value = ""; // resset inoput box
  }
}
//event listener for enter key
input.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    addItem(input.value);
  }
});

donebutton.addEventListener("click", () => {
  addItem(input.value);
});

//adds event listener to each remove button
for (let i = 0; i < maxitems; i++) {
  removearray[i].addEventListener("click", () => {
    let j = i;
    if (items == maxitems) {
      //check edge case if list is max
      //loop to move each item once the previous is removed
      while (itemarray[j + 1].innerHTML != "") {
        //checks if the next item is filled
        itemarray[j].innerHTML = itemarray[j + 1].innerHTML; //moves next item to previous slot
        j++; //increment step count
        if (j == maxitems - 1) {
          //if ther eis no next item
          break;
        }
      }
      itemarray[items - 1].innerHTML = ""; //set last item to be empty
      items--; //decrease item count
    } else if (itemarray[i].innerHTML !== "") {
      //if the item that corresponds to remove button is not empty
      while (itemarray[j + 1].innerHTML != "") {
        //loop until items are in right spot
        itemarray[j].innerHTML = itemarray[j + 1].innerHTML; //moves next item to previous slot
        j++; //increment step count
      }
      itemarray[j].innerHTML = ""; //set last item to be empty
      items--; //decrease item count
    }
  });
}
