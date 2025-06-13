 (function() {
     if (window.hasRun) {
         return;
     }
     window.hasRun = true;

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
                    console.warn(`Shadow host '${shadowHostSelector}' for '${elementToHide}' not found or shadow root not accessible. Style NOT applied.`);
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
             try { if (document.querySelectorAll(idSelector).length === 1) return idSelector; } catch (e) {}
         }
         let path = []; let currentEl = el;
         while (currentEl && currentEl !== document.documentElement && currentEl !== document.body) {
             let selector = currentEl.nodeName.toLowerCase(); let parent = currentEl.parentElement;
             if (!parent) break;
             let index = 1; let sibling = currentEl.previousElementSibling;
             while (sibling) { if (sibling.nodeName.toLowerCase() === selector) index++; sibling = sibling.previousElementSibling; }
             if (index > 1) {
                  let ofTypeIndex = 1; let ofTypeSibling = currentEl.previousElementSibling;
                  while (ofTypeSibling) { if (ofTypeSibling.nodeName.toLowerCase() === selector) ofTypeIndex++; ofTypeSibling = ofTypeSibling.previousElementSibling; }
                  selector += (ofTypeIndex === index) ? `:nth-of-type(${index})` : `:nth-child(${index})`;
             } else {
                  let nextSibling = currentEl.nextElementSibling; let hasSimilarNext = false;
                  while (nextSibling) { if (nextSibling.nodeName.toLowerCase() === selector) { hasSimilarNext = true; break; } nextSibling = nextSibling.nextElementSibling; }
                  if (hasSimilarNext) selector += ':nth-of-type(1)';
             }
             path.unshift(selector); currentEl = parent;
         }
         if (path.length === 0) return null;
         const fullPath = path.join(' > ');
         try {
             const elements = document.querySelectorAll(fullPath);
             if (elements.length !== 1) {
                 const bodyPath = `body > ${fullPath}`;
                 if(document.querySelectorAll(bodyPath).length === 1) return bodyPath;
             } return fullPath;
         } catch (e) { console.error("Error validating generated selector:", fullPath, e); return null; }
     }

     let currentPlatform = null;
     const currentHostname = window.location.hostname;

     // Precisely identify the platform by checking the hostname against our new map.
     for (const platform in platformHostnames) {
         if (platformHostnames[platform].includes(currentHostname)) {
             currentPlatform = platform;
             break; // Found the platform, no need to check further.
         }
     }

     // The siteIdentifier is the platform name if matched, otherwise it's the full hostname.
     const currentSiteIdentifier = currentPlatform || currentHostname;

     console.log(`MindShield running on: ${currentSiteIdentifier}. (Detected Platform: ${currentPlatform || 'None'})`);

     if (currentPlatform) {
         const platformStatusKey = `${currentPlatform}Status`;
         browser.storage.sync.get(platformStatusKey, function(platformResult) {
             let platformIsOn = platformResult[platformStatusKey] !== false;
             elementsThatCanBeHidden
                 .filter(element => element.startsWith(currentPlatform))
                 .forEach(function(item) {
                     const styleName = item + "Style"; const itemStatusKey = item + "Status";
                     if (!platformIsOn) { createStyleElement(styleName, cssSelectors[item + "CssOn"]); }
                     else {
                         browser.storage.sync.get(itemStatusKey, function(itemResult) {
                             let statusValue = itemResult[itemStatusKey]; let cssToApply;
                             if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                                 let state = statusValue || "On"; cssToApply = cssSelectors[item + "Css" + state];
                             } else { cssToApply = (statusValue === true) ? cssSelectors[item + "CssOff"] : cssSelectors[item + "CssOn"]; }
                             createStyleElement(styleName, cssToApply);
                         });
                     }
                 });
         });
     }

     chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
         if (message.method === "ping") {
                 sendResponse({ status: "pong" });
                 return true;
             }
         
         if (message.element && currentPlatform && !message.element.startsWith(currentPlatform)) { return; }
         var styleName = message.element ? message.element + "Style" : null;
         let domRoot = document.head;
         if (message.element && message.element in shadowSelectors) {
             const shadowHost = document.querySelector(shadowSelectors[message.element]);
             if (shadowHost && shadowHost.shadowRoot) { domRoot = shadowHost.shadowRoot; }
             else { console.warn(`Cannot process message for ${message.element}: Shadow root not found.`); if (message.method === "check") sendResponse({ text: "unknown (shadow root)" }); return true; }
         }
         var currentStyleElement = styleName ? domRoot.querySelector("#" + styleName) : null;
         if (message.method === "check" && message.element) {
             if (!currentStyleElement) {
                 browser.storage.sync.get(message.element + "Status", function(result) {
                     let storedValue = result[message.element + "Status"];
                     if (message.element === "youtubeThumbnails" || message.element === "youtubeNotifications") { sendResponse({ text: (storedValue || "On").toLowerCase() }); }
                     else { sendResponse({ text: storedValue === true ? "hidden" : "visible" }); }
                 }); return true;
             }
             const currentCss = currentStyleElement.textContent; let responseText = "unknown";
             if (currentCss === cssSelectors[message.element + 'CssOn']) responseText = "visible";
             else if (currentCss === cssSelectors[message.element + 'CssOff']) responseText = "hidden";
             else if ((message.element === "youtubeThumbnails" || message.element === "youtubeNotifications")) {
                 if (currentCss === cssSelectors[message.element + 'CssBlur']) responseText = "blur";
                 else if (currentCss === cssSelectors[message.element + 'CssBlack']) responseText = (message.element === "youtubeNotifications" && cssSelectors.youtubeNotificationsCssBlack === cssSelectors.youtubeNotificationsCssOff) ? "hidden" : "black";
             }
             sendResponse({text: responseText}); return false;
         }
         if (message.method === "checkCustom" && message.selector) {
             const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
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
                 console.log(`Toggled visibility for ${message.selector} to ${message.visible ? 'visible' : 'hidden'}`);
             });
             return false;
         }
         if (message.method === "change" && message.element) {
             if (currentStyleElement) { const cssOn = cssSelectors[message.element + 'CssOn']; const cssOff = cssSelectors[message.element + 'CssOff']; currentStyleElement.textContent = (currentStyleElement.textContent === cssOn) ? cssOff : cssOn; }
             else { createStyleElement(styleName, cssSelectors[message.element + 'CssOff']); }
         } else if (message.method === "changeMultiToggle" && message.element && message.action) { const cssToApply = cssSelectors[message.element + 'Css' + message.action]; createStyleElement(styleName, cssToApply); }
         else if (message.method === "showAll" && message.element) { const cssOn = cssSelectors[message.element + 'CssOn']; createStyleElement(styleName, cssOn); }
         else if (message.method === "hideAll" && message.element) { const cssOff = cssSelectors[message.element + 'CssOff']; createStyleElement(styleName, cssOff); }
         else if (message.method === "startSelecting") { startSelecting(); }
         else if (message.method === "stopSelecting") {
             console.log('Received stopSelecting message, cancelled:', message.cancelled);
             stopSelecting(message.cancelled);
         } else if (message.method === "removeCustomElement" && message.selector && currentSiteIdentifier) {
             const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
             browser.storage.sync.get(customStorageKey, function(result) {
                 let customSelectors = result[customStorageKey] || []; if (!Array.isArray(customSelectors)) customSelectors = [];
                 customSelectors = customSelectors.filter(s => s !== message.selector);
                 browser.storage.sync.set({ [customStorageKey]: customSelectors }, function() {
                     if (chrome.runtime.lastError) console.error("Error removing custom selector from storage:", chrome.runtime.lastError);
                     else { applyCustomElementStyles(currentSiteIdentifier, customSelectors); console.log(`Removed selector and updated styles for ${currentSiteIdentifier}: ${message.selector}`); }
                 });
             });
         } else if (message.method === "refreshCustomElements" && currentSiteIdentifier) {
             const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
             browser.storage.sync.get(customStorageKey, function(result) {
                 let customSelectors = result[customStorageKey] || []; if (!Array.isArray(customSelectors)) customSelectors = [];
                 applyCustomElementStyles(currentSiteIdentifier, customSelectors); console.log(`Refreshed custom styles for ${currentSiteIdentifier}`);
             });
         }
         return false;
     });

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
             highlightOverlay.style.position = 'absolute'; highlightOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
             highlightOverlay.style.border = '1px dashed red'; highlightOverlay.style.zIndex = '2147483646';
             highlightOverlay.style.pointerEvents = 'none'; highlightOverlay.style.margin = '0';
             highlightOverlay.style.padding = '0'; highlightOverlay.style.boxSizing = 'border-box';
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
         doneButton.addEventListener('click', () => {
             if (feedbackContainer) {
                 feedbackContainer.remove();
                 feedbackContainer = null;
             }
             stopSelecting(false);
         });
         doneButton.addEventListener('touchend', (e) => {
             e.preventDefault();
             e.stopPropagation();
             if (feedbackContainer) {
                 feedbackContainer.remove();
                 feedbackContainer = null;
             }
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
                     console.log(`Undid hiding selector for ${currentSiteIdentifier}: ${selectorToRemove}`);
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
         console.log("Starting element selection mode (click/tap).");
         createHighlightOverlay();
         createSelectorDisplay();
         createFeedbackContainer();
         document.addEventListener('mousemove', highlightElement, { capture: true });
         document.addEventListener('touchstart', highlightElement, { capture: true, passive: true });
         document.addEventListener('click', selectElementOnClick, { capture: true });
         document.addEventListener('touchend', selectElementOnTap, { capture: true });
         document.addEventListener('keydown', handleKeydown, { capture: true });
         document.body.classList.add('mindshield-selecting');
     }

     function stopSelecting(cancelled = false) {
         if (!isSelecting) {
             console.log("stopSelecting called but not selecting, skipping");
             return;
         }
         console.log("Stopping selection mode, cancelled:", cancelled);
         isSelecting = false;

         // Remove event listeners
         document.removeEventListener('mousemove', highlightElement, { capture: true });
         document.removeEventListener('touchstart', highlightElement, { capture: true });
         document.removeEventListener('click', selectElementOnClick, { capture: true });
         document.removeEventListener('touchend', selectElementOnTap, { capture: true });
         document.removeEventListener('keydown', handleKeydown, { capture: true });

         // Clean up feedback container
         if (feedbackContainer) {
             console.log("Removing feedback container");
             if (feedbackContainer._dragListeners) {
                 feedbackContainer.removeEventListener('mousedown', feedbackContainer._dragListeners.mousedown);
                 feedbackContainer.removeEventListener('touchstart', feedbackContainer._dragListeners.touchstart, { passive: false });
                 document.removeEventListener('mousemove', feedbackContainer._dragListeners.mousemove);
                 document.removeEventListener('mouseup', feedbackContainer._dragListeners.mouseup);
                 document.removeEventListener('touchmove', feedbackContainer._dragListeners.touchmove, { passive: false });
                 document.removeEventListener('touchend', feedbackContainer._dragListeners.touchend);
                 delete feedbackContainer._dragListeners;
             }
             try {
                 if (document.body.contains(feedbackContainer)) {
                     feedbackContainer.remove();
                     console.log("feedbackContainer removed successfully");
                 }
                 feedbackContainer = null;
             } catch (e) {
                 console.error("Error removing feedbackContainer:", e);
             }
         }

         // Clean up highlight overlay
         if (highlightOverlay) {
             console.log("Removing highlight overlay");
             try {
                 highlightOverlay.remove();
             } catch (e) {
                 console.error("Error removing highlightOverlay:", e);
             }
             highlightOverlay = null;
         }

         // Clean up selector display
         if (selectorDisplay) {
             console.log("Removing selector display");
             try {
                 selectorDisplay.remove();
             } catch (e) {
                 console.error("Error removing selectorDisplay:", e);
             }
             selectorDisplay = null;
         }

         // Clean up temporary style
         const tempStyle = document.getElementById(highlightStyleId);
         if (tempStyle) {
             console.log("Removing temp style");
             try {
                 tempStyle.remove();
             } catch (e) {
                 console.error("Error removing tempStyle:", e);
             }
         }

         currentHighlightedElement = null;
         sessionHiddenSelectors = [];
         document.body.classList.remove('mindshield-selecting');

         if (cancelled) {
             console.log("Sending selectionCanceled message");
             browser.runtime.sendMessage({ method: "selectionCanceled" }).catch(e => console.debug("Popup likely closed:", e));
         }
         console.log("stopSelecting completed");
     }

     // This function checks for the 'Escape' key press
     function handleKeydown(event) {
       if (event.key === 'Escape' && isSelecting) {
         event.preventDefault();
         event.stopImmediatePropagation();
         // stop locally, cancelling the current selection session
         stopSelecting(true);
       }
     }

     function highlightElement(event) {
         if (!isSelecting) return;
         const el = event.target;
         if (!el || el === highlightOverlay || el === selectorDisplay || el === feedbackContainer || el.closest('#mindshield-feedback-container')) {
             if (highlightOverlay) highlightOverlay.style.display = 'none';
             if (selectorDisplay) selectorDisplay.style.display = 'none';
             currentHighlightedElement = null; return;
         }
         currentHighlightedElement = el;
         const selector = generateCSSSelector(el);
         let posX, posY;
         if (event.touches && event.touches.length > 0) { posX = event.touches[0].clientX; posY = event.touches[0].clientY; }
         else if (event.clientX !== undefined) { posX = event.clientX; posY = event.clientY; }
         else { if (selectorDisplay) selectorDisplay.style.display = 'none'; if (highlightOverlay) highlightOverlay.style.display = 'none'; return; }
         if (selectorDisplay) {
             selectorDisplay.textContent = selector || "Cannot select this element";
             const displayPosX = posX + 15; const displayPosY = posY + 15;
             selectorDisplay.style.left = `${Math.min(displayPosX, window.innerWidth - selectorDisplay.offsetWidth - 10)}px`;
             selectorDisplay.style.top = `${Math.min(displayPosY, window.innerHeight - selectorDisplay.offsetHeight - 10)}px`;
             selectorDisplay.style.display = 'block';
         }
         if (highlightOverlay) {
             const rect = el.getBoundingClientRect();
             highlightOverlay.style.top = `${rect.top + window.scrollY}px`; highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
             highlightOverlay.style.width = `${rect.width}px`; highlightOverlay.style.height = `${rect.height}px`;
             highlightOverlay.style.display = 'block';
         }
     }

     function selectElementOnClick(event) {
         if (Date.now() - lastTapTime < 500) { event.preventDefault(); event.stopPropagation(); console.log("Ghost click prevented."); return; }
         if (!isSelecting) return;

         if (event.target === feedbackContainer || event.target.closest('#mindshield-feedback-container') || event.target.tagName === 'BUTTON') {
             console.log("Click on feedback container or button ignored.");
             return;
         }

         if (event.target !== currentHighlightedElement) {
             console.log("Click target is not the highlighted element. Ignoring click for selection.", event.target, currentHighlightedElement);
             return;
         }

         console.log("Click detected on highlighted element:", currentHighlightedElement);
         event.preventDefault();
         event.stopPropagation();

         const elToSelect = currentHighlightedElement;
         if (!elToSelect || elToSelect === document.body || elToSelect === document.documentElement) {
             console.log("Selection ignored (invalid target after check).");
             return;
         }
         processSelectedElement(elToSelect);
     }

     function selectElementOnTap(event) {
         if (!isSelecting) return;

         lastTapTime = Date.now();

         if (event.target === feedbackContainer || event.target.closest('#mindshield-feedback-container') || event.target.tagName === 'BUTTON') {
             console.log("Tap on feedback container or button ignored.");
             return;
         }

         const elToSelect = currentHighlightedElement;

         if (!elToSelect) {
             console.log("Tap selection ignored (no highlighted element at time of tap).");
             return;
         }

         console.log("Tap detected on highlighted element:", elToSelect);
         event.preventDefault();
         event.stopPropagation();

         if (elToSelect === document.body || elToSelect === document.documentElement) {
             console.log("Tap selection ignored (invalid target).");
             return;
         }
         processSelectedElement(elToSelect);
     }

     function processSelectedElement(el) {
         const selector = generateCSSSelector(el);
         if (!selector) {
             console.warn("Could not generate a reliable selector for the element.", el);
             browser.runtime.sendMessage({ method: "selectionFailed", reason: "Could not generate selector" }).catch(e => console.debug("Popup likely closed:", e));
             return;
         }
         console.log("Selected element:", el, "Generated selector:", selector);
         if (!currentSiteIdentifier) {
             console.error("Cannot save selected element: currentSiteIdentifier is not set.");
             browser.runtime.sendMessage({ method: "selectionFailed", reason: "Site identifier missing" }).catch(e => console.debug("Popup likely closed:", e));
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
                         browser.runtime.sendMessage({ method: "selectionFailed", reason: "Storage error" }).catch(e => console.debug("Popup likely closed:", e));
                     } else {
                         applyCustomElementStyles(currentSiteIdentifier, customSelectors);
                         browser.runtime.sendMessage({ method: "elementSelected", selector: selector }).catch(e => console.debug("Popup likely closed:", e));
                         console.log(`Selector added and styles updated for ${currentSiteIdentifier}: ${selector}`);
                         updateFeedbackMessage('Element hidden', true);
                     }
                 });
             } else {
                 console.log("Selector already hidden:", selector);
                 browser.runtime.sendMessage({ method: "selectionCanceled", reason: "Already hidden" }).catch(e => console.debug("Popup likely closed:", e));
                 updateFeedbackMessage('Element already hidden');
             }
         });
     }

     function applyCustomElementStyles(siteIdentifier, selectors) {
         const styleId = `customHidden_${siteIdentifier.replace(/\./g, '_')}Style`;
         const css = selectors.length > 0 ? selectors.map(s => `${s} { display: none !important; }`).join('\n') : '';
         createStyleElement(styleId, css);
     }
     
     if (currentSiteIdentifier) {
         console.log('Before custom storage get, window.hasRun:', window.hasRun);
         const customStorageKey = `${currentSiteIdentifier}CustomHiddenElements`;
         const customStyleId = `customHidden_${currentSiteIdentifier.replace(/\./g, '_')}Style`;
         browser.storage.sync.get(customStorageKey, function(result) {
             if (chrome.runtime.lastError) {
                 console.error(`Storage error for ${customStorageKey}:`, chrome.runtime.lastError);
                 createStyleElement(customStyleId, '');
                 return;
             }
             console.log('Custom storage get succeeded for:', customStorageKey);
             let customSelectors = result[customStorageKey] || [];
             if (!Array.isArray(customSelectors)) customSelectors = [];
             if (customSelectors.length > 0) {
                 const css = customSelectors.map(selector => `${selector} { display: none !important; }`).join('\n');
                 createStyleElement(customStyleId, css);
                 console.log(`Applied ${customSelectors.length} custom rules for ${currentSiteIdentifier}`);
             } else {
                 createStyleElement(customStyleId, '');
             }
         });
     }

 })();
