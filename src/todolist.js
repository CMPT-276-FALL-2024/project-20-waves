// defining buttons
const todoeditbutton = document.querySelector(".todo-list-edit");
const todolist = document.querySelector(".todo-list");
let edittodotoggled = false;
todoeditbutton.addEventListener("click", () => {
    todolist.style.display = 'none'
    console.log("hi");
 })