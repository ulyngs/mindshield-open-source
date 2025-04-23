// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    let isSelectionModeActive = false;

    const platformsWeTarget = ["youtube", "facebook", "x", "instagram", "linkedin", "whatsapp", "google", "reddit"];
    // Combined list - includes predefined elements and placeholders for custom elements per platform
    const elementsThatCanBeHidden = ["youtubeSearch", "youtubeSearchPredict", "youtubeRecVids", "youtubeThumbnails", "youtubeNotifications", "youtubeProfileImg",
                                     "youtubeShorts", "youtubeSubscriptions", "youtubeHistory", "youtubeExplore", "youtubeMore",
                                     "youtubeRelated", "youtubeSidebar", "youtubeComments", "youtubeAds", "youtubeViews", "youtubeLikes", "youtubeSubscribers",
                                     "xExplore", "xNotifications", "xTrends", "xFollow", "xTimeline",
                                     "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat", "facebookSponsored",
                                     "linkedinNews", "linkedinNotifications", "linkedinFeed", "linkedinAds",
                                     "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramReels", "instagramSuggestions", "instagramComments",
                                     "whatsappPreview", "whatsappNotificationPrompt",
                                     "googleAds", "googleBackground",
                                     "redditFeed", "redditPopular", "redditAll", "redditRecent", "redditCommunities", "redditNotification", "redditChat", "redditTrending", "redditPopularCommunities"];

    let currentPlatform = null; // e.g., "youtube", "facebook"
    let currentSiteIdentifier = null; // e.g., "youtube", "facebook", "www.wikipedia.org"

    // --- Initialization and Review Prompt ---
    let opensCount = localStorage.getItem('opensCount');
    opensCount = opensCount ? parseInt(opensCount, 10) + 1 : 1;
    localStorage.setItem('opensCount', opensCount);
    let noThanksClicked = localStorage.getItem('noThanksClicked') === 'true';
    if (opensCount % 10 === 0 && !noThanksClicked) {
        var reviewPrompt = document.getElementById('reviewPrompt');
        if (reviewPrompt) reviewPrompt.style.display = 'block';
    }
    document.getElementById('noThanksButton').addEventListener('click', function() {
        localStorage.setItem('noThanksClicked', 'true');
        var reviewPrompt = document.getElementById('reviewPrompt');
        if (reviewPrompt) reviewPrompt.style.display = 'none';
    });

    // --- Friction Delay Logic ---
    function setupFrictionDelay() {
        browser.storage.sync.get(["addFriction", "waitText", "waitTime"]).then((result) => {
            var frictionToggle = document.getElementById("frictionToggle");
            var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");
            var popupContainer = document.getElementById("popup-content");
            var messageContainer = document.getElementById("delay-content");
            var messageBox = document.getElementById("delay-message");
            var waitTextBox = document.getElementById("waitText");
            var waitTimeBox = document.getElementById("waitTime");
            var countdownBox = document.getElementById("delay-time");

            const defaultWaitTime = 10;
            const defaultWaitText = "What's your intention?";

            frictionToggle.checked = result.addFriction || false;
            frictionCustomisationArrow.style.display = frictionToggle.checked ? "block" : "none";

            let effectiveWaitText = result.waitText || defaultWaitText;
            waitTextBox.value = effectiveWaitText;
            messageBox.innerText = effectiveWaitText;

            let effectiveWaitTime = result.waitTime || defaultWaitTime;
            waitTimeBox.value = effectiveWaitTime;
            countdownBox.innerText = effectiveWaitTime;

            if (frictionToggle.checked) {
                popupContainer.style.display = "none";
                messageContainer.style.display = "block";

                setTimeout(() => messageContainer.classList.add("show"), 100);

                let countdown = effectiveWaitTime;
                var timerId = setInterval(() => {
                    countdown--;
                    if (countdown >= 0) {
                        countdownBox.innerText = countdown;
                    } else {
                        messageContainer.style.display = "none";
                        popupContainer.style.display = "block";
                        clearInterval(timerId);
                    }
                }, 1000);
            } else {
                messageContainer.style.display = "none";
                messageContainer.classList.remove("show");
                popupContainer.style.display = "block";
            }
        });

        var frictionToggle = document.getElementById("frictionToggle");
        var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");
        frictionToggle.addEventListener('change', function() {
            browser.storage.sync.set({ "addFriction": frictionToggle.checked });
            frictionCustomisationArrow.style.display = frictionToggle.checked ? "block" : "none";
            // Optional: Reload popup or re-run setupFrictionDelay after a brief moment if immediate effect is needed
        });

        var frictionCustomisationArrowRight = document.getElementById("frictionCustomisationArrowRight");
        var frictionCustomisationArrowDown = document.getElementById("frictionCustomisationArrowDown");
        var frictionCustomisationOptions = document.querySelector(".toggle-group.friction-customisation");
        frictionCustomisationArrow.addEventListener('click', function() {
            const isHidden = frictionCustomisationArrowRight.style.display !== "none";
            frictionCustomisationArrowRight.style.display = isHidden ? "none" : "inline";
            frictionCustomisationArrowDown.style.display = isHidden ? "inline" : "none";
            frictionCustomisationOptions.style.display = isHidden ? "block" : "none";
        });

        var savedTextTime = document.getElementById("savedTextTime");
        let hideTimeOut;
        document.getElementById("waitTime").addEventListener('input', function() {
            clearTimeout(hideTimeOut);
            let waitValue = parseInt(document.getElementById("waitTime").value);
            const maxLimit = 600;
            const minLimit = 1;

            if (isNaN(waitValue) || waitValue < minLimit) {
                 document.getElementById("waitTime").value = minLimit;
            } else if (waitValue > maxLimit) {
                savedTextTime.innerText = "Maximum is " + maxLimit;
                document.getElementById("waitTime").value = maxLimit;
                savedTextTime.style.display = 'block';
                hideTimeOut = setTimeout(() => savedTextTime.style.display = 'none', 2500);
            } else {
                 savedTextTime.style.display = 'none';
            }
        });
    }
    setupFrictionDelay(); // Call the setup function


    // --- Helper Functions for Toggles ---

    // Set checkbox state based on content script check or storage
    function setCheckboxState(element_to_check, id_of_toggle) {
        var currentToggle = document.getElementById(id_of_toggle);
        if (!currentToggle) return; // Element might not exist if generic site

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // Prevent errors on non-http pages
            if (!tabs[0] || !tabs[0].id || tabs[0].url?.startsWith('chrome://') || tabs[0].url?.startsWith('about:')) {
                currentToggle.disabled = true;
                 // Optionally set a default state or get from storage
                 browser.storage.sync.get(element_to_check + "Status", function(result) {
                    currentToggle.checked = result[element_to_check + "Status"] || false;
                 });
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response) {
                 if (chrome.runtime.lastError) {
                    console.warn("Error sending message (might be content script not ready or invalid page):", chrome.runtime.lastError.message);
                    // Fallback to storage if message fails
                     browser.storage.sync.get(element_to_check + "Status", function(result) {
                        currentToggle.checked = result[element_to_check + "Status"] || false;
                    });
                    currentToggle.disabled = true; // Disable if we can't communicate
                    return;
                 }

                if (response && response.text === "hidden") {
                    currentToggle.checked = true;
                } else if (response && response.text === "visible") {
                    currentToggle.checked = false;
                } else { // Fallback to storage if content script doesn't know (e.g., style not applied yet)
                    browser.storage.sync.get(element_to_check + "Status", function(result) {
                        currentToggle.checked = result[element_to_check + "Status"] || false; // Default to false if not set
                    });
                }
            });
        });
    }

    // Make checkbox toggle element visibility via content script
    function toggleViewStatusCheckbox(element_to_change, id_of_toggle) {
        var currentCheckbox = document.getElementById(id_of_toggle);
         if (!currentCheckbox) return;

        currentCheckbox.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: element_to_change }, err => {
                         if (chrome.runtime.lastError) console.warn("Error sending 'change' message:", chrome.runtime.lastError.message);
                    });
                }
            });
        }, false);
    }

     // Set a four-state button (hide-blur-black-show)
     function setButtonStateFour(element_to_check, id_of_toggle) {
        var currentButton = document.getElementById(id_of_toggle);
        if (!currentButton) return;

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
             if (!tabs[0] || !tabs[0].id || tabs[0].url?.startsWith('chrome://') || tabs[0].url?.startsWith('about:')) {
                 currentButton.disabled = true;
                 browser.storage.sync.get(element_to_check + "Status", function(result) {
                     currentButton.setAttribute("data-state", result[element_to_check + "Status"] || "On");
                 });
                 return;
             }

            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response) {
                 if (chrome.runtime.lastError) {
                     console.warn("Error sending 'check' message for multi-state:", chrome.runtime.lastError.message);
                     browser.storage.sync.get(element_to_check + "Status", function(result) {
                         currentButton.setAttribute("data-state", result[element_to_check + "Status"] || "On");
                     });
                     currentButton.disabled = true;
                     return;
                 }

                let state = "On"; // Default
                if (response && response.text === "hidden") {
                    state = "Off";
                } else if (response && response.text === "visible") {
                    state = "On";
                } else if (response && response.text === "blur") {
                    state = "Blur";
                } else if (response && response.text === "black") {
                    state = "Black";
                } else { // Fallback to storage
                    browser.storage.sync.get(element_to_check + "Status", function(result) {
                        currentButton.setAttribute("data-state", result[element_to_check + "Status"] || "On");
                    });
                    return; // Don't overwrite from storage if we got a response
                }
                currentButton.setAttribute("data-state", state);
            });
        });
    }

    // Make a four-state button toggle status (hide-blur-black-view)
    function toggleViewStatusMultiToggle(element_to_change, id_of_toggle) {
        var currentButton = document.getElementById(id_of_toggle);
        if (!currentButton) return;

        currentButton.addEventListener('click', function() {
            let currentState = currentButton.getAttribute("data-state");
            let nextState;

            if (currentState == "On") {
                nextState = "Off";
            } else if (currentState == "Off") {
                nextState = "Blur";
            } else if (currentState == "Blur") {
                nextState = "Black";
            } else { // Black or invalid -> On
                nextState = "On";
            }
            currentButton.setAttribute("data-state", nextState);

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { method: "changeMultiToggle", element: element_to_change, action: nextState }, err => {
                        if (chrome.runtime.lastError) console.warn("Error sending 'changeMultiToggle' message:", chrome.runtime.lastError.message);
                    });
                }
            });
        }, false);
    }

    // Assign the functions to the PREDEFINED checkboxes/buttons
    elementsThatCanBeHidden.forEach(function(item) {
        // These only apply to specific platforms, handled later by setSwitch enablement
        if (item.startsWith('youtube') || item.startsWith('facebook') || item.startsWith('x') ||
            item.startsWith('instagram') || item.startsWith('linkedin') || item.startsWith('whatsapp') ||
            item.startsWith('google') || item.startsWith('reddit'))
        {
            if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                setButtonStateFour(item, item + "Toggle");
                toggleViewStatusMultiToggle(item, item + "Toggle");
            } else {
                setCheckboxState(item, item + "Toggle");
                toggleViewStatusCheckbox(item, item + "Toggle");
            }
        }
    });

    // --- Platform Switch Logic ---

    // Set platform switches according to stored status and enable/disable controls
    function setSwitch(platform_to_check, id_of_switch) {
        var currentSwitch = document.getElementById(id_of_switch);
        if (!currentSwitch) return; // Should exist, but safety check

        var key = platform_to_check + "Status";
        browser.storage.sync.get(key, function(result) {
            // Default to true if not explicitly set to false
            let platformIsEnabled = result[key] !== false;
            currentSwitch.checked = platformIsEnabled;

            // Enable/disable toggles associated with this platform
            var platformToggles = document.querySelectorAll(`.dropdown.${platform_to_check} .a-toggle input, .dropdown.${platform_to_check} .a-toggle button`);
            platformToggles.forEach(toggle => {
                 // Exclude Add/Refresh buttons for custom elements from this disabling
                 if (!toggle.id.includes('AddElementButton') && !toggle.id.includes('RefreshSymbol')) {
                     toggle.disabled = !platformIsEnabled;
                 }
            });
        });
    }

    // Handle platform switch changes
    function setupPlatformSwitchListener(platform) {
        var currentSwitch = document.querySelector('#website-toggles #toggle-' + platform + ' input');
        if (!currentSwitch) return;

        currentSwitch.addEventListener("change", function() {
            const platformIsEnabled = currentSwitch.checked;
            var platformToggles = document.querySelectorAll(`.dropdown.${platform} .a-toggle input, .dropdown.${platform} .a-toggle button`);

            if (!platformIsEnabled) {
                // Show all elements for this platform and uncheck/reset toggles
                elementsThatCanBeHidden.filter(elem => elem.startsWith(platform)).forEach(function(some_element) {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs[0]?.id) {
                             chrome.tabs.sendMessage(tabs[0].id, { method: "showAll", element: some_element }, err => {
                                 if (chrome.runtime.lastError) console.warn("Error sending 'showAll' message:", chrome.runtime.lastError.message);
                             });
                        }
                    });
                    var toggle = document.getElementById(some_element + "Toggle");
                    if (toggle) {
                        if (toggle.type === 'checkbox') {
                            toggle.checked = false;
                        } else if (toggle.tagName === 'BUTTON') { // Multi-state button
                            toggle.setAttribute('data-state', 'On');
                        }
                    }
                });
                // Disable toggles
                 platformToggles.forEach(toggle => {
                     if (!toggle.id.includes('AddElementButton') && !toggle.id.includes('RefreshSymbol')) {
                         toggle.disabled = true;
                     }
                 });
            } else {
                // Enable toggles and re-apply stored states
                platformToggles.forEach(toggle => {
                    if (!toggle.id.includes('AddElementButton') && !toggle.id.includes('RefreshSymbol')) {
                         toggle.disabled = false;
                    }
                });
                elementsThatCanBeHidden.filter(elem => elem.startsWith(platform)).forEach(function(some_element) {
                     var toggle = document.getElementById(some_element + "Toggle");
                     if (!toggle) return;

                    var key = some_element + "Status";
                     browser.storage.sync.get(key, function(result) {
                         let storedValue = result[key];
                         let shouldBeHidden = false;

                         if (toggle.type === 'checkbox') {
                             toggle.checked = storedValue || false; // default false
                             shouldBeHidden = toggle.checked;
                         } else if (toggle.tagName === 'BUTTON') { // Multi-state
                             let state = storedValue || "On"; // default On
                             toggle.setAttribute('data-state', state);
                              shouldBeHidden = (state === "Off" || state === "Blur" || state === "Black");
                         }

                         // Re-apply the state if it's not the default 'On'/'visible' state
                         if (shouldBeHidden) {
                             chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                 if (tabs[0]?.id) {
                                      if (toggle.tagName === 'BUTTON') {
                                           chrome.tabs.sendMessage(tabs[0].id, { method: "changeMultiToggle", element: some_element, action: toggle.getAttribute('data-state') }, err => {
                                                if (chrome.runtime.lastError) console.warn("Error sending 'changeMultiToggle' on enable:", chrome.runtime.lastError.message);
                                           });
                                      } else {
                                           chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: some_element }, err => {
                                               if (chrome.runtime.lastError) console.warn("Error sending 'change' on enable:", chrome.runtime.lastError.message);
                                           });
                                      }
                                 }
                             });
                         }
                     });
                });
            }
            // Store the new platform status
            var storageKey = platform + "Status";
            browser.storage.sync.set({ [storageKey]: platformIsEnabled });
        });
    }

    // --- Custom Element Hiding Logic ---

    // Update the list of custom hidden elements in the popup
    function updateCustomElementsList(siteIdentifier, selectors) {
        console.log('updateCustomElementsList called for', siteIdentifier, 'with selectors:', selectors);
        const containerId = currentPlatform ? `${siteIdentifier}CustomElements` : 'genericCustomElements';
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("Could not find custom elements container:", containerId);
            return;
        }
        container.innerHTML = ''; // Clear existing list

        if (!Array.isArray(selectors)) {
            console.warn("Selectors is not an array for", siteIdentifier, selectors);
            selectors = []; // Ensure it's an array
        }

        selectors.forEach(selector => {
            const div = document.createElement('div');
            div.className = 'custom-element';

            const span = document.createElement('span');
            span.textContent = selector;
            span.title = selector; // Show full selector on hover

            const button = document.createElement('button');
            button.className = 'remove-symbol';
            button.innerHTML = `
                <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>`;
            button.title = 'Remove';
            button.addEventListener('click', function() {
                const storageKey = `${siteIdentifier}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    let currentSelectors = result[storageKey] || [];
                    currentSelectors = currentSelectors.filter(s => s !== selector);
                    browser.storage.sync.set({ [storageKey]: currentSelectors }, function() {
                        // Update UI
                        updateCustomElementsList(siteIdentifier, currentSelectors);
                        // Tell content script to unhide
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                             if (tabs[0]?.id) {
                                 chrome.tabs.sendMessage(tabs[0].id, { method: "removeCustomElement", selector: selector }, err => {
                                      if (chrome.runtime.lastError) console.warn("Error sending 'removeCustomElement' message:", chrome.runtime.lastError.message);
                                 });
                             }
                        });
                    });
                });
            });
            div.appendChild(button);
            div.appendChild(span);

            container.appendChild(div);
        });

        console.log('Updated container content for', containerId, ':', container.innerHTML);
    }

     // Setup listeners for Add/Refresh buttons (needs siteIdentifier)
     function setupCustomElementControls(siteIdentifier) {
         const platformSpecific = platformsWeTarget.includes(siteIdentifier);
         const addButtonId = platformSpecific ? `${siteIdentifier}AddElementButton` : 'genericAddElementButton';
         const refreshButtonId = platformSpecific ? `${siteIdentifier}RefreshSymbol` : 'genericRefreshSymbol';

         const addButton = document.getElementById(addButtonId);
         const refreshButton = document.getElementById(refreshButtonId);

         if (addButton) {
             addButton.addEventListener('click', function() {
                 // If already active, clicking again cancels selection mode
                 if (isSelectionModeActive) {
                     isSelectionModeActive = false;
                     addButton.classList.remove('active');
                     addButton.textContent = 'Hide custom element'; // Reset button text
                     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                         if (tabs[0]?.id) {
                             chrome.tabs.sendMessage(tabs[0].id, { method: "stopSelecting", cancelled: true }, err => {
                                  if (chrome.runtime.lastError) console.warn("Error sending 'stopSelecting' message:", chrome.runtime.lastError.message);
                             });
                         }
                     });
                 } else {
                     // Activate selection mode
                     isSelectionModeActive = true;
                     addButton.classList.add('active');
                     // MODIFIED: Changed button text for universal click/tap
                     addButton.textContent = 'Click/Tap element to hide';
                     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                         if (tabs[0]?.id) {
                             chrome.tabs.sendMessage(tabs[0].id, { method: "startSelecting" }, err => {
                                  if (chrome.runtime.lastError) {
                                     console.warn("Error sending 'startSelecting' message:", chrome.runtime.lastError.message);
                                     // Reset button state if message failed
                                     isSelectionModeActive = false;
                                     addButton.classList.remove('active');
                                     addButton.textContent = 'Hide custom element';
                                  }
                             });
                         } else {
                             // Reset button state if no active tab
                             isSelectionModeActive = false;
                             addButton.classList.remove('active');
                             addButton.textContent = 'Hide custom element';
                         }
                     });
                     // REMOVED: document.addEventListener('keydown', handleSpacebar);
                 }
             });
         } else { console.error("Add button not found:", addButtonId); }

         if (refreshButton) {
             refreshButton.addEventListener('click', function() {
                 // If selection mode is active, stop it first
                 if (isSelectionModeActive) {
                     isSelectionModeActive = false;
                     const currentAddButton = document.getElementById(addButtonId);
                     if(currentAddButton) {
                         currentAddButton.classList.remove('active');
                         currentAddButton.textContent = 'Hide custom element';
                     }
                     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                         if (tabs[0]?.id) {
                             chrome.tabs.sendMessage(tabs[0].id, { method: "stopSelecting", cancelled: true }, err => {
                                 if (chrome.runtime.lastError) console.warn("Error sending 'stopSelecting' before refresh:", chrome.runtime.lastError.message);
                             });
                         }
                     });
                 }

                 // Proceed with refresh
                 const storageKey = `${siteIdentifier}CustomHiddenElements`;
                 browser.storage.sync.get(storageKey, function(result) {
                     let customSelectors = result[storageKey] || [];
                     updateCustomElementsList(siteIdentifier, customSelectors);
                     // Optional: Tell content script to re-apply all custom styles for this site
                     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs[0]?.id) {
                           chrome.tabs.sendMessage(tabs[0].id, { method: "refreshCustomElements" }, err => {
                                if (chrome.runtime.lastError) console.warn("Error sending 'refreshCustomElements' message:", chrome.runtime.lastError.message);
                           });
                        }
                     });
                 });
             });
         } else { console.error("Refresh button not found:", refreshButtonId); }
     }

     // REMOVED: handleSpacebar function is no longer needed.
     // function handleSpacebar(event) { ... }

    // --- Main Logic: Determine Site and Setup UI ---

    chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
        if (chrome.runtime.lastError || !tab || tab.length === 0 || !tab[0].url) {
             console.error("Could not get active tab information.");
             document.getElementById('popup-content').innerHTML = "<p class='error-message'>Could not get tab information. Try reloading the page.</p>";
             document.getElementById('popup-content').style.display = 'block';
             document.getElementById('delay-content').style.display = 'none'; // Hide delay content too
            return;
        }

        let currentURL;
        try {
            currentURL = new URL(tab[0].url);
        } catch (e) {
            console.warn("Invalid URL:", tab[0].url);
             document.getElementById('popup-content').innerHTML = `<p class='error-message'>Cannot run on this page (${tab[0].url.split('/')[0]}...).</p>`;
              document.getElementById('popup-content').style.display = 'block';
              document.getElementById('delay-content').style.display = 'none';
            return;
        }

        const currentHost = currentURL.hostname; // Use hostname for generic identification
        document.getElementById('currentSiteName').textContent = currentHost; // Display current site name

        // Check if it's a targeted platform
        platformsWeTarget.forEach(function(platform) {
            if (currentHost.includes(platform)) { // Simple check, might need refinement for subdomains
                currentPlatform = platform;
                currentSiteIdentifier = platform;
            }
        });

        if (currentPlatform) {
            // Show controls for the TARGETED platform
            document.querySelector('.dropdown.' + currentPlatform).classList.add('shown');
            document.querySelector('#website-toggles #toggle-' + currentPlatform).classList.add('shown-inline');
            document.getElementById('website-toggles').style.display = 'block'; // Ensure toggles are visible
            document.getElementById('generic-site-options').style.display = 'none'; // Hide generic section
            document.getElementById('currentSiteInfo').style.display = 'none'; // Hide generic site name display

             // Set up platform switch and its listeners
            setSwitch(currentPlatform, currentPlatform + "Switch");
            setupPlatformSwitchListener(currentPlatform);

             // Initialize custom elements for this platform
            setupCustomElementControls(currentPlatform);
            const storageKey = `${currentPlatform}CustomHiddenElements`;
            browser.storage.sync.get(storageKey, function(result) {
                updateCustomElementsList(currentPlatform, result[storageKey] || []);
            });

        } else if (currentHost && !currentURL.protocol.startsWith('chrome') && !currentURL.protocol.startsWith('about')) {
            // Show controls for a GENERIC site
            currentSiteIdentifier = currentHost; // Use hostname
            document.getElementById('website-toggles').style.display = 'none'; // Hide platform toggles
            document.getElementById('generic-site-options').style.display = 'block'; // Show generic section
            document.getElementById('currentSiteInfo').style.display = 'block'; // Show generic site name display

            // Initialize custom elements for this generic site
            setupCustomElementControls(currentSiteIdentifier);
            const storageKey = `${currentSiteIdentifier}CustomHiddenElements`;
            browser.storage.sync.get(storageKey, function(result) {
                 updateCustomElementsList(currentSiteIdentifier, result[storageKey] || []);
            });

             // Hide all specific platform dropdowns just in case
             platformsWeTarget.forEach(p => {
                 const dropdown = document.querySelector(`.dropdown.${p}`);
                 if (dropdown) dropdown.classList.remove('shown');
             });

        } else {
            // Not a supported page (e.g., chrome://, about:, file://)
            document.getElementById('popup-content').innerHTML = `<p class='error-message'>Extension cannot modify this page (${currentURL.protocol}//...).</p>`;
            // Friction delay logic might have already hidden popup-content, ensure it's shown
            document.getElementById('popup-content').style.display = 'block';
            document.getElementById('delay-content').style.display = 'none';
             // Hide everything else
             document.getElementById('website-toggles').style.display = 'none';
             document.getElementById('generic-site-options').style.display = 'none';
             document.getElementById('currentSiteInfo').style.display = 'none';
             document.querySelector('footer').style.display = 'none'; // Hide footer too
        }

         // Initialize predefined elements for the current platform (if any)
         if(currentPlatform) {
             elementsThatCanBeHidden.filter(e => e.startsWith(currentPlatform)).forEach(item => {
                  if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                      setButtonStateFour(item, item + "Toggle");
                  } else {
                      setCheckboxState(item, item + "Toggle");
                  }
             });
         }

    });


    // --- Message Handling from Content Script ---
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        // Ensure message is relevant to the current site being displayed
        if (!currentSiteIdentifier) return; // No site identified yet or invalid page

        if ((message.method === "elementSelected" || message.method === "selectionCanceled" || message.method === "selectionFailed")) {
            console.log('Received message:', message);

            // Find the correct 'Add' button (platform-specific or generic)
            const addButtonId = currentPlatform ? `${currentSiteIdentifier}AddElementButton` : 'genericAddElementButton';
            const addButton = document.getElementById(addButtonId);
            if (addButton) {
                addButton.classList.remove('active');
                addButton.textContent = 'Hide custom element'; // Reset button text
            }

            isSelectionModeActive = false;
            // REMOVED: document.removeEventListener('keydown', handleSpacebar); // Clean up listener IMPORTANT

            if (message.method === "elementSelected" && message.selector) {
                const storageKey = `${currentSiteIdentifier}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    let customSelectors = result[storageKey] || [];
                     if (!Array.isArray(customSelectors)) customSelectors = []; // Ensure array
                    if (!customSelectors.includes(message.selector)) {
                        customSelectors.push(message.selector);
                        browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                            if (chrome.runtime.lastError) {
                                console.error("Error saving custom selectors:", chrome.runtime.lastError);
                            } else {
                                // Update the list in the popup
                                updateCustomElementsList(currentSiteIdentifier, customSelectors);
                            }
                        });
                    }
                });
            } else if (message.method === "selectionFailed") {
                // Optional: Show a temporary message to the user?
                console.error("Element selection failed:", message.reason);
                if (addButton) {
                    const originalText = addButton.textContent;
                    addButton.textContent = 'Selection Failed!';
                    setTimeout(() => { addButton.textContent = originalText; }, 2000);
                }
            }
        }
        // Note: No sendResponse needed here unless specifically required by sender
    });

    // --- Save Button and Footer Logic ---

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    var saveButton = document.querySelector('#saveButton');
    saveButton.addEventListener('click', (e) => {
        // Save predefined element states ONLY for the CURRENT targeted platform (if any)
        if (currentPlatform) {
            elementsThatCanBeHidden
                .filter(element => element.startsWith(currentPlatform))
                .forEach(function(element) {
                    var key = element + "Status";
                    var elementToggle = document.getElementById(element + "Toggle");
                     if (!elementToggle) return; // Skip if toggle doesn't exist

                    var value = (elementToggle.getAttribute("data-state") != null) ?
                                elementToggle.getAttribute("data-state") : // Multi-state button
                                elementToggle.checked; // Checkbox
                    browser.storage.sync.set({ [key]: value });
                });
             // Also save the platform's overall status switch
             var platformSwitch = document.getElementById(currentPlatform + "Switch");
             if (platformSwitch) {
                 browser.storage.sync.set({ [currentPlatform + "Status"]: platformSwitch.checked });
             }
        }
        // NOTE: Custom elements are saved immediately on selection/removal, not here.

        // Save friction settings
        let waitValue = parseInt(document.getElementById("waitTime").value) || 10; // Default 10 if NaN
        browser.storage.sync.set({ "waitTime": waitValue });
        browser.storage.sync.set({ "waitText": document.getElementById("waitText").value });

        e.target.setAttribute("value", "......");
        delay(250).then(() => e.target.setAttribute("value", "Saved!"));
        delay(1500).then(() => e.target.setAttribute("value", "Save settings"));
    });

    // --- Footer Accordions ---
    function setupAccordion(triggerId, contentId, arrowRightId, arrowDownId) {
        const trigger = document.querySelector(triggerId);
        const content = document.querySelector(contentId);
        const arrowRight = document.querySelector(arrowRightId);
        const arrowDown = document.querySelector(arrowDownId);

        if (!trigger || !content || !arrowRight || !arrowDown) return;

        trigger.addEventListener("click", function() {
            const isHidden = content.style.display === "none";
            content.style.display = isHidden ? "block" : "none";
            arrowRight.style.display = isHidden ? "none" : "inline-block";
            arrowDown.style.display = isHidden ? "inline-block" : "none";
        });
    }

    setupAccordion('#hide-previews', '#how-to-description', '#how-to-arrow-right', '#how-to-arrow-down');
    setupAccordion('#hide-previews-not-mobile', '#how-to-description-not-mobile', '#how-to-arrow-right-not-mobile', '#how-to-arrow-down-not-mobile');
    setupAccordion('#what-sites', '#sites-available', '#sites-arrow-right', '#sites-arrow-down');

}, false);
