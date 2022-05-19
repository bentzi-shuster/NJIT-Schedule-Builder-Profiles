/* this code allows the user to press ctrl + s, and save a schedule*/
window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key == "s") {
    event.preventDefault();
    let planName = prompt("Enter a plan name");
    if (planName) {
      if (/[^A-Za-z0-9\-\s]/g.test(planName)==true) {
        chrome.runtime.sendMessage({
          from: "content",
          subject: "giveClasses",
          data: { ["Invalid Name"]: JSON.stringify(localStorage) },
        });
      } else {
        chrome.runtime.sendMessage({
          from: "content",
          subject: "giveClasses",
          data: { [planName]: JSON.stringify(localStorage) },
        });
      }
    } else {
      alert("Not saved - Invalid name or cancelled");
    }
  }
});
/* this code checks for a measage */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  /* this code will send a message to content when told to do so by background*/
  if (request.from === "background" && request.subject === "gimmeClasses") {
    chrome.runtime.sendMessage({
      from: "content",
      subject: "giveClasses",
      data: { [request.scheduleName]: JSON.stringify(localStorage) },
    });
  }
  /* this code will load the schedule */
  if (request.from === "background" && request.subject === "loadThis") {
    localStorage.clear();
    var data = JSON.parse(request.data);
    Object.keys(data).forEach(function (k) {
      console.log(k, data[k]);
      localStorage.setItem(k, data[k]);
    });
    window.location.reload();
  }
  if (request.from === "background" && request.subject === "cleanUp") {
    /* this code will clear the local storage on the page, not the chrome extention*/
    localStorage.clear();
    window.location.reload();
  }
});
