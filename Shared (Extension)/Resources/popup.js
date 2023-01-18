// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    const platformsWeTarget = [ "youtube", "facebook", "twitter", "instagram", "linkedin", "google" ];
    const elementsThatCanBeHidden = [ "youtubeRecVids", "youtubeShorts", "youtubeSubscriptions", "youtubeExplore", "youtubeMore", "youtubeRelated", "youtubeComments", "twitterExplore", "twitterNotifications", "twitterTrends", "twitterFollow", "twitterTimeline", "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat", "linkedinNews", "linkedinNotifications", "linkedinFeed", "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramSuggestions", "googleAds" ];
    
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
        var currentDropdownButton = document.querySelector('.dropdown.' + platform + ' button');
        
        currentSwitch.addEventListener("change", function() {
            if(currentSwitch.checked){
                document.querySelector(".dropdown." + platform + " button").disabled = false;
                
                // turn off all distracting elements
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "turnOff", element: some_element });
                      });
                    
                    document.getElementById(some_element + "Toggle").checked = true;
                });

                // Save the state of the toggle
                var key = platform + "Status";
                browser.storage.sync.set({ [key]: currentSwitch.checked });
                
            } else {
                document.querySelector(".dropdown." + platform + " button").disabled = true;
                
                // turn on all distracting elements
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "turnOn", element: some_element });
                      });
                    
                    document.getElementById(some_element + "Toggle").checked = false;
                });
                
                // Save the state of the toggle
                var key = platform + "Status";
                browser.storage.sync.set({ [key]: currentSwitch.checked });
            }
      });
    });
    
    platformsWeTarget.forEach(function (platform) {
        setSwitch(platform, platform + "Switch");
    });
    
    //---- handle clicks on the dropdown buttons ----//
    function dropdownButtonClicked(event) {
      // Handle the click event for the clicked button
      var clickedButton = event.currentTarget;

      // Get the dropdown content for the clicked button
      var dropdownContent = clickedButton.nextElementSibling;
        
      // Select the dropdown content element with the "shown" class
      var shownDropdown = document.querySelector('.dropdown-content.shown');
    
      // Check if the dropdown content element with the "shown" class is the same as the dropdown content for the clicked button. If it is, then toggle the class off
      if (shownDropdown === dropdownContent) {
          dropdownContent.classList.toggle('shown');
          document.querySelector('body').classList.remove('overlay');
      } else {
          // Select all of the dropdown content elements with the "shown" class
          var shownDropdowns = document.querySelectorAll('.dropdown-content.shown');
            
          // remove the 'shown' class from them
          shownDropdowns.forEach(function(dropdown) {
            dropdown.classList.remove('shown');
          });

          // Toggle the "shown" class on the dropdown content
          dropdownContent.classList.toggle('shown');
          document.querySelector('body').classList.add('overlay');
      }
    }
    
    // Add click event listeners to the buttons
    var dropdownButtons = document.querySelectorAll('.dropdown button');

    dropdownButtons.forEach(function(button) {
      button.addEventListener('click', dropdownButtonClicked);
    });
    
    // open the dropdown for the website we're currently on
    chrome.tabs.query({active: true, currentWindow: true}, function(tab){
        platformsWeTarget.forEach(function(platform) {
            var currentHost = new URL(tab[0].url);
            
            if (currentHost.origin.includes(platform)){
                document.querySelector('.dropdown.' + platform + ' button').click();
                // make the body dark
                document.querySelector('body').classList.add('overlay');
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
    
}, false);
