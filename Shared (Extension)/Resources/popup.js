document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0] || !tabs[0].id || tabs[0].url?.startsWith('chrome://') || tabs[0].url?.startsWith('about:')) {
                console.error("Invalid tab or page.");
                return;
            }

            const tabId = tabs[0].id;
            let responded = false;

            chrome.tabs.sendMessage(tabId, { method: "ping" }, function(response) {
                if (chrome.runtime.lastError) {
                    console.warn("Content script not responding:", chrome.runtime.lastError.message);
                } else if (response && response.status === "pong") {
                    responded = true;
                    initializePopup();
                }
            });

            setTimeout(() => {
                if (!responded) {
                    document.getElementById('popup-content').innerHTML = `
                        <p>Extension needs to reactivate.</p>
                        <button id="reloadButton">Reactivate Now</button>
                    `;
                    document.getElementById('reloadButton').addEventListener('click', function() {
                        chrome.runtime.sendMessage({ method: "reloadTab", tabId: tabId });
                        window.close();
                    });
                }
            }, 500);
        });
    
    function initializePopup() {
            console.log("Popup initialized - content script is active.");
        
        let isSelectionModeActive = false;

        let currentPlatform = null;
        let currentSiteIdentifier = null;

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

        function setupFrictionDelay() {
            browser.storage.sync.get(["addFriction", "waitText", "waitTime"]).then((result) => {
                var frictionToggle = document.getElementById("frictionToggle");
                var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");
                var popupContainer = document.getElementById("popup-content");
                var messageContainer = document.getElementById("delay-content");
                var errorContainer = document.getElementById("error-prompt");
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
                    errorContainer.style.display = "none";
                    setTimeout(() => messageContainer.classList.add("show"), 100);
                    
                    let countdown = effectiveWaitTime;
                    var timerId = setInterval(() => {
                        countdown--;
                        if (countdown >= 0) {
                            countdownBox.innerText = countdown;
                        } else {
                            messageContainer.style.display = "none";
                            popupContainer.style.display = "block";
                            errorContainer.style.display = "none";
                            clearInterval(timerId);
                        }
                    }, 1000);
                } else {
                    messageContainer.style.display = "none";
                    messageContainer.classList.remove("show");
                    popupContainer.style.display = "block";
                    errorContainer.style.display = "none";
                }
            });
            
            var frictionToggle = document.getElementById("frictionToggle");
            var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");
            frictionToggle.addEventListener('change', function() {
                browser.storage.sync.set({ "addFriction": frictionToggle.checked });
                frictionCustomisationArrow.style.display = frictionToggle.checked ? "block" : "none";
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
            
            // at the bottom of initializePopup(), before it returns:
            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape' && isSelectionModeActive) {
                e.preventDefault();
                // stop selecting in the page
                chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                  chrome.tabs.sendMessage(tabs[0].id, { method: "stopSelecting", cancelled: true });
                });
                // reset the popup UI
                const addButtonId = currentPlatform
                  ? `${currentPlatform}AddElementButton`
                  : 'genericAddElementButton';
                const addButton = document.getElementById(addButtonId);
                if (addButton) {
                  isSelectionModeActive = false;
                  addButton.classList.remove('active');
                  addButton.textContent = 'Hide custom element';
                }
              }
            });
        }
        setupFrictionDelay();

        function setCheckboxState(element_to_check, id_of_toggle) {
            var currentToggle = document.getElementById(id_of_toggle);
            if (!currentToggle) return;

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (!tabs[0] || !tabs[0].id || tabs[0].url?.startsWith('chrome://') || tabs[0].url?.startsWith('about:')) {
                    currentToggle.disabled = true;
                     browser.storage.sync.get(element_to_check + "Status", function(result) {
                        currentToggle.checked = result[element_to_check + "Status"] || false;
                     });
                    return;
                }

                chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response) {
                     if (chrome.runtime.lastError) {
                        console.warn("Error sending message:", chrome.runtime.lastError.message);
                         browser.storage.sync.get(element_to_check + "Status", function(result) {
                            currentToggle.checked = result[element_to_check + "Status"] || false;
                        });
                        currentToggle.disabled = true;
                        return;
                     }

                    if (response && response.text === "hidden") {
                        currentToggle.checked = true;
                    } else if (response && response.text === "visible") {
                        currentToggle.checked = false;
                    } else {
                        browser.storage.sync.get(element_to_check + "Status", function(result) {
                            currentToggle.checked = result[element_to_check + "Status"] || false;
                        });
                    }
                });
            });
        }

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

                    let state = "On";
                    if (response && response.text === "hidden") {
                        state = "Off";
                    } else if (response && response.text === "visible") {
                        state = "On";
                    } else if (response && response.text === "blur") {
                        state = "Blur";
                    } else if (response && response.text === "black") {
                        state = "Black";
                    } else {
                        browser.storage.sync.get(element_to_check + "Status", function(result) {
                            currentButton.setAttribute("data-state", result[element_to_check + "Status"] || "On");
                        });
                        return;
                    }
                    currentButton.setAttribute("data-state", state);
                });
            });
        }

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
                } else {
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

        elementsThatCanBeHidden.forEach(function(item) {
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

        function setSwitch(platform_to_check, id_of_switch) {
            var currentSwitch = document.getElementById(id_of_switch);
            if (!currentSwitch) return;

            var key = platform_to_check + "Status";
            browser.storage.sync.get(key, function(result) {
                let platformIsEnabled = result[key] !== false;
                currentSwitch.checked = platformIsEnabled;

                var platformToggles = document.querySelectorAll(`.dropdown.${platform_to_check} .a-toggle input, .dropdown.${platform_to_check} .a-toggle button`);
                platformToggles.forEach(toggle => {
                     if (!toggle.id.includes('AddElementButton')) {
                         toggle.disabled = !platformIsEnabled;
                     }
                });
            });
        }

        function setupPlatformSwitchListener(platform) {
            var currentSwitch = document.querySelector('#website-toggles #toggle-' + platform + ' input');
            if (!currentSwitch) return;

            currentSwitch.addEventListener("change", function() {
                const platformIsEnabled = currentSwitch.checked;
                var platformToggles = document.querySelectorAll(`.dropdown.${platform} .a-toggle input, .dropdown.${platform} .a-toggle button`);

                if (!platformIsEnabled) {
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
                            } else if (toggle.tagName === 'BUTTON') {
                                toggle.setAttribute('data-state', 'On');
                            }
                        }
                    });
                     platformToggles.forEach(toggle => {
                         if (!toggle.id.includes('AddElementButton')) {
                             toggle.disabled = true;
                         }
                     });
                } else {
                    platformToggles.forEach(toggle => {
                        if (!toggle.id.includes('AddElementButton')) {
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
                                 toggle.checked = storedValue || false;
                                 shouldBeHidden = toggle.checked;
                             } else if (toggle.tagName === 'BUTTON') {
                                 let state = storedValue || "On";
                                 toggle.setAttribute('data-state', state);
                                  shouldBeHidden = (state === "Off" || state === "Blur" || state === "Black");
                             }

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
                var storageKey = platform + "Status";
                browser.storage.sync.set({ [storageKey]: platformIsEnabled });
            });
        }

        function updateCustomElementsList(siteIdentifier, selectors) {
            console.log('updateCustomElementsList called for', siteIdentifier, 'with selectors:', selectors);
            const containerId = currentPlatform ? `${siteIdentifier}CustomElements` : 'genericCustomElements';
            const container = document.getElementById(containerId);
            if (!container) {
                console.error("Could not find custom elements container:", containerId);
                return;
            }
            container.innerHTML = '';

            if (!Array.isArray(selectors)) {
                console.warn("Selectors is not an array for", siteIdentifier, selectors);
                selectors = [];
            }

            selectors.forEach(selector => {
                const div = document.createElement('div');
                div.className = 'custom-element';

                const peekButton = document.createElement('button');
                peekButton.className = 'icon-btn peek-symbol';
                peekButton.innerHTML = `
                    <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>`;
                peekButton.title = 'Toggle visibility';
                peekButton.setAttribute('data-visible', 'false');

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]?.id) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "checkCustom", selector: selector }, function(response) {
                            if (chrome.runtime.lastError) {
                                console.warn("Error checking custom selector state:", chrome.runtime.lastError.message);
                                peekButton.setAttribute('data-visible', 'false');
                                peekButton.innerHTML = `
                                    <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>`;
                            } else if (response && response.visible) {
                                peekButton.setAttribute('data-visible', 'true');
                                peekButton.innerHTML = `
                                    <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>`;
                            } else {
                                peekButton.setAttribute('data-visible', 'false');
                                peekButton.innerHTML = `
                                    <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>`;
                            }
                        });
                    }
                });

                peekButton.addEventListener('click', function() {
                    const isVisible = peekButton.getAttribute('data-visible') === 'true';
                    peekButton.setAttribute('data-visible', isVisible ? 'false' : 'true');
                    peekButton.innerHTML = isVisible ? `
                        <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>` : `
                        <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>`;
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs[0]?.id) {
                            chrome.tabs.sendMessage(tabs[0].id, { method: "toggleCustomVisibility", selector: selector, visible: !isVisible }, err => {
                                if (chrome.runtime.lastError) console.warn("Error sending 'toggleCustomVisibility' message:", chrome.runtime.lastError.message);
                            });
                        }
                    });
                });

                const span = document.createElement('span');
                span.textContent = selector;
                span.title = selector;

                const button = document.createElement('button');
                button.className = 'icon-btn remove-symbol';
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
                            updateCustomElementsList(siteIdentifier, currentSelectors);
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
                div.appendChild(peekButton);
                div.appendChild(button);
                div.appendChild(span);

                container.appendChild(div);
            });

            console.log('Updated container content for', containerId, ':', container.innerHTML);
        }

         function setupCustomElementControls(siteIdentifier) {
             const platformSpecific = platformsWeTarget.includes(siteIdentifier);
             const addButtonId = platformSpecific ? `${siteIdentifier}AddElementButton` : 'genericAddElementButton';
             const addButton = document.getElementById(addButtonId);

             if (addButton) {
                 addButton.addEventListener('click', function() {
                     if (isSelectionModeActive) {
                         isSelectionModeActive = false;
                         addButton.classList.remove('active');
                         addButton.textContent = 'Hide custom element';
                         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                             if (tabs[0]?.id) {
                                 chrome.tabs.sendMessage(tabs[0].id, { method: "stopSelecting", cancelled: false }, err => {
                                     if (chrome.runtime.lastError) console.warn("Error sending 'stopSelecting' message:", chrome.runtime.lastError.message);
                                 });
                             }
                         });
                     } else {
                         isSelectionModeActive = true;
                         addButton.classList.add('active');
                         addButton.textContent = 'Click/Tap element to hide';
                         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                             if (tabs[0]?.id) {
                                 chrome.tabs.sendMessage(tabs[0].id, { method: "startSelecting" }, err => {
                                     if (chrome.runtime.lastError) {
                                         console.warn("Error sending 'startSelecting' message:", chrome.runtime.lastError.message);
                                         isSelectionModeActive = false;
                                         addButton.classList.remove('active');
                                         addButton.textContent = 'Hide custom element';
                                     }
                                 });
                             } else {
                                 isSelectionModeActive = false;
                                 addButton.classList.remove('active');
                                 addButton.textContent = 'Hide custom element';
                             }
                         });
                     }
                 });
             } else { console.error("Add button not found:", addButtonId); }
         }

        chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
            if (chrome.runtime.lastError || !tab || tab.length === 0 || !tab[0].url) {
                 console.error("Could not get active tab information.");
                 document.getElementById('popup-content').innerHTML = "<p class='error-message'>Could not get tab information. Try reloading the page.</p>";
                 document.getElementById('popup-content').style.display = 'block';
                 document.getElementById('delay-content').style.display = 'none';
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

            const currentHost = currentURL.hostname;
            document.getElementById('currentSiteName').textContent = currentHost;

            // Precisely identify the platform using the shared platformHostnames map
            for (const platform in platformHostnames) {
                if (platformHostnames[platform].includes(currentHost)) {
                    currentPlatform = platform;
                    break; // Found it
                }
            }

            // If a platform was matched, use its name as the identifier.
            if (currentPlatform) {
                currentSiteIdentifier = currentPlatform;
            }

            if (currentPlatform) {
                document.querySelector('.dropdown.' + currentPlatform).classList.add('shown');
                document.querySelector('#website-toggles #toggle-' + currentPlatform).classList.add('shown-inline');
                document.getElementById('website-toggles').style.display = 'block';
                document.getElementById('generic-site-options').style.display = 'none';
                document.getElementById('currentSiteInfo').style.display = 'none';

                setSwitch(currentPlatform, currentPlatform + "Switch");
                setupPlatformSwitchListener(currentPlatform);

                setupCustomElementControls(currentPlatform);
                const storageKey = `${currentPlatform}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    updateCustomElementsList(currentPlatform, result[storageKey] || []);
                });

            } else if (currentHost && !currentURL.protocol.startsWith('chrome') && !currentURL.protocol.startsWith('about')) {
                currentSiteIdentifier = currentHost;
                document.getElementById('website-toggles').style.display = 'none';
                document.getElementById('generic-site-options').style.display = 'block';
                document.getElementById('currentSiteInfo').style.display = 'block';

                setupCustomElementControls(currentSiteIdentifier);
                const storageKey = `${currentSiteIdentifier}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                     updateCustomElementsList(currentSiteIdentifier, result[storageKey] || []);
                });

                 platformsWeTarget.forEach(p => {
                     const dropdown = document.querySelector(`.dropdown.${p}`);
                     if (dropdown) dropdown.classList.remove('shown');
                 });

            } else {
                document.getElementById('popup-content').innerHTML = `<p class='error-message'>Extension cannot modify this page (${currentURL.protocol}//...).</p>`;
                document.getElementById('popup-content').style.display = 'block';
                document.getElementById('delay-content').style.display = 'none';
                 document.getElementById('website-toggles').style.display = 'none';
                 document.getElementById('generic-site-options').style.display = 'none';
                 document.getElementById('currentSiteInfo').style.display = 'none';
                 document.querySelector('footer').style.display = 'none';
            }

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

        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            if (!currentSiteIdentifier) return;
            
            if (message.method === "stopSelectingFromEscape") {
                console.log('Received stopSelectingFromEscape message');
                const addButtonId = currentPlatform ? `${currentSiteIdentifier}AddElementButton` : 'genericAddElementButton';
                const addButton = document.getElementById(addButtonId);
                if (addButton) {
                    isSelectionModeActive = false;
                    addButton.classList.remove('active');
                    addButton.textContent = 'Hide custom element';
                }
                // Send stopSelecting message to content script
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]?.id) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "stopSelecting", cancelled: true }, err => {
                            if (chrome.runtime.lastError) {
                                console.warn("Error sending 'stopSelecting' message:", chrome.runtime.lastError.message);
                            }
                        });
                    }
                });
            }

            if ((message.method === "elementSelected" || message.method === "selectionCanceled" || message.method === "selectionFailed")) {
                console.log('Received message:', message);

                const addButtonId = currentPlatform ? `${currentSiteIdentifier}AddElementButton` : 'genericAddElementButton';
                const addButton = document.getElementById(addButtonId);
                if (addButton) {
                    addButton.classList.remove('active');
                    addButton.textContent = 'Hide custom element';
                }

                isSelectionModeActive = false;

                if (message.method === "elementSelected" && message.selector) {
                    const storageKey = `${currentSiteIdentifier}CustomHiddenElements`;
                    browser.storage.sync.get(storageKey, function(result) {
                        let customSelectors = result[storageKey] || [];
                         if (!Array.isArray(customSelectors)) customSelectors = [];
                        if (!customSelectors.includes(message.selector)) {
                            customSelectors.push(message.selector);
                            browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                                if (chrome.runtime.lastError) {
                                    console.error("Error saving custom selectors:", chrome.runtime.lastError);
                                } else {
                                    updateCustomElementsList(currentSiteIdentifier, customSelectors);
                                }
                            });
                        }
                    });
                } else if (message.method === "selectionFailed") {
                    console.error("Element selection failed:", message.reason);
                    if (addButton) {
                        const originalText = addButton.textContent;
                        addButton.textContent = 'Selection Failed!';
                        setTimeout(() => { addButton.textContent = originalText; }, 2000);
                    }
                }
            }
        });

        function delay(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        }

        var saveButton = document.querySelector('#saveButton');
        saveButton.addEventListener('click', (e) => {
            if (currentPlatform) {
                elementsThatCanBeHidden
                    .filter(element => element.startsWith(currentPlatform))
                    .forEach(function(element) {
                        var key = element + "Status";
                        var elementToggle = document.getElementById(element + "Toggle");
                         if (!elementToggle) return;

                        var value = (elementToggle.getAttribute("data-state") != null) ?
                                    elementToggle.getAttribute("data-state") :
                                    elementToggle.checked;
                        browser.storage.sync.set({ [key]: value });
                    });
                 var platformSwitch = document.getElementById(currentPlatform + "Switch");
                 if (platformSwitch) {
                     browser.storage.sync.set({ [currentPlatform + "Status"]: platformSwitch.checked });
                 }
            }

            let waitValue = parseInt(document.getElementById("waitTime").value) || 10;
            browser.storage.sync.set({ "waitTime": waitValue });
            browser.storage.sync.set({ "waitText": document.getElementById("waitText").value });

            e.target.setAttribute("value", "......");
            delay(250).then(() => e.target.setAttribute("value", "Saved!"));
            delay(1500).then(() => e.target.setAttribute("value", "Save settings"));
        });

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
            
        function setupHelpAndFAQ() {
            const helpBtn = document.getElementById('help-icon-btn');
            const faqDropdown = document.getElementById('faq-dropdown');
            const faqOverlay = document.getElementById('faq-overlay'); // Get the overlay
            const faqItems = document.querySelectorAll('.faq-item');

            // Make sure all elements exist
            if (!helpBtn || !faqDropdown || !faqOverlay) return;

            // Toggle FAQ dropdown and overlay visibility
            helpBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const isVisible = faqDropdown.style.display === 'block';
                // Set display for both dropdown and overlay
                faqDropdown.style.display = isVisible ? 'none' : 'block';
                faqOverlay.style.display = isVisible ? 'none' : 'block';
            });

            // Handle accordion items (no change here)
            faqItems.forEach(item => {
                const trigger = item.querySelector('.faq-trigger');
                if (trigger) {
                    trigger.addEventListener('click', () => {
                        const isOpen = item.dataset.state === 'open';
                        item.dataset.state = isOpen ? 'closed' : 'open';
                    });
                }
            });

            // Close dropdown and overlay if clicking outside
            document.addEventListener('click', (event) => {
                if (!faqDropdown.contains(event.target) && !helpBtn.contains(event.target)) {
                    faqDropdown.style.display = 'none';
                    faqOverlay.style.display = 'none'; // Also hide the overlay
                }
            });
        }

            // Setup all interactive elements at the end
            setupHelpAndFAQ();
            setupAccordion('#hide-previews', '#how-to-description', '#how-to-arrow-right', '#how-to-arrow-down');
            setupAccordion('#hide-previews-not-mobile', '#how-to-description-not-mobile', '#how-to-arrow-right-not-mobile', '#how-to-arrow-down-not-mobile');
            setupAccordion('#what-sites', '#sites-available', '#sites-arrow-right', '#sites-arrow-down');
        }
}, false);
