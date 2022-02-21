let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");

let modal = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textarea = document.querySelector(".textarea-cont");
let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketArr = [];

//if localstorage has tickets display them first
if(localStorage.getItem("jira-tickets")){
    ticketArr = JSON.parse(localStorage.getItem("jira-tickets"));

    ticketArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    })
}

//filtering
for(let i = 0; i < toolBoxColors.length; i++){
    toolBoxColors[i].addEventListener("click", (e) => {
        //filter tickets based on color
        let currentToolBoxColor = toolBoxColors[i].classList[1];

        let filteredTickets = ticketArr.filter((ticketObj) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        //remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i < allTicketsCont.length; i++){
            allTicketsCont[i].remove();
        }

        //display filtered tickets
        filteredTickets.forEach((ticketObj) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })

    // display back all tickets on double click
    toolBoxColors[i].addEventListener("dblclick", (e) => {
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i < allTicketsCont.length; i++){
            allTicketsCont[i].remove();
        }

        ticketArr.forEach((ticketObj) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })
}

//select priority color in modal
allPriorityColors.forEach((color, idx) => {
    color.addEventListener("click", (e) => {
        allPriorityColors.forEach((color2) => {
            color2.classList.remove("border");
        })
        color.classList.add("border");
        modalPriorityColor = color.classList[1];
    })
})

//display modal and generate ticket
//addFlag = true, display modal
addBtn.addEventListener("click", (e) => {
    addFlag = !addFlag;
    if(addFlag){
        modal.style.display = "flex";
    }
    else{
        modal.style.display = "none";
    }
})

//toggle remove ticket button
removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag
})

//create ticket on shift press
modal.addEventListener("keydown", (e) => {
    if(e.key === "Shift"){
        createTicket(modalPriorityColor, textarea.value);
        addFlag = !addFlag;
        setModalToDefault();
    }
})

function createTicket(ticketColor, ticketTask, ticketId){
    let id = ticketId || shortid();
    let ticket = document.createElement("div");
    ticket.setAttribute("class", "ticket-cont");
    ticket.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>
    `;
    mainCont.appendChild(ticket);

    //create object of ticket and push into array and store array in local storage
    if(!ticketId ){
        ticketArr.push({ticketColor, ticketTask, ticketId : id});
        localStorage.setItem("jira-tickets", JSON.stringify(ticketArr));
    }

    handleRemoval(ticket, id);
    handleLock(ticket, id);
    handleColor(ticket, id);
}

//remove ticket
//removeFlag = true then remove
function handleRemoval(ticket, id){
    ticket.addEventListener("click", (e) => {

        if(!removeFlag) return;

        let ticketIdx = getTicketIdx(id);
        ticketArr.splice(ticketIdx, 1);
        localStorage.setItem("jira-tickets", JSON.stringify(ticketArr)); //db removal

        ticket.remove(); //ui removal

    })
}

//handle lock 
function handleLock(ticket, id){
    let lockElem = ticket.querySelector(".ticket-lock");
    let lock = lockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    let ticketIdx = getTicketIdx(id);

    lock.addEventListener("click", (e) => {
        if(lock.classList.contains(lockClass)){
            lock.classList.remove(lockClass);
            lock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else{
            lock.classList.remove(unlockClass);
            lock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");

        }

        //modify in local storage(task area)
        ticketArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira-tickets", JSON.stringify(ticketArr));
    })

    
}

//handle color on top of ticket on clicking
function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");

    let ticketIdx = getTicketIdx(id);

    ticketColor.addEventListener("click", (e) => {
        let currentTicketColor = ticketColor.classList[1];
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        })

        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        //modify in local storage (color change)
        ticketArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira-tickets", JSON.stringify(ticketArr));
    })
}

function getTicketIdx(id){
    let ticketIdx = ticketArr.findIndex((ticketObj) => {
        return ticketObj.ticketId === id;
    })
    return ticketIdx;
}

//set Modal to default state
function setModalToDefault(){
    textarea.value = '';
    modal.style.display = "none";
    allPriorityColors.forEach((color) => {
        color.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
    modalPriorityColor = colors[colors.length - 1];
}