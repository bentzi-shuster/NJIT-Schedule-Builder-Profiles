/* this code checks the url of the open website when the extension is opend, and prompts the user to open the correct page if they are not on schedule builder */
chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  let pageTitle = tabs[0].title;
  let url = tabs[0].url;
  if (!url.includes("https://uisapppr3.njit.edu/scbldr/")) {
    //if the url is not on schedule builder
    if (
      confirm(
        "This extension is not made for " +
          pageTitle +
          ", do you want to open Schedule Builder?"
      ) == true
    ) {
      // open schedule builder if the user wants to
      //look at all the tabs and find the one with the url
      chrome.tabs.query({}, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i].url.includes("https://uisapppr3.njit.edu/scbldr/")) {
            //open the curreltly open tab
            chrome.tabs.update(tabs[i].id, { active: true });
            break;
          }
          //if the tab is not found, open the schedule builder
          if (i == tabs.length - 1) {
            chrome.tabs.create({ url: "https://uisapppr3.njit.edu/scbldr/" });
          }
        }
      });
    } else {
      //close the popup when on wrong page , making the ui only for schedule builder
      window.close();
    }
  }
});
/* this code is a utility function for the copy buttons */
function copy(text) {
  const ta = document.createElement("textarea");
  ta.style.cssText =
    "opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;";
  ta.value = text;
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  ta.remove();
}
/* this code will send the message to the background.js when the save button is pressed with the text in the "name" text box*/
const save = document.getElementById("save");
document.getElementById("name").addEventListener("keyup", function (e) {
  if (e.key == "Enter") {
    if(/[^A-Za-z0-9_\-\s]/g.test(document.getElementById("name").value)==true){
      chrome.runtime.sendMessage({
        from: "popup",
        subject: "buttonClicked",
        data: "Invalid Name",
        
      });
    }else{
      chrome.runtime.sendMessage({
      from: "popup",
      subject: "buttonClicked",
      data: document.getElementById("name").value
      
    });
    }
    document.getElementById("name").value = "";
  }
});
save.addEventListener("click", () => {
  if(/[^A-Za-z0-9_\-\s]/g.test(document.getElementById("name").value)==true){
  chrome.runtime.sendMessage({
    from: "popup",
    subject: "buttonClicked",
    data: "Invalid Name",
    
  });
}else{
  chrome.runtime.sendMessage({
  from: "popup",
  subject: "buttonClicked",
  data: document.getElementById("name").value
  
});
}
  document.getElementById("name").value = "";
});
/* this code runs on startup, to rebuild the interface based on the saved schedules in storage */
(function setup() {
  chrome.storage.local.get(null, function (result) {
    Object.keys(result).forEach(function (k) {
      CreatePlanMenu(k);
    });
  });
})();

/* this code is checking for a meassage to add a plan to the menu, and does so if its the correct message type */
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.from === "background" && request.subject === "AddPlan") {
    CreatePlanMenu(request.data);
  }
});
/* this code is the template to create a saved schedule element, and adds the listeners to the buttons */
function CreatePlanMenu(PlanName) {
  //check if the plan is already in the menu
for(let i = 0; i < document.getElementById("plans").children.length; i++){
  if(document.getElementById("plans").children[i].getAttribute('data-name') == PlanName){
    alert("Plan already exists");
    return;
  }
}


  document.getElementById("plans").innerHTML += `<div data-name="${PlanName}" class="savedPlan">
<div class="grey">
<p class="${PlanName} plan">${PlanName}
</div>
<div class="buttons">
<button title="Delete" id="delete_${PlanName}" class="delete delete${PlanName}" ><img id="imgdelete_${PlanName}" src="../images/DeleteButton.svg" alt="delete" /> </button>

<button title="Load" class="load${PlanName}  load" id="load_${PlanName}"><img id="imgload_${PlanName}" src="../images/LoadButton.svg" alt="Load" /></button>

<button title="Update" id="update_${PlanName}" class="update update${PlanName}" ><img id="imgupdate_${PlanName}" src="../images/UpdateButton.svg" alt="update" /></button>

<button title="Rename" class="rename${PlanName}  rename" id="rename_${PlanName}"><img  id="imgrename_${PlanName}" src="../images/RenameButton.svg" alt="Rename" /></button>

<button title="Copy" class="copy${PlanName}  copy" id="copy_${PlanName}"><img  id="imgcopy_${PlanName}" src="../images/CopyButton.svg" alt="Copy" /></button>

<button title="Info" class="info${PlanName}  info" id="info_${PlanName}"><img id="imginfo_${PlanName}" src="../images/InfoButton.svg" alt="Ingo" /></button>

</div>

</div>`;
//ADDED UPDATE BUTTON
for(let i=0;i<document.getElementsByClassName("update").length;i++){
  document.getElementsByClassName("update")[i].addEventListener("click",function(e){
  //erase the old plan
  let planName = e.target.id;
  planName = planName.split("_")[1];
  if(confirm("Are you sure you want to update this plan? It will overwrite the old plan.") == true){
  document.getElementsByClassName(planName)[0].parentElement.parentElement.remove();
chrome.storage.local.remove(planName, function () {});
//remake the plan with the same name

chrome.runtime.sendMessage({
  from: "popup",
  subject: "buttonClicked",
  data: planName
  
});
  }
  });
  
}


  for (let i = 0; i < document.getElementsByClassName("rename").length; i++) {
    document
      .getElementsByClassName("rename")
      [i].addEventListener("click", (e) => {
        let newName = prompt("New Name", e.target.id.split("_")[1]);
        let planName = e.target.id;
        planName = planName.split("_")[1];
        if (newName != null&&newName!=planName&&newName!="") {


           //get the plan from storage
            chrome.storage.local.get(planName, function (result) {
                //remove the old plan
                chrome.storage.local.remove(planName);
                //add the new plan
                if(/[^A-Za-z0-9_\-\s]/g.test(newName)){
                  chrome.storage.local.set({ ["Ivalid Name"]: result[planName] });
                  CreatePlanMenu("Ivalid Name");
                }else{
                  chrome.storage.local.set({ [newName.replace(/<>[.*+?^$%{}()|[\]\\]/g, "\\$&")]: result[planName] });   
                  CreatePlanMenu(newName); 
                } 
                //remove the old plan from the menu
                document.getElementsByClassName(planName)[0].parentElement.parentElement.remove();
                //add the new plan to the menu
                
            
              });
        }
      });
  }

  /* this code adds functinality to the delete button */
  for (let i = 0; i < document.getElementsByClassName("delete").length; i++) {
    document
      .getElementsByClassName("delete")
      [i].addEventListener("click", function (e) {
        let planName = e.target.id;
        planName = planName.split("_")[1];
        if (confirm("Do you want to remove " + planName +" ?")  == true) {
          document
            .getElementsByClassName(planName)[0]
            .parentElement.parentElement.remove();
          chrome.storage.local.remove(planName, function () {});
        }
        chrome.storage.local.get(null, function (result) {
          newIcon(Object.keys(result).length);
        });
      });
  }

  /* this code makes the copy button work */
  for (let i = 0; i < document.getElementsByClassName("copy").length; i++) {
    document
      .getElementsByClassName("copy")
      [i].addEventListener("click", function (e) {
        let planName = e.target.id;
        planName = planName.split("_")[1];

        chrome.storage.local.get(planName, function (result) {
          //copy to clipboard
          copy(result[planName]);
        });
      });
  }

  /* this code maked a popup for the classes when the info button is pressed*/
  for (let i = 0; i < document.getElementsByClassName("info").length; i++) {
    document
      .getElementsByClassName("info")
      [i].addEventListener("click", function (e) {
        let planName = e.target.id;
        planName = planName.split("_")[1];
        info = chrome.storage.local.get(planName, function (result) {
          json = JSON.parse(result[planName]);
          let finalmessage = [];
          let CRNarr=[]
          //ADDED CRN TO INFO POPUP
          Object.keys(json).forEach(function (className) {
            if (className.includes("sel")) {
              finalmessage.push(className.split(":")[1]);
              CRNarr.push(json[className]);
            }
                        });      
                        let print = "";
                        finalmessage.forEach(function (ee,index) {
                          print += ee + " "+ CRNarr[index]+ "\n";
                        })    
                        alert(print);
        });
      });
  }
  /* this code add functinalality to the load button putting a save in the schedule builder */
  for (let i = 0; i < document.getElementsByClassName("load").length; i++) {
    document
      .getElementsByClassName("load")
      [i].addEventListener("click", function (e) {
        let planName = e.target.id;
        planName = planName.split("_")[1];
        if (
          confirm(
            "Do you want to load " +
              planName +
              ", it will clear the open schedule"
          ) == true
        ) {
          chrome.storage.local.get(planName, function (result) {
            chrome.runtime.sendMessage({
              from: "popup",
              subject: "loadThis",
              data: result[planName],
            });
          });
        }
      });
  }
}
/* this code can remove all saved data */
document
  .getElementById("clearAll")
  .addEventListener("click", async function () {
     let conf= prompt('Please type (or paste) "NJIT" to permanently delete all saved data');
     if(conf.toUpperCase()=="NJIT"){
      await chrome.storage.local.clear();
      document.getElementById("plans").innerHTML = ``;
      newIcon(0);
     }
    
  });
/* this code can just clear the current schedule */
document.getElementById("clear").addEventListener("click", async function () {
  if (confirm("Do you want to clear the open schedule?") == true) {
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "cleanUp",
    });
  }
});
/* this code adds functiinality to the inport code button*/
document.getElementById("import").addEventListener("click", async function () {
  if (confirm("Do you want to import this schedule?") == true) {
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "import",
      data: document.getElementById("pastehere").value,
    });
  }
  document.getElementById("pastehere").value = "";
});
//press enter when you are done typing to import
document.getElementById("pastehere").addEventListener("keyup", function (e) {
  if (e.key == "Enter") {
    if (confirm("Do you want to import this schedule?") == true) {
      chrome.runtime.sendMessage({
        from: "popup",
        subject: "import",
        data: document.getElementById("pastehere").value,
      });
    }
    document.getElementById("pastehere").value = "";
  }
});

function newIcon(value) {
  //change the icon
  //send message to background.js
  chrome.runtime.sendMessage({
    from: "popup",
    subject: "newIcon",
    data: value,
  });
}
