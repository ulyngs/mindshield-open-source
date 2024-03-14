// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    const platformsWeTarget = [ "youtube", "facebook", "twitter", "instagram", "linkedin", "whatsapp", "google" ];
    const elementsThatCanBeHidden = [ "youtubeSearch", "youtubeSearchPredict", "youtubeRecVids", "youtubeThumbnails", "youtubeNotifications", "youtubeProfileImg",
                                      "youtubeShorts", "youtubeSubscriptions", "youtubeLibrary", "youtubeHistory", "youtubeExplore", "youtubeMore",
                                      "youtubeRelated", "youtubeSidebar", "youtubeComments", "youtubeAds", "youtubeViews", "youtubeLikes", "youtubeSubscribers",
                                      "twitterExplore", "twitterNotifications", "twitterTrends", "twitterFollow", "twitterTimeline",
                                      "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat",
                                      "linkedinNews", "linkedinNotifications", "linkedinFeed", "linkedinAds",
                                      "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramReels", "instagramSuggestions", "instagramComments",
                                      "whatsappPreview","whatsappNotificationPrompt",
                                      "googleAds", "googleBackground" ];
    
    
    // Initialize or increment the open count in localStorage
        let opensCount = localStorage.getItem('opensCount');
        opensCount = opensCount ? parseInt(opensCount, 10) + 1 : 1; // Parse to number if exists and increment, else initialize with 1
        localStorage.setItem('opensCount', opensCount);

        // Check if the user has previously clicked 'No, thanks'
        let noThanksClicked = localStorage.getItem('noThanksClicked') === 'true';

        // Show the review prompt every 12th open unless 'No, thanks' has been clicked
        if (opensCount % 12 === 0 && !noThanksClicked) {
            var reviewPrompt = document.getElementById('reviewPrompt');
            if (reviewPrompt) {
                reviewPrompt.style.display = 'block';
            }
        }
    
    // Handling the 'No, thanks' button click
        document.getElementById('noThanksButton').addEventListener('click', function() {
            localStorage.setItem('noThanksClicked', 'true'); // Set the flag when 'No, thanks' is clicked
            // Optionally hide the prompt immediately
            var reviewPrompt = document.getElementById('reviewPrompt');
            if (reviewPrompt) {
                reviewPrompt.style.display = 'none';
            }
        });
    
    // set friction checkbox
    browser.storage.sync.get("addFriction", function(result) {
        var frictionToggle = document.getElementById("frictionToggle");
        var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");
        
        frictionToggle.checked = result.addFriction;
        
          if (result.addFriction == undefined || !frictionToggle.checked) {
              frictionCustomisationArrow.style.display = "none";
          } else {
              frictionCustomisationArrow.style.display = "block";
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
    
    // make the friction customisation arrow and text appear/disappear with the delay toggle
    var frictionToggle = document.getElementById("frictionToggle");
    var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");
    
    // Add event listener to detect changes in the checkbox status
    frictionToggle.addEventListener('change', function() {
        // store the setting
        browser.storage.sync.set({ "addFriction": document.getElementById("frictionToggle").checked });
        
        // If the checkbox is checked, show the delay time input
        if (frictionToggle.checked) {
            frictionCustomisationArrow.style.display = "block";
        } else {
            frictionCustomisationArrow.style.display = "none";
        }
        
    });
    
    // make the frictionCustomisationArrow go from right to down on click
    var frictionCustomisationArrowRight = document.getElementById("frictionCustomisationArrowRight");
    var frictionCustomisationArrowDown = document.getElementById("frictionCustomisationArrowDown");
    var frictionCustomisationOptions = document.querySelector(".toggle-group.friction-customisation");
    
    // Add event listener to detect changes in the checkbox status
    frictionCustomisationArrow.addEventListener('click', function() {
        // If the checkbox is checked, show the delay time input
        if (frictionCustomisationArrowRight.style.display == "inline") {
            frictionCustomisationArrowRight.style.display = "none";
            frictionCustomisationArrowDown.style.display = "inline";
            frictionCustomisationOptions.style.display = "block";
        } else {
            frictionCustomisationArrowRight.style.display = "inline";
            frictionCustomisationArrowDown.style.display = "none";
            frictionCustomisationOptions.style.display = "none";
        }
    });
    
    // store wait customisation
    // wait time
    var savedTextTime = document.getElementById("savedTextTime");
    let hideTimeOut;
    
    document.getElementById("waitTime").addEventListener('input', function(){
        clearTimeout(hideTimeOut);
        
        let waitValue = parseInt(document.getElementById("waitTime").value);
        const maxLimit = 600;
        const minLimit = 1;
        
        if(waitValue < minLimit){
            document.getElementById("waitTime").value = minLimit;
        } else if(waitValue > maxLimit){
            savedTextTime.innerText = "Maximum is " + maxLimit;
            document.getElementById("waitTime").value = maxLimit;
            savedTextTime.style.display = 'block';
            hideTimeOut = setTimeout(function() {
                savedTextTime.style.display = 'none';
            }, 2500);
        }
    });
    
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
    function toggleViewStatusCheckbox(element_to_change, id_of_toggle){
        var currentCheckbox = document.getElementById(id_of_toggle);
        
        currentCheckbox.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: element_to_change });
            });
        }, false);
    };
    
    // create function to set a button according to current view status on the page
    function setButtonState(element_to_check, id_of_toggle){
        var currentButton = document.getElementById(id_of_toggle);
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            
            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response){
                if (response.text === "hidden"){
                    currentButton.setAttribute("data-state", "Off");
                } else if (response.text === "visible"){
                    currentButton.setAttribute("data-state", "On");
                } else if (response.text === "blur"){
                    currentButton.setAttribute("data-state", "Blur");
                } else {
                    // if the style element is undefined, set to saved status
                    var key = element_to_check + "Status";
                    
                    browser.storage.sync.get(key, function(result) {
                        var status = result[key];
                        currentButton.setAttribute("data-state", result[key]);
                    });
                }
            });
        });
    };

    
    // create function to make a button toggle view status on and off
    function toggleViewStatusButton(element_to_change, id_of_toggle){
        var currentButton = document.getElementById(id_of_toggle);
        let state;

        currentButton.addEventListener('click', function() {
            if (currentButton.getAttribute("data-state") == "On"){
                currentButton.setAttribute("data-state", "Off");
                state = "Off";
            } else if (currentButton.getAttribute("data-state") == "Off"){
                currentButton.setAttribute("data-state", "Blur");
                state = "Blur";
            } else {
                currentButton.setAttribute("data-state", "On");
                state = "On";
            }
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "changeHideBlur", element: element_to_change, action: state });
            });
        }, false);
    };


    
    // assign the functions to the checkboxes
    elementsThatCanBeHidden.forEach(function (item) {
        if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
            setButtonState(item, item + "Toggle");
            toggleViewStatusButton(item, item + "Toggle");
        } else {
            setCheckboxState(item, item + "Toggle");
            toggleViewStatusCheckbox(item, item + "Toggle");
        }
    });
    
    // set switches according to current status
    function setSwitch(platform_to_check, id_of_switch){
        var currentSwitch = document.getElementById(id_of_switch);
        
        var key = platform_to_check + "Status";
        
        browser.storage.sync.get(key, function(result) {
          if (result[key] == false ) {
              currentSwitch.checked = false;
              
              // disable the checkboxes if the switch is off
              var filteredElements = elementsThatCanBeHidden.filter(element =>
                element.includes(platform_to_check)
              );
              filteredElements.forEach(function (item) {
                  document.getElementById(item + "Toggle").disabled = true;
              });
              
          } else {
              currentSwitch.checked = true;
          }
        });
    };
    
    // handle when then switches are turned off or on
    platformsWeTarget.forEach(function(platform) {
        var currentSwitch = document.querySelector('#website-toggles #toggle-' + platform + ' input');
        var allCheckboxes = document.querySelectorAll('.dropdown.' + platform + ' .a-toggle input');
        
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
                
                // disable the checkboxes
                allCheckboxes.forEach(aCheckbox => {
                        aCheckbox.disabled = true;
                });
                

                // Save the state of the toggle
                var key = platform + "Status";
                browser.storage.sync.set({ [key]: false });
                
            } else {
                //console.log("just switched on");

                // restore saved state
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    var currentToggle = document.getElementById(some_element + "Toggle");
                    var key = some_element + "Status";
                    
                    browser.storage.sync.get(key, function(result) {
                        currentToggle.checked = result[key];
                        
                        if(currentToggle.checked){
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: some_element });
                              });
                        }
                    });
                });
                
                // disable the checkboxes
                allCheckboxes.forEach(aCheckbox => {
                        aCheckbox.disabled = false;
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
                document.querySelector('#website-toggles #toggle-' + platform).classList.add('shown-inline');
            }
        });
    });
    
    //---- make the save buttons save the state of the checkboxes to local storage ----//
    // helper function to wait for a specified time before executing, so we can give visual feedback on the button
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    
    var saveButton = document.querySelector('#saveButton');
    
    saveButton.addEventListener('click', (e) => {
        
        // loop over the elements for the page we're currently on and set storage according to the checkboxes
        chrome.tabs.query({active: true, currentWindow: true}, function(tab){
            platformsWeTarget.forEach(function(platform) {
                var currentHost = new URL(tab[0].url);
                
                if (currentHost.origin.includes(platform)){
                    var filteredElements = elementsThatCanBeHidden.filter(element =>
                                                                          element.includes(platform)
                                                                          );
                    
                    filteredElements.forEach(function (element) {
                        var key = element + "Status";
                        browser.storage.sync.set({ [key]: document.getElementById(element + "Toggle").checked });
                    });
                }
            });
        });
        
        // save the delay time
        let waitValue = parseInt(document.getElementById("waitTime").value);
        browser.storage.sync.set({ "waitTime": waitValue });
        // save the delay message
        browser.storage.sync.set({ "waitText": document.getElementById("waitText").value });
    
        e.target.setAttribute("value", "......");
        delay(250).then(() => e.target.setAttribute("value", "Saved!"));
        delay(1500).then(() => e.target.setAttribute("value", "Save settings"));
    })
    
    const howTo = document.querySelector('#hide-previews');
    const howToText = document.querySelector('#how-to-description');
    const howToArrowRight = document.querySelector('#how-to-arrow-right');
    const howToArrowDown = document.querySelector('#how-to-arrow-down');

    howTo.addEventListener("click", function() {
      if (howToText.style.display === "none") {
          howToText.style.display = "block";
          howToArrowRight.style.display = "none";
          howToArrowDown.style.display = "inline-block";
      } else {
          howToText.style.display = "none";
          howToArrowRight.style.display = "inline-block";
          howToArrowDown.style.display = "none";
      }
    });
    
    // for hiding showing the removal of video previews on non-mobile
    const howToNotMobile = document.querySelector('#hide-previews-not-mobile');
    const howToTextNotMobile = document.querySelector('#how-to-description-not-mobile');
    const howToArrowRightNotMobile = document.querySelector('#how-to-arrow-right-not-mobile');
    const howToArrowDownNotMobile = document.querySelector('#how-to-arrow-down-not-mobile');

    howToNotMobile.addEventListener("click", function() {
      if (howToTextNotMobile.style.display === "none") {
          howToTextNotMobile.style.display = "block";
          howToArrowRightNotMobile.style.display = "none";
          howToArrowDownNotMobile.style.display = "inline-block";
      } else {
          howToTextNotMobile.style.display = "none";
          howToArrowRightNotMobile.style.display = "inline-block";
          howToArrowDownNotMobile.style.display = "none";
      }
    });
    
    const sites = document.querySelector('#what-sites');
    const sitesText = document.querySelector('#sites-available');
    const sitesArrowRight = document.querySelector('#sites-arrow-right');
    const sitesArrowDown = document.querySelector('#sites-arrow-down');

    sites.addEventListener("click", function() {
      if (sitesText.style.display === "none") {
          sitesText.style.display = "block";
          sitesArrowRight.style.display = "none";
          sitesArrowDown.style.display = "inline-block";
      } else {
          sitesText.style.display = "none";
          sitesArrowRight.style.display = "inline-block";
          sitesArrowDown.style.display = "none";
      }
    });
    
}, false);
