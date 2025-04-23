// popup.js
// https://developer.chrome.com/docs/extensions/mv3/messaging/

document.addEventListener('DOMContentLoaded', function() {
    let isSelectionModeActive = false;

    const platformsWeTarget = ["youtube", "facebook", "x", "instagram", "linkedin", "whatsapp", "google", "reddit"];
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

    // Initialize or increment the open count in localStorage
    let opensCount = localStorage.getItem('opensCount');
    opensCount = opensCount ? parseInt(opensCount, 10) + 1 : 1;
    localStorage.setItem('opensCount', opensCount);

    // Check if the user has previously clicked 'No, thanks'
    let noThanksClicked = localStorage.getItem('noThanksClicked') === 'true';

    // Show the review prompt every 10th open unless 'No, thanks' has been clicked
    if (opensCount % 10 === 0 && !noThanksClicked) {
        var reviewPrompt = document.getElementById('reviewPrompt');
        if (reviewPrompt) {
            reviewPrompt.style.display = 'block';
        }
    }

    // Handling the 'No, thanks' button click
    document.getElementById('noThanksButton').addEventListener('click', function() {
        localStorage.setItem('noThanksClicked', 'true');
        var reviewPrompt = document.getElementById('reviewPrompt');
        if (reviewPrompt) {
            reviewPrompt.style.display = 'none';
        }
    });

    // Set friction checkbox
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
                document.getElementById("waitText").value = result.waitText;
                messageBox.innerText = result.waitText;
            } else {
                document.getElementById("waitText").value = "What's your intention?";
                messageBox.innerText = "What is your intention?";
            }
        });

        if (result["addFriction"]) {
            popupContainer.style.display = "none";
            messageContainer.style.display = "block";

            setTimeout(function() {
                messageContainer.classList.add("show");
            }, 100);

            browser.storage.sync.get("waitTime").then(function(result) {
                var waitTime = result.waitTime;
                var countdownBox = document.getElementById("delay-time");
                var countdown = 0;

                if (waitTime != null) {
                    document.getElementById("waitTime").value = waitTime;
                    countdownBox.innerText = waitTime;
                    countdown = waitTime;
                } else {
                    countdownBox.innerText = "10";
                    document.getElementById("waitTime").value = "10";
                    countdown = 10;
                }

                var timerId = setInterval(function() {
                    countdown--;
                    if (countdown >= 0) {
                        countdownBox.innerText = countdown;
                    } else {
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

    // Make the friction customisation arrow and text appear/disappear with the delay toggle
    var frictionToggle = document.getElementById("frictionToggle");
    var frictionCustomisationArrow = document.getElementById("frictionCustomisationArrow");

    frictionToggle.addEventListener('change', function() {
        browser.storage.sync.set({ "addFriction": document.getElementById("frictionToggle").checked });

        if (frictionToggle.checked) {
            frictionCustomisationArrow.style.display = "block";
        } else {
            frictionCustomisationArrow.style.display = "none";
        }
    });

    // Make the frictionCustomisationArrow go from right to down on click
    var frictionCustomisationArrowRight = document.getElementById("frictionCustomisationArrowRight");
    var frictionCustomisationArrowDown = document.getElementById("frictionCustomisationArrowDown");
    var frictionCustomisationOptions = document.querySelector(".toggle-group.friction-customisation");

    frictionCustomisationArrow.addEventListener('click', function() {
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

    // Store wait customisation
    var savedTextTime = document.getElementById("savedTextTime");
    let hideTimeOut;

    document.getElementById("waitTime").addEventListener('input', function() {
        clearTimeout(hideTimeOut);

        let waitValue = parseInt(document.getElementById("waitTime").value);
        const maxLimit = 600;
        const minLimit = 1;

        if (waitValue < minLimit) {
            document.getElementById("waitTime").value = minLimit;
        } else if (waitValue > maxLimit) {
            savedTextTime.innerText = "Maximum is " + maxLimit;
            document.getElementById("waitTime").value = maxLimit;
            savedTextTime.style.display = 'block';
            hideTimeOut = setTimeout(function() {
                savedTextTime.style.display = 'none';
            }, 2500);
        }
    });

    // Create function to set a checkbox according to current view status on the page
    function setCheckboxState(element_to_check, id_of_toggle) {
        var currentToggle = document.getElementById(id_of_toggle);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response) {
                if (response.text === "hidden") {
                    currentToggle.checked = true;
                } else if (response.text === "visible") {
                    currentToggle.checked = false;
                } else {
                    elementsThatCanBeHidden.forEach(function(element) {
                        var key = element_to_check + "Status";

                        browser.storage.sync.get(key, function(result) {
                            currentToggle.checked = result[key];
                        });
                    });
                }
            });
        });
    }

    // Create function to make a checkbox toggle view status on and off
    function toggleViewStatusCheckbox(element_to_change, id_of_toggle) {
        var currentCheckbox = document.getElementById(id_of_toggle);

        currentCheckbox.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: element_to_change });
            });
        }, false);
    }

    // Create function to set a three-state button (hide-blur-show)
    function setButtonState(element_to_check, id_of_toggle) {
        var currentButton = document.getElementById(id_of_toggle);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response) {
                if (response.text === "hidden") {
                    currentButton.setAttribute("data-state", "Off");
                } else if (response.text === "visible") {
                    currentButton.setAttribute("data-state", "On");
                } else if (response.text === "blur") {
                    currentButton.setAttribute("data-state", "Blur");
                } else {
                    var key = element_to_check + "Status";

                    browser.storage.sync.get(key, function(result) {
                        currentButton.setAttribute("data-state", result[key]);
                    });
                }
            });
        });
    }

    // Create function to set a four-state button (hide-blur-black-show)
    function setButtonStateFour(element_to_check, id_of_toggle) {
        var currentButton = document.getElementById(id_of_toggle);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "check", element: element_to_check }, function(response) {
                if (response.text === "hidden") {
                    currentButton.setAttribute("data-state", "Off");
                } else if (response.text === "visible") {
                    currentButton.setAttribute("data-state", "On");
                } else if (response.text === "blur") {
                    currentButton.setAttribute("data-state", "Blur");
                } else if (response.text === "black") {
                    currentButton.setAttribute("data-state", "Black");
                } else {
                    var key = element_to_check + "Status";

                    browser.storage.sync.get(key, function(result) {
                        currentButton.setAttribute("data-state", result[key]);
                    });
                }
            });
        });
    }

    // Create function to make a four-state button toggle status (hide-blur-black-view)
    function toggleViewStatusMultiToggle(element_to_change, id_of_toggle) {
        var currentButton = document.getElementById(id_of_toggle);
        let state;

        currentButton.addEventListener('click', function() {
            if (currentButton.getAttribute("data-state") == "On") {
                currentButton.setAttribute("data-state", "Off");
                state = "Off";
            } else if (currentButton.getAttribute("data-state") == "Off") {
                currentButton.setAttribute("data-state", "Blur");
                state = "Blur";
            } else if (currentButton.getAttribute("data-state") == "Blur") {
                currentButton.setAttribute("data-state", "Black");
                state = "Black";
            } else {
                currentButton.setAttribute("data-state", "On");
                state = "On";
            }

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "changeMultiToggle", element: element_to_change, action: state });
            });
        }, false);
    }

    // Assign the functions to the checkboxes
    elementsThatCanBeHidden.forEach(function(item) {
        if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
            setButtonStateFour(item, item + "Toggle");
            toggleViewStatusMultiToggle(item, item + "Toggle");
        } else {
            setCheckboxState(item, item + "Toggle");
            toggleViewStatusCheckbox(item, item + "Toggle");
        }
    });

    // Set switches according to current status
    function setSwitch(platform_to_check, id_of_switch) {
        var currentSwitch = document.getElementById(id_of_switch);

        var key = platform_to_check + "Status";

        browser.storage.sync.get(key, function(result) {
            if (result[key] == false) {
                currentSwitch.checked = false;

                var filteredElements = elementsThatCanBeHidden.filter(element =>
                    element.includes(platform_to_check)
                );
                filteredElements.forEach(function(item) {
                    document.getElementById(item + "Toggle").disabled = true;
                });
            } else {
                currentSwitch.checked = true;
            }
        });
    }

    // Handle when the switches are turned off or on
    platformsWeTarget.forEach(function(platform) {
        var currentSwitch = document.querySelector('#website-toggles #toggle-' + platform + ' input');
        var allCheckboxes = document.querySelectorAll('.dropdown.' + platform + ' .a-toggle input');

        currentSwitch.addEventListener("change", function() {
            if (!currentSwitch.checked) {
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element) {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "showAll", element: some_element });
                    });
                    document.getElementById(some_element + "Toggle").checked = false;
                });

                allCheckboxes.forEach(aCheckbox => {
                    aCheckbox.disabled = true;
                });

                var key = platform + "Status";
                browser.storage.sync.set({ [key]: false });
            } else {
                elementsThatCanBeHidden.filter(elem => elem.indexOf(platform) !== -1).forEach(function(some_element) {
                    var currentToggle = document.getElementById(some_element + "Toggle");
                    var key = some_element + "Status";

                    browser.storage.sync.get(key, function(result) {
                        currentToggle.checked = result[key];

                        if (currentToggle.checked) {
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                chrome.tabs.sendMessage(tabs[0].id, { method: "change", element: some_element });
                            });
                        }
                    });
                });

                allCheckboxes.forEach(aCheckbox => {
                    aCheckbox.disabled = false;
                });

                var key = platform + "Status";
                browser.storage.sync.set({ [key]: true });
            }
        });

        // Handle refresh symbol
        const refreshSymbol = document.getElementById(`${platform}RefreshSymbol`);
        if (refreshSymbol) {
            refreshSymbol.addEventListener('click', function() {
                const storageKey = `${platform}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    let customSelectors = result[storageKey] || [];
                    updateCustomElementsList(platform, customSelectors);
                });
            });
        }
    });

    platformsWeTarget.forEach(function(platform) {
        setSwitch(platform, platform + "Switch");
    });

    // Show the options for the website we're currently on and initialize custom elements
    let currentPlatform = null;
    chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
        platformsWeTarget.forEach(function(platform) {
            var currentHost = new URL(tab[0].url);

            if (currentHost.origin.includes(platform)) {
                currentPlatform = platform;
                document.querySelector('.dropdown.' + platform).classList.add('shown');
                document.querySelector('#website-toggles #toggle-' + platform).classList.add('shown-inline');

                // Initialize custom elements
                const storageKey = `${platform}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    let customSelectors = result[storageKey] || [];
                    updateCustomElementsList(platform, customSelectors);
                });

                // Handle "Add more elements" button
                const addButton = document.getElementById(`${platform}AddElementButton`);
                addButton.addEventListener('click', function() {
                    addButton.classList.add('active');
                    addButton.textContent = 'Hover over an element then click or press the space bar';
                    isSelectionModeActive = true;
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { method: "startSelecting" });
                    });
                    document.addEventListener('keydown', handleSpacebar);
                });
            }
        });
    });

    // Handle spacebar press to select element
    function handleSpacebar(event) {
        if (isSelectionModeActive && event.code === 'Space') {
            event.preventDefault();
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: "selectHighlightedElement" });
            });
        }
    }

    // Update custom elements list in popup
    function updateCustomElementsList(platform, selectors) {
        console.log('updateCustomElementsList called for', platform, 'with selectors:', selectors);
        const container = document.getElementById(`${platform}CustomElements`);
        container.innerHTML = '';

        selectors.forEach(selector => {
            const div = document.createElement('div');
            div.className = 'custom-element';

            const span = document.createElement('span');
            span.textContent = selector;
            div.appendChild(span);

            const button = document.createElement('button');
            button.className = 'remove-symbol';
            button.innerHTML = `
                <svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            button.title = 'Remove';
            button.addEventListener('click', function() {
                const storageKey = `${platform}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    let customSelectors = result[storageKey] || [];
                    customSelectors = customSelectors.filter(s => s !== selector);
                    browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                        updateCustomElementsList(platform, customSelectors);
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, { method: "removeCustomElement", selector: selector });
                        });
                    });
                });
            });
            div.appendChild(button);

            container.appendChild(div);
        });

        console.log('Updated container content:', container.innerHTML);
    }

    // Handle messages from content script
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if ((message.method === "elementSelected" || message.method === "selectionCanceled") && currentPlatform) {
            console.log('Received message:', message);
            const addButton = document.getElementById(`${currentPlatform}AddElementButton`);
            addButton.classList.remove('active');
            addButton.textContent = 'Hide custom elements';
            isSelectionModeActive = false;
            document.removeEventListener('keydown', handleSpacebar); // Clean up listener
            if (message.method === "elementSelected") {
                const storageKey = `${currentPlatform}CustomHiddenElements`;
                browser.storage.sync.get(storageKey, function(result) {
                    let customSelectors = result[storageKey] || [];
                    if (!customSelectors.includes(message.selector)) {
                        customSelectors.push(message.selector);
                        browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                            updateCustomElementsList(currentPlatform, customSelectors);
                        });
                    }
                });
            }
        }
    });

    // Helper function to wait for a specified time before executing
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    var saveButton = document.querySelector('#saveButton');

    saveButton.addEventListener('click', (e) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
            platformsWeTarget.forEach(function(platform) {
                var currentHost = new URL(tab[0].url);

                if (currentHost.origin.includes(platform)) {
                    var filteredElements = elementsThatCanBeHidden.filter(element =>
                        element.includes(platform)
                    );

                    filteredElements.forEach(function(element) {
                        var key = element + "Status";
                        var elementToggle = document.getElementById(element + "Toggle");
                        var value = (elementToggle.getAttribute("data-state") != null) ?
                            elementToggle.getAttribute("data-state") :
                            elementToggle.checked;
                        browser.storage.sync.set({ [key]: value });
                    });

                    // Save custom elements
                    const storageKey = `${platform}CustomHiddenElements`;
                    const container = document.getElementById(`${platform}CustomElements`);
                    const selectors = Array.from(container.getElementsByClassName('custom-element'))
                        .map(div => div.querySelector('span').textContent);
                    browser.storage.sync.set({ [storageKey]: selectors });
                }
            });
        });

        let waitValue = parseInt(document.getElementById("waitTime").value);
        browser.storage.sync.set({ "waitTime": waitValue });
        browser.storage.sync.set({ "waitText": document.getElementById("waitText").value });

        e.target.setAttribute("value", "......");
        delay(250).then(() => e.target.setAttribute("value", "Saved!"));
        delay(1500).then(() => e.target.setAttribute("value", "Save settings"));
    });

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
