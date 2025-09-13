document.addEventListener('DOMContentLoaded', function () {
    initializePopup();

    function initializePopup() {
        console.log("Popup initialized.");

        // hide payment field for now
        const paymentField = document.getElementById('payment-status');
        paymentField.style.display = 'none';

        /*// Check payment status when popup opens"
        checkPaymentStatus();

        function checkPaymentStatus() {
            const paymentText = document.getElementById('payment-text');

            // Send message to check payment status
            chrome.runtime.sendMessage({ type: "checkPurchase" })
                .then(result => {
                    if (result === null) {
                        paymentText.textContent = 'Not available on this browser';
                    } else if (result && result.paid !== undefined) {
                        paymentText.textContent = result.paid ? 'Paid' : 'Not Paid';
                    } else {
                        paymentText.textContent = 'Error';
                    }
                })
                .catch(err => {
                    console.error("Error checking purchase:", err);
                    paymentText.textContent = 'Error';
                });
        }*/

        let isSelectionModeActive = false;
        let currentPlatform = null;
        let currentSiteIdentifier = null;
        let rememberSettingsEnabled = true; // default

        let opensCount = localStorage.getItem('opensCount');
        opensCount = opensCount ? parseInt(opensCount, 10) + 1 : 1;
        localStorage.setItem('opensCount', opensCount);
        let noThanksClicked = localStorage.getItem('noThanksClicked') === 'true';
        if (opensCount % 10 === 0 && !noThanksClicked) {
            var reviewPrompt = document.getElementById('reviewPrompt');
            if (reviewPrompt) reviewPrompt.style.display = 'block';
        }
        document.getElementById('noThanksButton').addEventListener('click', function () {
            localStorage.setItem('noThanksClicked', 'true');
            var reviewPrompt = document.getElementById('reviewPrompt');
            if (reviewPrompt) reviewPrompt.style.display = 'none';
        });

        function setupFrictionDelay() {
            var frictionToggle = document.getElementById("frictionToggle");
            var frictionCustomisationOptions = document.querySelector('.toggle-group.center-align.friction-customisation');
            
            chrome.storage.sync.get(["addFriction", "waitText", "waitTime"]).then((result) => {
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
                frictionCustomisationOptions.style.display = frictionToggle.checked ? "block" : "none";

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
            frictionToggle.addEventListener('change', function () {
                chrome.storage.sync.set({ "addFriction": frictionToggle.checked });
                frictionCustomisationOptions.style.display = frictionToggle.checked ? "block" : "none";
            });

            
            // Auto-save wait time
            document.getElementById("waitTime").addEventListener('input', function () {
                let waitValue = parseInt(this.value) || 10;
                chrome.storage.sync.set({ "waitTime": waitValue });
            });

            // Auto-save wait text
            document.getElementById("waitText").addEventListener('input', function () {
                chrome.storage.sync.set({ "waitText": this.value });
            })

            var savedTextTime = document.getElementById("savedTextTime");
            let hideTimeOut;
            document.getElementById("waitTime").addEventListener('input', function () {
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
                    // stop selecting by updating storage
                    if (currentSiteIdentifier) {
                        chrome.storage.sync.set({ [`${currentSiteIdentifier}SelectionActive`]: false });
                    }
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

        function isRememberEnabled() {
            return rememberSettingsEnabled === true;
        }

        function applySettingChange(elementKey, value) {
            // elementKey examples: youtubeShorts, youtubeThumbnails, etc. Persist if remembering, else send session override
            const storageKey = elementKey + "Status";
            if (isRememberEnabled()) {
                let obj = {};
                obj[storageKey] = value;
                chrome.storage.sync.set(obj);
            } else {
                // session-only override for the active tab
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    if (tabs && tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'sessionOverride', key: storageKey, value: value });
                    }
                });
            }
        }

        function setCheckboxState(element_to_check, id_of_toggle) {
            var currentToggle = document.getElementById(id_of_toggle);
            if (!currentToggle) return;

            chrome.storage.sync.get(element_to_check + "Status", function (result) {
                currentToggle.checked = result[element_to_check + "Status"] || false;
            });
        }

        function toggleViewStatusCheckbox(element_to_change, id_of_toggle) {
            var currentCheckbox = document.getElementById(id_of_toggle);
            if (!currentCheckbox) return;

            currentCheckbox.addEventListener('click', function () {
                const newValue = currentCheckbox.checked;
                applySettingChange(element_to_change, newValue);
                currentCheckbox.classList.add('loading'); // Add loading class for animation

                setTimeout(() => {
                    currentCheckbox.classList.remove('loading'); // Remove loading class after animation
                }, 800); // 0.8-second animation duration
            }, false);
        }

        function setButtonStateFour(element_to_check, id_of_toggle) {
            var currentButton = document.getElementById(id_of_toggle);
            if (!currentButton) return;

            chrome.storage.sync.get(element_to_check + "Status", function (result) {
                let state = result[element_to_check + "Status"] || "On";
                currentButton.setAttribute("data-state", state);
            });
        }

        function toggleViewStatusMultiToggle(element_to_change, id_of_toggle) {
            var currentButton = document.getElementById(id_of_toggle);
            if (!currentButton) return;

            currentButton.addEventListener('click', function () {
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
                applySettingChange(element_to_change, nextState);
                currentButton.classList.add('loading'); // Add loading class for animation

                setTimeout(() => {
                    currentButton.classList.remove('loading'); // Remove loading class after animation
                }, 800); // 0.8-second animation duration
            }, false);
        }

        elementsThatCanBeHidden.forEach(function (item) {
            if (item.startsWith('youtube') || item.startsWith('facebook') || item.startsWith('x') ||
                item.startsWith('instagram') || item.startsWith('linkedin') || item.startsWith('whatsapp') ||
                item.startsWith('google') || item.startsWith('reddit')) {
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
            chrome.storage.sync.get(key, function (result) {
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

            currentSwitch.addEventListener("change", function () {
                const platformIsEnabled = currentSwitch.checked;
                var platformToggles = document.querySelectorAll(`.dropdown.${platform} .a-toggle input, .dropdown.${platform} .a-toggle button`);

                if (!platformIsEnabled) {
                    // Disable all toggles in UI
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
                }

                // Apply either persistent or session-only platform status
                const platformStatusKey = platform + "Status";
                if (isRememberEnabled()) {
                    let obj = {};
                    obj[platformStatusKey] = platformIsEnabled;
                    chrome.storage.sync.set(obj);
                } else {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        if (tabs && tabs[0]) {
                            chrome.tabs.sendMessage(tabs[0].id, { type: 'sessionOverride', key: platformStatusKey, value: platformIsEnabled });
                        }
                    });
                }
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
                button.addEventListener('click', function () {
                    const storageKey = `${siteIdentifier}CustomHiddenElements`;
                    chrome.storage.sync.get(storageKey, function (result) {
                        let currentSelectors = result[storageKey] || [];
                        currentSelectors = currentSelectors.filter(s => s !== selector);
                        chrome.storage.sync.set({ [storageKey]: currentSelectors }, function () {
                            updateCustomElementsList(siteIdentifier, currentSelectors);
                        });
                    });
                });
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
                addButton.addEventListener('click', function () {
                    if (isSelectionModeActive) {
                        isSelectionModeActive = false;
                        addButton.classList.remove('active');
                        addButton.textContent = 'Hide custom element';
                        chrome.storage.sync.set({ [`${siteIdentifier}SelectionActive`]: false });
                    } else {
                        isSelectionModeActive = true;
                        addButton.classList.add('active');
                        addButton.textContent = 'Click/Tap element to hide';
                        chrome.storage.sync.set({ [`${siteIdentifier}SelectionActive`]: true });
                    }
                });
            } else { console.error("Add button not found:", addButtonId); }
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
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
                chrome.storage.sync.get(storageKey, function (result) {
                    updateCustomElementsList(currentPlatform, result[storageKey] || []);
                });

            } else if (currentHost && !currentURL.protocol.startsWith('chrome') && !currentURL.protocol.startsWith('about')) {
                currentSiteIdentifier = currentHost;
                document.getElementById('website-toggles').style.display = 'none';
                document.getElementById('generic-site-options').style.display = 'block';
                document.getElementById('currentSiteInfo').style.display = 'block';

                setupCustomElementControls(currentSiteIdentifier);
                const storageKey = `${currentSiteIdentifier}CustomHiddenElements`;
                chrome.storage.sync.get(storageKey, function (result) {
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
            }

            if (currentPlatform) {
                elementsThatCanBeHidden.filter(e => e.startsWith(currentPlatform)).forEach(item => {
                    if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                        setButtonStateFour(item, item + "Toggle");
                    } else {
                        setCheckboxState(item, item + "Toggle");
                    }
                });
            }

            // Setup Remember settings UI now that we know the site identifier
            const rememberToggle = document.getElementById('rememberSettingsToggle');
            const saveFooter = document.getElementById('save-controls');
            const saveBtn = document.getElementById('saveButton');
            const saveStatus = document.getElementById('saveStatus');
            if (rememberToggle && saveFooter) {
                const rememberKey = `${currentSiteIdentifier}RememberSettings`;
                chrome.storage.sync.get(rememberKey, function (result) {
                    rememberSettingsEnabled = result[rememberKey] !== false; // default true
                    rememberToggle.checked = rememberSettingsEnabled;
                    saveFooter.style.display = rememberSettingsEnabled ? 'none' : 'block';
                    if (!rememberSettingsEnabled) {
                        // If not remembering, sync UI with current session overrides
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            if (!tabs || !tabs[0]) return;
                            chrome.tabs.sendMessage(tabs[0].id, { type: 'getSessionOverrides' }, function (response) {
                                if (response && response.overrides) {
                                    applyOverridesToUI(response.overrides);
                                }
                            });
                        });
                    }
                });
                rememberToggle.addEventListener('change', function () {
                    rememberSettingsEnabled = rememberToggle.checked;
                    saveFooter.style.display = rememberSettingsEnabled ? 'none' : 'block';
                    let obj = {};
                    obj[`${currentSiteIdentifier}RememberSettings`] = rememberSettingsEnabled;
                    chrome.storage.sync.set(obj);
                    if (!rememberSettingsEnabled) {
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            if (!tabs || !tabs[0]) return;
                            chrome.tabs.sendMessage(tabs[0].id, { type: 'getSessionOverrides' }, function (response) {
                                if (response && response.overrides) {
                                    applyOverridesToUI(response.overrides);
                                }
                            });
                        });
                    }
                });
                if (saveBtn) {
                    saveBtn.addEventListener('click', function () {
                        const originalLabel = saveBtn.textContent;
                        saveBtn.textContent = 'Saving...';
                        saveBtn.disabled = true;

                        // Ask content script for current session overrides and persist them
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            if (!tabs || !tabs[0]) {
                                saveBtn.textContent = originalLabel;
                                saveBtn.disabled = false;
                                return;
                            }
                            chrome.tabs.sendMessage(tabs[0].id, { type: 'getSessionOverrides' }, function (response) {
                                if (!response) {
                                    saveBtn.textContent = originalLabel;
                                    saveBtn.disabled = false;
                                    return;
                                }
                                const toSet = {};
                                if (response.overrides) {
                                    Object.keys(response.overrides).forEach(k => { toSet[k] = response.overrides[k]; });
                                }
                                const writes = [];
                                if (Object.keys(toSet).length > 0) { writes.push(chrome.storage.sync.set(toSet)); }
                                if (response.customSelectors && Array.isArray(response.customSelectors)) {
                                    const customKey = `${currentSiteIdentifier}CustomHiddenElements`;
                                    const obj = {}; obj[customKey] = response.customSelectors; writes.push(chrome.storage.sync.set(obj));
                                }
                                Promise.all(writes).then(() => {
                                    saveBtn.textContent = 'Saved!';
                                    saveBtn.classList.add('is-success');
                                    setTimeout(() => {
                                        saveBtn.textContent = originalLabel;
                                        saveBtn.classList.remove('is-success');
                                        saveBtn.disabled = false;
                                    }, 1000);
                                }).catch(() => {
                                    saveBtn.textContent = originalLabel;
                                    saveBtn.disabled = false;
                                });
                            });
                        });
                    });
                }
            }
        });

        function applyOverridesToUI(overrides) {
            if (!overrides) return;
            // Apply platform status override
            if (currentPlatform) {
                const platformKey = `${currentPlatform}Status`;
                if (Object.prototype.hasOwnProperty.call(overrides, platformKey)) {
                    const platformSwitch = document.querySelector('#website-toggles #toggle-' + currentPlatform + ' input');
                    if (platformSwitch) platformSwitch.checked = overrides[platformKey] !== false;
                }
                // Apply element overrides
                elementsThatCanBeHidden.filter(e => e.startsWith(currentPlatform)).forEach(item => {
                    const statusKey = item + 'Status';
                    if (!Object.prototype.hasOwnProperty.call(overrides, statusKey)) return;
                    const toggleEl = document.getElementById(item + 'Toggle');
                    if (!toggleEl) return;
                    if (toggleEl.tagName === 'BUTTON') {
                        let state = overrides[statusKey] || 'On';
                        toggleEl.setAttribute('data-state', state);
                    } else if (toggleEl.type === 'checkbox') {
                        // Booleans use true => hidden (checked)
                        toggleEl.checked = !!overrides[statusKey];
                    }
                });
            }
        }

        function delay(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        }

        function setupAccordion(triggerId, contentId, arrowRightId, arrowDownId) {
            const trigger = document.querySelector(triggerId);
            const content = document.querySelector(contentId);
            const arrowRight = document.querySelector(arrowRightId);
            const arrowDown = document.querySelector(arrowDownId);

            if (!trigger || !content || !arrowRight || !arrowDown) return;

            trigger.addEventListener("click", function () {
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
                faqDropdown.style.display = isVisible ? 'none' : 'block';
                faqOverlay.style.display = isVisible ? 'none' : 'block';
                
                if (!isVisible) {
                    // Calculate and set expanded height
                    const contentHeight = document.getElementById('popup-content').offsetHeight;
                    const dropdownHeight = faqDropdown.offsetHeight;
                    const requiredHeight = Math.max(contentHeight, dropdownHeight) + 100; // + footer/padding
                    document.body.style.minHeight = `${requiredHeight}px`;
                } else {
                    // Reset to original
                    document.body.style.minHeight = '250px';
                }
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
            
            // handle the close button
            const closeBtn = document.getElementById('faq-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    faqDropdown.style.display = 'none';
                    faqOverlay.style.display = 'none';
                    document.body.style.minHeight = '250px';
                });
            }

            // Close dropdown and overlay if clicking outside
            document.addEventListener('click', (event) => {
                if (!faqDropdown.contains(event.target) && !helpBtn.contains(event.target)) {
                    faqDropdown.style.display = 'none';
                    faqOverlay.style.display = 'none';
                    document.body.style.minHeight = '250px';
                }
            });
        }

        // Setup all interactive elements at the end
        setupHelpAndFAQ();
        setupAccordion('#hide-previews', '#how-to-description', '#how-to-arrow-right', '#how-to-arrow-down');
        setupAccordion('#hide-previews-not-mobile', '#how-to-description-not-mobile', '#how-to-arrow-right-not-mobile', '#how-to-arrow-down-not-mobile');
        
        // Listen for storage changes to update UI automatically
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            if (namespace === 'sync' && currentSiteIdentifier) {
                // Check for custom element changes
                const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
                if (changes[customStorageKey]) {
                    const newSelectors = changes[customStorageKey].newValue || [];
                    updateCustomElementsList(currentSiteIdentifier, newSelectors);
                }
                
                // Check for selection state changes
                const selectionKey = `${currentSiteIdentifier}SelectionActive`;
                if (changes[selectionKey]) {
                    const isActive = changes[selectionKey].newValue === true;
                    isSelectionModeActive = isActive;
                    
                    // Update button state
                    const addButtonId = currentPlatform ? `${currentSiteIdentifier}AddElementButton` : 'genericAddElementButton';
                    const addButton = document.getElementById(addButtonId);
                    if (addButton) {
                        if (isActive) {
                            addButton.classList.add('active');
                            addButton.textContent = 'Click/Tap element to hide';
                        } else {
                            addButton.classList.remove('active');
                            addButton.textContent = 'Hide custom element';
                        }
                    }
                }
            }
        });
    }
}, false);
