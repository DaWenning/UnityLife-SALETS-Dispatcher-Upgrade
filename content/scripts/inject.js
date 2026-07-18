// Type your JavaScript code here.
const body = document.body;
const dispatchObserver = new MutationObserver((event) => dispatchMutationCallback(event));
const dialogObserver = new MutationObserver((event) => dialogMutationCallback(event));

const carObserver = new MutationObserver((event) => { lastUpdate = new Date(); });

const titleRegex = /<h5\s+data-v-.{8}="">(.*?)<\/h5>/
console.log("[RG] INJECTING ... ")

let lastUpdate = null;



waitForElement('#nav-home', (el) => {
  
  const dispatchNavigation = document.querySelector('#nav-home');
  dispatchObserver.observe(dispatchNavigation, {childList: true, characterData: false, subtree: false});

  const dialogHeader = document.querySelector("#app div.w-100 div.d-flex div");
  dialogObserver.observe(dialogHeader, {childList: true, characterData: false, subtree: false});

  let carHeader = document.querySelector("#app div.w-100 div.d-flex div div.vue2leaflet-map div.leaflet-pane div.leaflet-pane.leaflet-marker-pane");
  if (!carHeader) { // dutyShow
    carHeader = document.querySelector("#app div.w-100 div.w-100 div.vue2leaflet-map div.leaflet-pane div.leaflet-pane.leaflet-marker-pane");
  }
  if (!carHeader) {
    console.error("Car Header not found ");
  }
  else {
    carObserver.observe(carHeader, {childList: true, characterData: false, subtree: false});
    lastUpdate = new Date();
    setInterval(() => {
        // console.log("Last update received at: ", lastUpdate);
        if (lastUpdate && (new Date() - lastUpdate) > 3 * 60 * 1000) {
            console.log("No updates from car observer in the last 3 minutes");
            if (document.querySelector("#no-update-warning")) return;
            let noUpdateWarning = document.createElement("div");
            noUpdateWarning.id = "no-update-warning";
            noUpdateWarning.textContent = "SALETS scheint seit 3 Minuten keine Änderung empfangen zu haben.\nBitte Lade die Seite neu!";
            noUpdateWarning.style.position = "fixed";
            noUpdateWarning.style.top = "10px";
            noUpdateWarning.style.right = "10px";
            noUpdateWarning.style.backgroundColor = "red";
            noUpdateWarning.style.border = "4px solid darkred";
            noUpdateWarning.style.borderRadius = "8px";
            noUpdateWarning.style.color = "white";
            noUpdateWarning.style.padding = "10px";
            noUpdateWarning.style.zIndex = "10000";
            noUpdateWarning.style.whiteSpace = "pre-line";
            document.body.appendChild(noUpdateWarning);
        
        }
    }, 10000);
  }

  console.log("Sidebar loaded ... Injecting Dispatcher Changes")

  console.log("Injecting new Postalcode Map")
  document.querySelector("#app div.leaflet-pane.leaflet-overlay-pane img").src = "https://recklessgreed.de/images/map.webp";

  // Run immediately
  updateCards();

  // Then every 10 seconds
  setInterval(updateCards, 1000);  
});


function dispatchMutationCallback(event) {
    for (let i in event) {
        let record = event[i];
        //console.log("Record", record);
        if (record.type == "childList" && record.addedNodes.length > 0) {
            let newNode = record.addedNodes[0];

            if (!newNode || !newNode.innerHTML) return;
            let title = newNode.innerHTML.match(titleRegex)[1];
            let policeCode = "10-00";
            if (title.includes("(") && title.includes(")"))
                policeCode = title.split("(")[1].split(")")[0];
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

            if (! dialog ) return;
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