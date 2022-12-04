// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    const elementsThatCanBeHidden = [ "youtubeRecVids", "youtubeShorts", "youtubeRelated", "youtubeComments", "facebookFeed", "facebookStories", "facebookChat", "linkedinFeed", "linkedinNews", "instagramMutedStories", "instagramExplore", "googleAds" ];
    var saveButton = document.getElementById("saveButton");
    
    saveButton.addEventListener('click', function() {
            function delay(time) {
              return new Promise(resolve => setTimeout(resolve, time));
            }

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                // message the content script with the state of the checkboxes
                var myMessage = { method: "saveState"};
                elementsThatCanBeHidden.forEach(function(element) {
                    myMessage[element] = document.getElementById(element + "Toggle").checked;
                });
                chrome.tabs.sendMessage(tabs[0].id, myMessage );
            });
            
            saveButton.innerHTML = "......";
            delay(250).then(() => saveButton.innerHTML = "Saved!");
            delay(1500).then(() => saveButton.innerHTML = "Save settings");
    });
    
    var platformsWeTarget = [ "youtube", "facebook", "google", "instagram", "linkedin" ];
    platformsWeTarget.forEach(function(platform) {
        var currentCheckbox = document.querySelector('.dropdown.' + platform + ' input');
        var currentDropdownButton = document.querySelector('.dropdown.' + platform + ' button');
        
        currentCheckbox.addEventListener("change", function() {
            if(!currentCheckbox.checked){
                document.querySelector(".dropdown." + platform + " button").disabled = true;
                
                // turn on all distracting elements
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: some_element, status: true });
                      });
                });
                
                // save state of the toggle
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { method: "switchOff", domain: platform });
                  });
            } else {
                document.querySelector(".dropdown." + platform + " button").disabled = false;
                
                // turn off all distracting elements
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: some_element, status: false });
                      });
                    
                    document.getElementById(some_element + "Toggle").checked = false;
                });
                
                // save state of the toggle
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { method: "switchOn", domain: platform });
                  });
      
            }
      });
    });
    
    // Get references to all of the dropdown buttons
    var dropdownButtons = document.querySelectorAll('.dropdown button');

    // Add click event listeners to the buttons
    dropdownButtons.forEach(function(button) {
      button.addEventListener('click', dropdownButtonClicked);
    });

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
      } else {
          // Select all of the dropdown content elements with the "shown" class
          var shownDropdowns = document.querySelectorAll('.dropdown-content.shown');
            
          // Loop through the shown dropdown content elements and remove the 'shown' class from tehm
          shownDropdowns.forEach(function(dropdown) {
            dropdown.classList.remove('shown');
          });

          // Toggle the "shown" class on the dropdown content
          dropdownContent.classList.toggle('shown');
      }
    }

    
    // set switches according to current status
    function setSwitch(domain_to_check, id_of_switch){
        var currentSwitch = document.getElementById(id_of_switch);
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            
            chrome.tabs.sendMessage(tabs[0].id, { method: "checkSwitch", domain: domain_to_check }, function(response){
                
                if(response.text === "on"){
                    currentSwitch.checked = true;
                } else {
                    currentSwitch.checked = false;
                    document.querySelector(".dropdown." + domain_to_check + " button").disabled = true;
                }
            });
        });
    };
    
    platformsWeTarget.forEach(function (platform) {
        setSwitch(platform, platform + "Switch");
    });
    
    // set checkboxes according to current status
    function setPopupToggle(element_to_check, id_of_toggle){
        var currentToggle = document.getElementById(id_of_toggle);
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            
            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response){
                
                if(response.text === "visible"){
                    currentToggle.checked = true;
                } else {
                    currentToggle.checked = false;
                }
            });
        });
    };
    
    // assign functions to the checkboxes
    function assignCheckBoxFunction(element_to_change, id_of_toggle){
        var currentToggle = document.getElementById(id_of_toggle);
        
        // make it hide/show on mac
        currentToggle.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: element_to_change, status: currentToggle.checked });
              });
            }, false);
    };
    
    elementsThatCanBeHidden.forEach(function (item) {
        setPopupToggle(item, item + "Toggle");
        assignCheckBoxFunction(item, item + "Toggle");
    });
    
}, false);
