chrome.runtime.onInstalled.addListener(async function () {
  //console.log("Installed");
  //update the icon
  chrome.storage.local.get(null, function(result){
    newIcon(Object.keys(result).length);
  });
});
chrome.storage.local.get(null, function(result){
  newIcon(Object.keys(result).length);
});
/* this code will check for a message*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  /* this code checks the name input for stuff that may cause bugs*/
  if (request.from === "popup" && request.subject === "buttonClicked") {
    console.log(request.data);
    if (request.data == "") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          from: "background",
          subject: "gimmeClasses",
          scheduleName: "unnamed",
        });
      });
    } else if (request.data.includes("'") || request.data.includes('"')) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          from: "background",
          subject: "gimmeClasses",
          scheduleName: "Illegal-Name",
        });
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          from: "background",
          subject: "gimmeClasses",
          scheduleName: request.data,
          //ADDED < AND > TO THE REGEX
        });
      });
    }
  }
  /* this code relays a mesage from content.js to popup */
  if (request.from === "content" && request.subject === "giveClasses") {
    console.log("Classes: " + request.data);

 

    if (
      request.data != "" ||
      request.data != null ||
      request.data != undefined
    ) {
      chrome.storage.local.set(request.data, function () {
        console.log("saved " + Object.keys(request.data)[0]);
        chrome.runtime.sendMessage({
          from: "background",
          subject: "AddPlan",
          data: Object.keys(request.data)[0],
        });
      });
    } else {
      alert("error");
    }
  }
  /* this code relays a message from popup to content.js */
  if (request.from === "popup" && request.subject === "loadThis") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: "background",
        subject: "loadThis",
        data: request.data,
      });
    });
  }
  /* this code relays a message from popup to content.js */
  if (request.from === "popup" && request.subject === "import") {
    data = request.data;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: "background",
        subject: "loadThis",
        data: data,
      });
    });
  }

  /* this code relays a message from popup to content.js */
  if (request.from === "popup" && request.subject === "cleanUp") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: "background",
        subject: "cleanUp",
      });
    });
  }
  if (request.from === "popup" && request.subject === "newIcon") {
  newIcon(request.data);
  }
  chrome.storage.local.get(null, function(result){
    newIcon(Object.keys(result).length);
  });
});


  (function (){
    chrome.storage.local.get(null, function(result){
      newIcon(Object.keys(result).length);
    });
  })()

function newIcon(value){
  //change the icon
  if(value == null||value == undefined||value == 0){
    chrome.action.setIcon({
      path: `images/128.png`
      });
  }else{
    chrome.action.setIcon({
      path: `images/icon(${value}).png`
      });
  }
}