// Type your JavaScript code here.
const body = document.body;
const dispatchObserver = new MutationObserver((event) => dispatchMutationCallback(event));
const dialogObserver = new MutationObserver((event) => dialogMutationCallback(event));

const titleRegex = /<h5\s+data-v-.{8}="">(.*?)<\/h5>/
console.log("[RG] INJECTING ... ")

waitForElement('#nav-home', (el) => {
  
  const dispatchNavigation = document.querySelector('#nav-home');
  dispatchObserver.observe(dispatchNavigation, {childList: true, characterData: false, subtree: false});

  const dialogHeader = document.querySelector("#app div.w-100 div.d-flex div");
  dialogObserver.observe(dialogHeader, {childList: true, characterData: false, subtree: false});

  console.log("Sidebar loaded ... Injecting Dispatcher Changes")

  console.log("Injecting new Postalcode Map")
  document.querySelector("#app div.leaflet-pane.leaflet-overlay-pane img").src = "https://recklessgreed.de/images/map.webp";

  // Run immediately
  updateCards();

  // Then every 10 seconds
  setInterval(updateCards, 1000);


});

function dispatchMutationCallback(event) {
    //console.log("MutationCallback", event);
    for (let i in event) {
        let record = event[i];
        //console.log("Record", record);
        if (record.type == "childList" && record.addedNodes.length > 0) {
            let newNode = record.addedNodes[0];
//            console.log("Got new Dispatch", newNode)
            let title = newNode.innerHTML.match(titleRegex)[1];
            let policeCode = "10-00";
            if (title.includes("(") && title.includes(")"))
                policeCode = title.split("(")[1].split(")")[0];
//            console.log(title, policeCode)

            newNode.classList.add("pd-" + policeCode)
        }
    }
}

function dialogMutationCallback(event) {
    console.log("Dialog MutationCallback", event);
    for (let i in event) {
        let record = event[i];
        if (record.type == "childList" && record.addedNodes.length > 0) {
            let dialog = record.addedNodes[0];
            //console.log("Possible Dialog", dialog);
            let content = dialog.querySelector("div.p-dialog-content div");
            let infoInput = content.querySelector("div.d-flex div.w-50.p-1 div.p-inputgroup input");
            let infoSaveButton = content.querySelector("div.d-flex div.w-50.p-1 div.p-inputgroup button");            
            
            let buttonBar = document.createElement("div");

            let button1010 = document.createElement("button");
            button1010.classList.add("p-button");
            button1010.textContent = "10-10";
            button1010.addEventListener("click", () => {
                infoInput.value += " | 10-10";                
                infoInput.dispatchEvent(
                    new Event("input", { bubbles: true })
                );                
                
                setTimeout(() => {
                    infoSaveButton.click();
                }, 1000);

            });
            buttonBar.appendChild(button1010);

            content.prepend(buttonBar);
        }
    }
}

function waitForElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    setTimeout(() => waitForElement(selector, callback), 100);
  }
}


function updateCards() {
    document.querySelectorAll('.p-card').forEach(card => {
        const dateDiv = card.querySelector(
            '.w-50.border-right .background-grey'
        );

        if (!dateDiv) return;

        const txt = dateDiv.textContent.trim();
        const match = txt.match(
            /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/
        );

        if (!match) return;

        const [, d, m, y, h, min] = match;
        const start = new Date(y, m - 1, d, h, min);

        const overdueThree = (Date.now() - start.getTime()) > 3 * 60 * 1000;
        const overdueFive = (Date.now() - start.getTime()) > 5 * 60 * 1000;


        const header = card.querySelector('.w-50.border-right div.background-grey.rounded');
        if (header) {
            header.style.backgroundColor = overdueFive
                ? 'rgba(192,0,0,0.6)'
                : overdueThree
                ? 'rgba(255,165,0,0.6)'
                : '#20262e';
        }
    });
}