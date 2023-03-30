// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    // set friction checkbox
    browser.storage.sync.get("addFriction", function(result) {
      var frictionToggle = document.getElementById("frictionToggle");
      var frictionCustomisation = document.querySelectorAll(".friction-customisation");
      
      frictionToggle.checked = result.addFriction;
      
        if (result.addFriction == undefined || !frictionToggle.checked) {
            // don't show the customisation options if we haven't checked the box
            for (var i = 0; i < frictionCustomisation.length; i++) {
                frictionCustomisation[i].style.display = "none";
                }
        } else {
            for (var i = 0; i < frictionCustomisation.length; i++) {
                frictionCustomisation[i].style.display = "block";
                }
        }
        
      var popupContainer = document.getElementById("popup-content");
      var messageContainer = document.getElementById("delay-content");
            
        
        browser.storage.sync.get("waitText").then(function(result) {
            var waitText = result.waitText;
            var messageBox = document.getElementById("delay-message");

            if (waitText != null) {
                // set the placeholder text
                document.getElementById("waitText").value = result.waitText;
                messageBox.innerText = result.waitText;
            } else {
                document.getElementById("waitText").value = "What's your intention?";
                messageBox.innerText = "What is your intention?";
            }
        });
            
      if(result["addFriction"]) {
          popupContainer.style.display = "none";
          messageContainer.style.display = "block";
          
          // Wait for 1 second before removing the 'show' class
            setTimeout(function() {
              messageContainer.classList.add("show");
            }, 100);
                
        browser.storage.sync.get("waitTime").then(function(result) {
          var waitTime = result.waitTime;
          var countdownBox = document.getElementById("delay-time");
          var countdown = 0;
                
          if (waitTime != null) {
              // set the placeholder text
              document.getElementById("waitTime").value = waitTime;
              
              // Use the wait time value for the count down
              countdownBox.innerText = waitTime;
              countdown = waitTime;
            
          } else {
            countdownBox.innerText = "10";
            document.getElementById("waitTime").value = "10";
            countdown = 10;
          }
                
          // Update countdown timer every second
          var timerId = setInterval(function() {
            countdown--;
            if (countdown >= 0) {
              countdownBox.innerText = countdown;
            } else {
              // Hide the message box and stop the timer
              messageContainer.style.display = "none";
              
              popupContainer.style.display = "block";
              clearInterval(timerId);
            }
          }, 1000);
        });
      } else {
        messageContainer.style.display = "none";
        messageContainer.classList.remove("show");
        popupContainer.style.display = "block";
          
      }
    });
    
    var frictionToggle = document.getElementById("frictionToggle");
    var frictionCustomisation = document.querySelectorAll(".friction-customisation");
    
    // Add event listener to detect changes in the checkbox status
    frictionToggle.addEventListener('change', function() {
        // If the checkbox is checked, show the delay time input
        if (frictionToggle.checked) {
            for (var i = 0; i < frictionCustomisation.length; i++) {
                frictionCustomisation[i].style.display = "block";
              }
        } else {
            // Otherwise, hide it
            for (var i = 0; i < frictionCustomisation.length; i++) {
                frictionCustomisation[i].style.display = "none";
              }
        }
        
        // store the setting
        browser.storage.sync.set({ "addFriction": document.getElementById("frictionToggle").checked });
    });
    
    // store wait customisation immediately
    document.getElementById("waitTime").addEventListener('input', function(){
        browser.storage.sync.set({ "waitTime": parseInt(document.getElementById("waitTime").value) });
    });
    document.getElementById("waitText").addEventListener('input', function(){
        browser.storage.sync.set({ "waitText": document.getElementById("waitText").value });
    });
    
    const platformsWeTarget = [ "youtube", "facebook", "twitter", "instagram", "linkedin", "google" ];
    const elementsThatCanBeHidden = [ "youtubeRecVids",
                                      "youtubeThumbnails",
                                      "youtubeProfileImg",
                                      "youtubeShorts",
                                      "youtubeSubscriptions",
                                      "youtubeLibrary",
                                      "youtubeHistory",
                                      "youtubeExplore",
                                      "youtubeMore",
                                      "youtubeRelated",
                                      "youtubeComments", "twitterExplore", "twitterNotifications", "twitterTrends", "twitterFollow", "twitterTimeline", "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat", "linkedinNews", "linkedinNotifications", "linkedinFeed", "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramSuggestions", "googleAds" ];
    
    // create function to set a checkbox according to current view status on the page
    function setCheckboxState(element_to_check, id_of_toggle){
        var currentToggle = document.getElementById(id_of_toggle);
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            
            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response){
                if (response.text === "hidden"){
                    currentToggle.checked = true;
                } else if (response.text === "visible"){
                    currentToggle.checked = false;
                } else {
                    // if the style element is undefined, set to saved status
                    elementsThatCanBeHidden.forEach(function (element) {
                        var key = element_to_check + "Status";
                        
                        browser.storage.sync.get(key, function(result) {
                            currentToggle.checked = result[key];
                        });
                    });
                }
            });
        });
    };
    
    // create function to make a checkbox toggle view status on and off
    function toggleViewStatus(element_to_change, id_of_toggle){
        var currentCheckbox = document.getElementById(id_of_toggle);
        
        currentCheckbox.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: element_to_change });
              });
            }, false);
    };
    
    // assign the functions to the checkboxes
    elementsThatCanBeHidden.forEach(function (item) {
        setCheckboxState(item, item + "Toggle");
        toggleViewStatus(item, item + "Toggle");
    });
    
    // set switches according to current status
    function setSwitch(platform_to_check, id_of_switch){
        var currentSwitch = document.getElementById(id_of_switch);
        
        var key = platform_to_check + "Status";
        
        browser.storage.sync.get(key, function(result) {
          if (result[key] == false ) {
              currentSwitch.checked = false;
              document.querySelector(".dropdown." + platform_to_check + " button").disabled = true;
          } else {
              currentSwitch.checked = true;
          }
        });
    };
    
    // handle when then switches are turned off or on
    platformsWeTarget.forEach(function(platform) {
        var currentSwitch = document.querySelector('.dropdown.' + platform + ' input');
        
        currentSwitch.addEventListener("change", function() {
            if(!currentSwitch.checked){
                //console.log("just switched off");
                
                // show all distracting elements
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "showAll", element: some_element });
                      });
                    document.getElementById(some_element + "Toggle").checked = false;
                });

                // Save the state of the toggle
                var key = platform + "Status";
                browser.storage.sync.set({ [key]: false });
                
            } else {
                //console.log("just switched on");
                // hide all distracting elements
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "hideAll", element: some_element });
                      });
                    document.getElementById(some_element + "Toggle").checked = true;
                });
                
                // Save the state of the toggle
                var key = platform + "Status";
                browser.storage.sync.set({ [key]: true });
            }
      });
    });
    
    platformsWeTarget.forEach(function (platform) {
        setSwitch(platform, platform + "Switch");
    });
    
    // show the options for the website we're currently on
    chrome.tabs.query({active: true, currentWindow: true}, function(tab){
        platformsWeTarget.forEach(function(platform) {
            var currentHost = new URL(tab[0].url);
            
            if (currentHost.origin.includes(platform)){
                document.querySelector('.dropdown.' + platform).classList.add('shown');
            }
        });
    });
    
    //---- make the save buttons save the state of the checkboxes to local storage ----//
    // helper function to wait for a specified time before executing, so we can give visual feedback on the button
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    
    var saveButtons = document.querySelectorAll('.saveButton');
    for (let i = 0; i < saveButtons.length; i++) {

        saveButtons[i].addEventListener('click', (e) => {
            // save the state of the checkboxes to local storage
            elementsThatCanBeHidden.forEach(function (element) {
                var key = element + "Status";
                
                browser.storage.sync.set({ [key]: document.getElementById(element + "Toggle").checked });
            });
        
            e.target.setAttribute("value", "......");
            delay(250).then(() => e.target.setAttribute("value", "Saved!"));
            delay(1500).then(() => e.target.setAttribute("value", "Save settings"));
      })
    }
    
    const howTo = document.querySelector('#hide-previews');
    const howToText = document.querySelector('#how-to-description');
    const howToArrow = document.querySelector('#how-to-arrow');

    howTo.addEventListener("click", function() {
      if (howToText.style.display === "none") {
        howToText.style.display = "block";
        howToArrow.style.display = "inline-block";
      } else {
        howToText.style.display = "none";
        howToArrow.style.display = "none";
      }
    });
    
}, false);
