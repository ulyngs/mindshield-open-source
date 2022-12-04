// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    var platformsWeTarget = [ "youtube", "facebook", "google", "instagram", "linkedin" ];
    const elementsThatCanBeHidden = [ "ytRecVids", "ytShorts", "ytRelated", "ytComments", "fbFeed", "fbStories", "fbChat", "inFeed", "inNews", "instaMutedStories", "instaExplore", "googleAds" ];
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
