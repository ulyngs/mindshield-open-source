(function() {

    // --- All helper functions are defined first, making them available to the entire script ---

    const shadowSelectors = {
        "redditPopular": "left-nav-top-section",
        "redditAll": "left-nav-top-section",
    };

    function createStyleElement(some_style_id, some_css) {
        const elementToHide = some_style_id.replace("Style", "");
        let domRoot = document.head;
        if (elementToHide in shadowSelectors) {
            const shadowHostSelector = shadowSelectors[elementToHide];
            const shadowHost = document.querySelector(shadowHostSelector);
            if (shadowHost && shadowHost.shadowRoot) {
                domRoot = shadowHost.shadowRoot;
            } else {
                // This warning is fine, as it might just mean the element isn't on the page yet.
                // console.warn(`Shadow host '${shadowHostSelector}' for '${elementToHide}' not found or shadow root not accessible. Style may not be applied yet.`);
                return;
            }
        }
        let styleElement = domRoot.querySelector("#" + some_style_id);
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = some_style_id;
            styleElement.textContent = some_css;
            domRoot.appendChild(styleElement);
        } else {
            if (styleElement.textContent !== some_css) {
                styleElement.textContent = some_css;
            }
        }
    }

    function generateCSSSelector(el) {
        if (!(el instanceof Element)) return null;
        if (el.id) {
            const idSelector = `#${CSS.escape(el.id)}`;
            try {
                if (document.querySelectorAll(idSelector).length === 1) return idSelector;
            } catch (e) {}
        }
        let path = [];
        let currentEl = el;
        while (currentEl && currentEl !== document.documentElement && currentEl !== document.body) {
            let selector = currentEl.nodeName.toLowerCase();
            let parent = currentEl.parentElement;
            if (!parent) break;
            let index = 1;
            let sibling = currentEl.previousElementSibling;
            while (sibling) {
                if (sibling.nodeName.toLowerCase() === selector) index++;
                sibling = sibling.previousElementSibling;
            }
            if (index > 1) {
                let ofTypeIndex = 1;
                let ofTypeSibling = currentEl.previousElementSibling;
                while (ofTypeSibling) {
                    if (ofTypeSibling.nodeName.toLowerCase() === selector) ofTypeIndex++;
                    ofTypeSibling = ofTypeSibling.previousElementSibling;
                }
                selector += (ofTypeIndex === index) ? `:nth-of-type(${index})` : `:nth-child(${index})`;
            } else {
                let nextSibling = currentEl.nextElementSibling;
                let hasSimilarNext = false;
                while (nextSibling) {
                    if (nextSibling.nodeName.toLowerCase() === selector) {
                        hasSimilarNext = true;
                        break;
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
                if (hasSimilarNext) selector += ':nth-of-type(1)';
            }
            path.unshift(selector);
            currentEl = parent;
        }
        if (path.length === 0) return null;
        const fullPath = path.join(' > ');
        try {
            const elements = document.querySelectorAll(fullPath);
            if (elements.length !== 1) {
                const bodyPath = `body > ${fullPath}`;
                if (document.querySelectorAll(bodyPath).length === 1) return bodyPath;
            }
            return fullPath;
        } catch (e) {
            console.error("Error validating generated selector:", fullPath, e);
            return null;
        }
    }

    let isSelecting = false;
    let highlightOverlay = null;
    let selectorDisplay = null;
    let feedbackContainer = null;
    let currentHighlightedElement = null;
    let lastTapTime = 0;
    let sessionHiddenSelectors = [];
    const highlightStyleId = 'mindshield-highlight-style';

    function createHighlightOverlay() {
        if (!highlightOverlay) {
            highlightOverlay = document.createElement('div');
            highlightOverlay.style.position = 'absolute';
            highlightOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            highlightOverlay.style.border = '1px dashed red';
            highlightOverlay.style.zIndex = '2147483646';
            highlightOverlay.style.pointerEvents = 'none';
            highlightOverlay.style.margin = '0';
            highlightOverlay.style.padding = '0';
            highlightOverlay.style.boxSizing = 'border-box';
            document.body.appendChild(highlightOverlay);
        }
    }

    function createSelectorDisplay() {
        if (!selectorDisplay) {
            selectorDisplay = document.createElement('div');
            selectorDisplay.style.position = 'fixed';
            selectorDisplay.style.background = 'rgba(0, 0, 0, 0.8)';
            selectorDisplay.style.color = 'white';
            selectorDisplay.style.padding = '3px 6px';
            selectorDisplay.style.borderRadius = '3px';
            selectorDisplay.style.zIndex = '2147483647';
            selectorDisplay.style.fontSize = '11px';
            selectorDisplay.style.fontFamily = 'monospace';
            selectorDisplay.style.pointerEvents = 'none';
            selectorDisplay.style.maxWidth = '300px';
            selectorDisplay.style.whiteSpace = 'nowrap';
            selectorDisplay.style.overflow = 'hidden';
            selectorDisplay.style.textOverflow = 'ellipsis';
            document.body.appendChild(selectorDisplay);
        }
    }

    function createFeedbackContainer() {
        if (!feedbackContainer) {
            feedbackContainer = document.createElement('div');
            feedbackContainer.id = 'mindshield-feedback-container';
            feedbackContainer.style.position = 'fixed';
            feedbackContainer.style.top = '100px';
            feedbackContainer.style.left = '10px';
            feedbackContainer.style.background = 'rgba(0, 0, 0, 0.8)';
            feedbackContainer.style.color = 'white';
            feedbackContainer.style.padding = '10px';
            feedbackContainer.style.borderRadius = '5px';
            feedbackContainer.style.zIndex = '2147483647';
            feedbackContainer.style.fontFamily = 'Arial, sans-serif';
            feedbackContainer.style.fontSize = '18px';
            feedbackContainer.style.display = 'flex';
            feedbackContainer.style.alignItems = 'center';
            feedbackContainer.style.gap = '10px';
            feedbackContainer.style.cursor = 'move';
            feedbackContainer.style.userSelect = 'none';
            document.body.appendChild(feedbackContainer);
            updateFeedbackMessage('Click element to hide it');
            setupDragEvents();
        }
    }

    function setupDragEvents() {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        function startDragging(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            initialX = (e.clientX || e.touches[0].clientX) - currentX;
            initialY = (e.clientY || e.touches[0].clientY) - currentY;
            isDragging = true;
            feedbackContainer.style.transition = 'none';
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            let clientX = e.clientX || (e.touches && e.touches[0].clientX);
            let clientY = e.clientY || (e.touches && e.touches[0].clientY);
            currentX = clientX - initialX;
            currentY = clientY - initialY;
            currentX = Math.max(0, Math.min(currentX, window.innerWidth - feedbackContainer.offsetWidth));
            currentY = Math.max(0, Math.min(currentY, window.innerHeight - feedbackContainer.offsetHeight));
            feedbackContainer.style.left = `${currentX}px`;
            feedbackContainer.style.top = `${currentY}px`;
        }

        function stopDragging() {
            isDragging = false;
            feedbackContainer.style.transition = 'all 0.2s ease';
        }

        currentX = parseInt(feedbackContainer.style.left) || 10;
        currentY = parseInt(feedbackContainer.style.top) || 10;
        feedbackContainer.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
        feedbackContainer.addEventListener('touchstart', startDragging, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDragging);
    }

    function updateFeedbackMessage(message, showUndo = false) {
        if (!feedbackContainer) return;
        feedbackContainer.innerHTML = `<span>${message}</span>`;
        if (showUndo) {
            const undoButton = document.createElement('button');
            undoButton.textContent = 'Undo';
            undoButton.style.background = '#555';
            undoButton.style.color = 'white';
            undoButton.style.border = 'none';
            undoButton.style.padding = '5px 10px';
            undoButton.style.borderRadius = '3px';
            undoButton.style.cursor = 'pointer';
            undoButton.addEventListener('click', handleUndo);
            undoButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUndo();
            });
            feedbackContainer.appendChild(undoButton);
        }
        const doneButton = document.createElement('button');
        doneButton.textContent = 'Done';
        doneButton.style.background = '#007bff';
        doneButton.style.color = 'white';
        doneButton.style.border = 'none';
        doneButton.style.padding = '5px 10px';
        doneButton.style.borderRadius = '3px';
        doneButton.style.cursor = 'pointer';
        doneButton.addEventListener('click', () => stopSelecting(false));
        doneButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            stopSelecting(false);
        });
        feedbackContainer.appendChild(doneButton);
    }

    function handleUndo() {
        if (sessionHiddenSelectors.length === 0 || !currentSiteIdentifier) return;
        const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
        browser.storage.sync.get(customStorageKey, function(result) {
            let customSelectors = result[customStorageKey] || [];
            if (!Array.isArray(customSelectors)) customSelectors = [];
            const selectorToRemove = sessionHiddenSelectors.pop();
            customSelectors = customSelectors.filter(s => s !== selectorToRemove);
            browser.storage.sync.set({ [customStorageKey]: customSelectors }, function() {
                if (browser.runtime.lastError) {
                    console.error("Error removing custom selector from storage:", browser.runtime.lastError);
                } else {
                    applyCustomElementStyles(currentSiteIdentifier, customSelectors);
                    if (sessionHiddenSelectors.length > 0) {
                        updateFeedbackMessage('Element hidden', true);
                    } else {
                        updateFeedbackMessage('Click element to hide it');
                    }
                }
            });
        });
    }

    function startSelecting() {
        if (isSelecting) return;
        isSelecting = true;
        createHighlightOverlay();
        createSelectorDisplay();
        createFeedbackContainer();
        document.addEventListener('mousemove', highlightElement, { capture: true });
        document.addEventListener('touchstart', highlightElement, { capture: true, passive: true });
        document.addEventListener('click', selectElementOnClick, { capture: true });
        document.addEventListener('touchend', selectElementOnTap, { capture: true });
        document.addEventListener('keydown', handleKeydown, { capture: true });
    }

    function stopSelecting(cancelled = false) {
        if (!isSelecting) return;
        isSelecting = false;
        document.removeEventListener('mousemove', highlightElement, { capture: true });
        document.removeEventListener('touchstart', highlightElement, { capture: true });
        document.removeEventListener('click', selectElementOnClick, { capture: true });
        document.removeEventListener('touchend', selectElementOnTap, { capture: true });
        document.removeEventListener('keydown', handleKeydown, { capture: true });
        if (feedbackContainer) feedbackContainer.remove();
        if (highlightOverlay) highlightOverlay.remove();
        if (selectorDisplay) selectorDisplay.remove();
        const tempStyle = document.getElementById(highlightStyleId);
        if (tempStyle) tempStyle.remove();
        feedbackContainer = highlightOverlay = selectorDisplay = currentHighlightedElement = null;
        sessionHiddenSelectors = [];
        if (cancelled) {
            browser.runtime.sendMessage({ method: "selectionCanceled" }).catch(e => console.debug("Popup likely closed:", e));
        }
    }

    function handleKeydown(event) {
        if (event.key === 'Escape' && isSelecting) {
            event.preventDefault();
            event.stopImmediatePropagation();
            stopSelecting(true);
        }
    }

    function highlightElement(event) {
        if (!isSelecting) return;
        const el = event.target;
        if (!el || el === highlightOverlay || el === selectorDisplay || el.closest('#mindshield-feedback-container')) {
            if (highlightOverlay) highlightOverlay.style.display = 'none';
            if (selectorDisplay) selectorDisplay.style.display = 'none';
            currentHighlightedElement = null;
            return;
        }
        currentHighlightedElement = el;
        const selector = generateCSSSelector(el);
        let posX, posY;
        if (event.touches && event.touches.length > 0) { posX = event.touches[0].clientX; posY = event.touches[0].clientY; }
        else if (event.clientX !== undefined) { posX = event.clientX; posY = event.clientY; }
        else { return; }
        if (selectorDisplay) {
            selectorDisplay.textContent = selector || "Cannot select this element";
            const displayPosX = posX + 15;
            const displayPosY = posY + 15;
            selectorDisplay.style.left = `${Math.min(displayPosX, window.innerWidth - selectorDisplay.offsetWidth - 10)}px`;
            selectorDisplay.style.top = `${Math.min(displayPosY, window.innerHeight - selectorDisplay.offsetHeight - 10)}px`;
            selectorDisplay.style.display = 'block';
        }
        if (highlightOverlay) {
            const rect = el.getBoundingClientRect();
            highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
            highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
            highlightOverlay.style.width = `${rect.width}px`;
            highlightOverlay.style.height = `${rect.height}px`;
            highlightOverlay.style.display = 'block';
        }
    }

    function selectElementOnClick(event) {
        if (Date.now() - lastTapTime < 500) { event.preventDefault(); event.stopPropagation(); return; }
        if (!isSelecting || event.target.closest('#mindshield-feedback-container') || event.target.tagName === 'BUTTON' || event.target !== currentHighlightedElement) return;
        event.preventDefault();
        event.stopPropagation();
        processSelectedElement(currentHighlightedElement);
    }

    function selectElementOnTap(event) {
        lastTapTime = Date.now();
        if (!isSelecting || event.target.closest('#mindshield-feedback-container') || event.target.tagName === 'BUTTON' || !currentHighlightedElement) return;
        event.preventDefault();
        event.stopPropagation();
        processSelectedElement(currentHighlightedElement);
    }

    function processSelectedElement(el) {
        if (!el || el === document.body || el === document.documentElement) return;
        const selector = generateCSSSelector(el);
        if (!selector || !currentSiteIdentifier) {
            console.warn("Could not generate a reliable selector for the element or site identifier is missing.");
            return;
        }
        const storageKey = `${currentSiteIdentifier}CustomHiddenElements`;
        browser.storage.sync.get(storageKey, function(result) {
            let customSelectors = result[storageKey] || [];
            if (!Array.isArray(customSelectors)) customSelectors = [];
            if (!customSelectors.includes(selector)) {
                customSelectors.push(selector);
                sessionHiddenSelectors.push(selector);
                browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                    if (browser.runtime.lastError) {
                        console.error("Error saving custom selectors:", browser.runtime.lastError);
                    } else {
                        applyCustomElementStyles(currentSiteIdentifier, customSelectors);
                        updateFeedbackMessage('Element hidden', true);
                    }
                });
            } else {
                updateFeedbackMessage('Element already hidden');
            }
        });
    }

    function applyCustomElementStyles(siteIdentifier, selectors) {
        const styleId = `customHidden_${siteIdentifier.replace(/\./g, '_')}Style`;
        const css = selectors.length > 0 ? selectors.map(s => `${s} { display: none !important; }`).join('\n') : '';
        createStyleElement(styleId, css);
    }

    // --- Calculate site-specific identifiers ---
    let currentPlatform = null;
    const currentHostname = window.location.hostname;

    for (const platform in platformHostnames) {
        if (platformHostnames[platform].includes(currentHostname)) {
            currentPlatform = platform;
            break;
        }
    }
    const currentSiteIdentifier = currentPlatform || currentHostname;

    // --- Register the message listener (this will now happen on every execution) ---
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.method === "ping") {
            sendResponse({ status: "pong" });
            return true; // Keep message channel open for async response
        }

        if (message.element && currentPlatform && !message.element.startsWith(currentPlatform)) {
            return;
        }

        var styleName = message.element ? message.element + "Style" : null;
        let domRoot = document.head;

        if (message.element && message.element in shadowSelectors) {
            const shadowHost = document.querySelector(shadowSelectors[message.element]);
            if (shadowHost && shadowHost.shadowRoot) {
                domRoot = shadowHost.shadowRoot;
            } else {
                if (message.method === "check") sendResponse({ text: "unknown (shadow root)" });
                return true;
            }
        }

        var currentStyleElement = styleName ? domRoot.querySelector("#" + styleName) : null;

        if (message.method === "check" && message.element) {
            if (!currentStyleElement) {
                browser.storage.sync.get(message.element + "Status", function(result) {
                    let storedValue = result[message.element + "Status"];
                    if (message.element === "youtubeThumbnails" || message.element === "youtubeNotifications") {
                        sendResponse({ text: (storedValue || "On").toLowerCase() });
                    } else {
                        sendResponse({ text: storedValue === true ? "hidden" : "visible" });
                    }
                });
                return true;
            }
            const currentCss = currentStyleElement.textContent;
            let responseText = "unknown";
            if (currentCss === cssSelectors[message.element + 'CssOn']) responseText = "visible";
            else if (currentCss === cssSelectors[message.element + 'CssOff']) responseText = "hidden";
            else if ((message.element === "youtubeThumbnails" || message.element === "youtubeNotifications")) {
                if (currentCss === cssSelectors[message.element + 'CssBlur']) responseText = "blur";
                else if (currentCss === cssSelectors[message.element + 'CssBlack']) responseText = (message.element === "youtubeNotifications" && cssSelectors.youtubeNotificationsCssBlack === cssSelectors.youtubeNotificationsCssOff) ? "hidden" : "black";
            }
            sendResponse({ text: responseText });
            return false;
        }

        if (message.method === "checkCustom" && message.selector) {
            const customStyleId = `customHidden_${currentSiteIdentifier.replace(/\./g, '_')}Style`;
            const styleElement = document.head.querySelector(`#${customStyleId}`);
            let isVisible = true;
            if (styleElement && styleElement.textContent.includes(`${message.selector} { display: none !important; }`)) {
                isVisible = false;
            }
            sendResponse({ visible: isVisible });
            return true;
        }

        if (message.method === "toggleCustomVisibility" && message.selector && currentSiteIdentifier) {
            const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
            browser.storage.sync.get(customStorageKey, function(result) {
                let customSelectors = result[customStorageKey] || [];
                if (!Array.isArray(customSelectors)) customSelectors = [];
                const css = customSelectors
                    .map(s => s === message.selector && message.visible ? '' : `${s} { display: none !important; }`)
                    .filter(s => s)
                    .join('\n');
                const customStyleId = `customHidden_${currentSiteIdentifier.replace(/\./g, '_')}Style`;
                createStyleElement(customStyleId, css);
            });
            return false;
        }

        if (message.method === "change" && message.element) {
            const cssOn = cssSelectors[message.element + 'CssOn'];
            const cssOff = cssSelectors[message.element + 'CssOff'];
            if (currentStyleElement) {
                currentStyleElement.textContent = (currentStyleElement.textContent === cssOn) ? cssOff : cssOn;
            } else {
                createStyleElement(styleName, cssOff);
            }
        } else if (message.method === "changeMultiToggle" && message.element && message.action) {
            const cssToApply = cssSelectors[message.element + 'Css' + message.action];
            createStyleElement(styleName, cssToApply);
        } else if (message.method === "showAll" && message.element) {
            createStyleElement(styleName, cssSelectors[message.element + 'CssOn']);
        } else if (message.method === "hideAll" && message.element) {
            createStyleElement(styleName, cssSelectors[message.element + 'CssOff']);
        } else if (message.method === "startSelecting") {
            startSelecting();
        } else if (message.method === "stopSelecting") {
            stopSelecting(message.cancelled);
        } else if (message.method === "removeCustomElement" && message.selector && currentSiteIdentifier) {
            const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
            browser.storage.sync.get(customStorageKey, function(result) {
                let customSelectors = result[customStorageKey] || [];
                if (!Array.isArray(customSelectors)) customSelectors = [];
                customSelectors = customSelectors.filter(s => s !== message.selector);
                browser.storage.sync.set({ [customStorageKey]: customSelectors }, function() {
                    if (chrome.runtime.lastError) console.error("Error removing custom selector from storage:", chrome.runtime.lastError);
                    else applyCustomElementStyles(currentSiteIdentifier, customSelectors);
                });
            });
        } else if (message.method === "refreshCustomElements" && currentSiteIdentifier) {
            const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
            browser.storage.sync.get(customStorageKey, function(result) {
                let customSelectors = result[customStorageKey] || [];
                if (!Array.isArray(customSelectors)) customSelectors = [];
                applyCustomElementStyles(currentSiteIdentifier, customSelectors);
            });
        }
        return false;
    });

    // --- Perform one-time initial setup, protected by the flag ---
    if (window.hasRun) {
        console.log(`MindShield listener re-established for: ${currentSiteIdentifier}. Page already initialized.`);
        return;
    }
    window.hasRun = true;

    console.log(`MindShield running on: ${currentSiteIdentifier}. (Detected Platform: ${currentPlatform || 'None'})`);

    if (currentPlatform) {
        const platformStatusKey = `${currentPlatform}Status`;
        browser.storage.sync.get(platformStatusKey, function(platformResult) {
            let platformIsOn = platformResult[platformStatusKey] !== false;
            elementsThatCanBeHidden
                .filter(element => element.startsWith(currentPlatform))
                .forEach(function(item) {
                    const styleName = item + "Style";
                    const itemStatusKey = item + "Status";
                    if (!platformIsOn) {
                        createStyleElement(styleName, cssSelectors[item + "CssOn"]);
                    } else {
                        browser.storage.sync.get(itemStatusKey, function(itemResult) {
                            let statusValue = itemResult[itemStatusKey];
                            let cssToApply;
                            if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                                let state = statusValue || "On";
                                cssToApply = cssSelectors[item + "Css" + state];
                            } else {
                                cssToApply = (statusValue === true) ? cssSelectors[item + "CssOff"] : cssSelectors[item + "CssOn"];
                            }
                            createStyleElement(styleName, cssToApply);
                        });
                    }
                });
        });
    }

    if (currentSiteIdentifier) {
        console.log('Before custom storage get, window.hasRun:', window.hasRun);
        const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
        browser.storage.sync.get(customStorageKey, function(result) {
            if (chrome.runtime.lastError) {
                console.error(`Storage error for ${customStorageKey}:`, chrome.runtime.lastError);
                return;
            }
            console.log('Custom storage get succeeded for:', customStorageKey);
            let customSelectors = result[customStorageKey] || [];
            if (!Array.isArray(customSelectors)) customSelectors = [];
            applyCustomElementStyles(currentSiteIdentifier, customSelectors);
            if (customSelectors.length > 0) {
                 console.log(`Applied ${customSelectors.length} custom rules for ${currentSiteIdentifier}`);
            }
        });
    }

})();
