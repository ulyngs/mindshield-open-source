 (function() {
     /**
      * Check and set a global guard variable.
      * If this content script is injected into the same page again,
      * it will do nothing next time.
      */
     if (window.hasRun) {
         return;
     }
     window.hasRun = true;

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

     // YouTube CSS
     const youtubeSearchCssOn = '';
     const youtubeSearchCssOff = '#center > yt-searchbox.ytSearchboxComponentHost.ytSearchboxComponentDesktop.ytd-masthead, ytd-searchbox { display: none; } button[aria-label="Search YouTube"] {display: none;}';
     const youtubeSearchPredictCssOn = '';
     const youtubeSearchPredictCssOff = 'div.gstl_50 { display: none !important; }';
     const youtubeRecVidsCssOn = 'ytd-browse[page-subtype="home"] { visibility: visible !important; } div[tab-identifier="FEwhat_to_watch"] { visibility: visible !important; }';
     const youtubeRecVidsCssOff = 'ytd-browse[page-subtype="home"] { display: none; } div[tab-identifier="FEwhat_to_watch"] { visibility: hidden; }';
     const youtubeThumbnailsCssOn = 'ytd-compact-video-renderer { padding: 0px 10px 10px 10px; } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { display: block; }';
     const youtubeThumbnailsCssOff = 'ytd-thumbnail, ytd-playlist-thumbnail, yt-collection-thumbnail-view-model, a.yt-lockup-view-model-wiz__content-image { display: none !important; } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { display: none !important; } .reel-shelf-items ytm-reel-item-renderer, .reel-shelf-items .reel-item-endpoint, .video-thumbnail-container-vertical { height: 100px !important; }';
     const youtubeThumbnailsCssBlur = 'ytd-thumbnail img, ytd-playlist-thumbnail img { filter: blur(7px); } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { filter: blur(7px); }';
     const youtubeThumbnailsCssBlack = 'ytd-thumbnail img, ytd-playlist-thumbnail img { filter: brightness(0); } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { filter: brightness(0); }';
     const youtubeNotificationsCssOn = '';
     const youtubeNotificationsCssOff = 'ytd-notification-topbar-button-renderer.ytd-masthead { display: none !important; }';
     const youtubeNotificationsCssBlur = 'ytd-notification-topbar-button-renderer.ytd-masthead .yt-spec-icon-badge-shape__badge { display: none; }';
     const youtubeProfileImgCssOn = '';
     const youtubeProfileImgCssOff = '#avatar-link, #avatar-container, #avatar {display: none; visibility: hidden;} .channel-thumbnail-icon, #channel-thumbnail, #avatar-section, #author-thumbnail, ytm-comments-entry-point-teaser-renderer img.ytm-comments-entry-point-teaser-avatar, ytm-profile-icon.slim-owner-profile-icon, ytm-profile-icon.comment-icon {display: none;}  #creator-thumbnail, #expander.ytd-comment-replies-renderer .dot.ytd-comment-replies-renderer, ytm-channel-thumbnail-with-link-renderer {display: none !important;}';
     const youtubeShortsCssOn = '';
     const youtubeShortsCssOff = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer[aria-label="Shorts"], ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts], ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model) { display: none; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(2), ytm-reel-shelf-renderer, ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]), ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="SHORTS"]) { display: none !important; }';
     const youtubeSubscriptionsCssOn = 'a[href="/feed/subscriptions/] { display: flex; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: flex; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty]))';
     const youtubeSubscriptionsCssOff = 'a[href="/feed/subscriptions"] { display: none !important; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: none; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty])) { display: none; }';
     const youtubeHistoryCssOn = '#endpoint[href="/feed/history"] { display: flex; }';
     const youtubeHistoryCssOff = '#endpoint[href="/feed/history"] { display: none !important; }';
     const youtubeExploreCssOn = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: block; }';
     const youtubeExploreCssOff = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: none; }';
     const youtubeMoreCssOn = '#sections ytd-guide-section-renderer:has(a[href="https://studio.youtube.com/"]) { display: block; }';
     const youtubeMoreCssOff = '#sections ytd-guide-section-renderer:has(a[href="https://studio.youtube.com/"]) { display: none; }';
     const youtubeRelatedCssOn = '#related { visibility: visible; display: block; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: block; }';
     const youtubeRelatedCssOff = '#related { visibility: hidden; display: none; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: none; } ytm-single-column-watch-next-results-renderer .related-chips-slot-wrapper { transform: none !important; }';
     const youtubeSidebarCssOn = '';
     const youtubeSidebarCssOff = '#secondary { display: none; } video.html5-main-video { width: 100% !important; height: auto !important; }';
     const youtubeCommentsCssOn = '#comments { visibility: visible; } #app ytm-comments-entry-point-header-renderer { display: block; }';
     const youtubeCommentsCssOff = '#comments { visibility: hidden; } #app ytm-comments-entry-point-header-renderer { display: none; }';
     const youtubeAdsCssOn = '';
     const youtubeAdsCssOff = 'ytm-promoted-sparkles-text-search-renderer, ytd-promoted-sparkles-text-search-renderer, ytd-promoted-sparkles-web-renderer, ytd-carousel-ad-renderer, ytd-ad-slot-renderer, #masthead-ad, ytd-ad-slot-renderer { display: none !important; }  /* video page */ ytm-promoted-sparkles-web-renderer, ytm-companion-ad-renderer, #player-ads {display: none !important; }';
     const youtubeViewsCssOn = '';
     const youtubeViewsCssOff = '/* watch page */ #metadata-line.ytd-video-meta-block > .ytd-video-meta-block:first-of-type {display: none !important; } #metadata-line.ytd-video-meta-block>.ytd-video-meta-block:not(:first-of-type):before, #metadata-line.ytd-grid-video-renderer>.ytd-grid-video-renderer:not(:first-of-type):before { content: ""; margin: 0px; } /* video page */ #info-container > .ytd-watch-metadata > .yt-formatted-string:nth-of-type(1), #info-container > .ytd-watch-metadata > .yt-formatted-string:nth-of-type(2) { display: none; } /* channel page */ ytd-two-column-browse-results-renderer #metadata-line span.ytd-grid-video-renderer:first-of-type { display: none !important; } /* m.youtube.com */ ytm-badge-and-byline-renderer .ytm-badge-and-byline-item-byline:not(:first-of-type):not(:last-of-type), ytm-badge-and-byline-renderer .ytm-badge-and-byline-separator:not(:first-of-type) { display: none; } .slim-video-metadata-header .secondary-text .yt-core-attributed-string {display: none;}';
     const youtubeLikesCssOn = '';
     const youtubeLikesCssOff = 'ytd-watch-metadata #top-level-buttons-computed like-button-view-model .yt-spec-button-shape-next__button-text-content { display: none; } /* m.youtube.com */ ytm-slim-video-metadata-section-renderer like-button-view-model .yt-spec-button-shape-next__button-text-content { display: none; }';
     const youtubeSubscribersCssOn = '';
     const youtubeSubscribersCssOff = '#owner-sub-count, #subscriber-count { display: none !important; } /* m.youtube.com */ .slim-owner-icon-and-title .subhead .yt-core-attributed-string { display: none; }';

     // Facebook CSS
     const facebookFeedCssOn = '#ssrb_feed_start + div, div.x1hc1fzr.x1unhpq9.x6o7n8i { visibility: visible !important; } #screen-root div > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: block !important; }';
     const facebookFeedCssOff = '#ssrb_feed_start + div, div.x1hc1fzr.x1unhpq9.x6o7n8i { visibility: hidden; } #screen-root div:not([data-adjust-on-keyboard-shown="true"]) > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+7) { display: none; }';
     const facebookWatchCssOn = '';
     const facebookWatchCssOff = 'a[href$="/watch/"], a[aria-label="Video"] { display: none; } /* mobile */ div[role="button"]:has(div[data-hidden-ref-key="videos.jewel.hidden"]) {display: none;} div.m.displayed:has(div[data-hidden-ref-key="videos.jewel.hidden"]) {background-color: white !important;} ';
     const facebookNotificationsCssOn = '';
     const facebookNotificationsCssOff = 'div[aria-hidden="true"][aria-label*="Notifications"], #screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(5) div[data-mcomponent="MContainer"]:nth-child(3) {visibility: hidden;}';
     const facebookChatCssOn = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6:not([role="cell"]) { visibility: visible !important; }';
     const facebookChatCssOff = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6:not([role="cell"]) { visibility: hidden; }';
     const facebookStoriesCssOn = '';
     const facebookStoriesCssOff = 'div[aria-label="Stories"] { display: none; } #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: none;}';
     const facebookSponsoredCssOn = '';
     const facebookSponsoredCssOff = 'a[aria-label="Advertiser"] { display: none; }';

     // X CSS
     const xExploreCssOn = 'nav[role="navigation"] a[href="/explore"] { display: flex; }';
     const xExploreCssOff = 'nav[role="navigation"] a[href="/explore"] { display: none; }';
     const xNotificationsCssOn = 'nav[role="navigation"] a[href="/notifications"] { display: flex; }';
     const xNotificationsCssOff = 'nav[role="navigation"] a[href="/notifications"] { display: none; }';
     const xTrendsCssOn = 'div[data-testid="sidebarColumn"] section[role="region"] {display: flex;}';
     const xTrendsCssOff = 'div[data-testid="sidebarColumn"] section[role="region"] {display: none; }';
     const xFollowCssOn = 'div[data-testid="sidebarColumn"] div.css-175oi2r.r-1bro5k0:has(aside[role="complementary"]) { display: flex;}';
     const xFollowCssOff = 'div[data-testid="sidebarColumn"] div.css-175oi2r.r-1bro5k0:has(aside[role="complementary"]) { display: none;}';
     const xTimelineCssOn = 'div[data-testid="primaryColumn"] section[role="region"] {visibility: visible; }';
     const xTimelineCssOff = 'div[data-testid="primaryColumn"] section[role="region"] {visibility: hidden; }';

     // Instagram CSS
     const instagramFeedCssOn = '';
     const instagramFeedCssOff = 'main[role="main"] div.xw7yly9 > div.x168nmei, /* mobile */ section._aalv._aal_ div._aam1 > div.x9f619, /* mobile 8 Apr 2024 */ main[role="main"] div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1:has(article) {display: none !important;}';
     const instagramStoriesCssOn = '';
     const instagramStoriesCssOff = 'main div.xmnaoh6, /* mobile */ section._aalv._aal_ div._aam1 > div._aac4, /* mobile 8 Apr 2024 */  main[role="main"] div.x1ixjvfu.x1q0q8m5.xso031l {display: none !important;}';
     const instagramMutedStoriesCssOn = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: flex; }';
     const instagramMutedStoriesCssOff = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: none; }';
     const instagramExploreCssOn = '';
     const instagramExploreCssOff = 'a[href="/explore/"] { display: none; }';
     const instagramReelsCssOn = '';
     const instagramReelsCssOff = 'a[href="/reels/"] { display: none; }';
     const instagramSuggestionsCssOn = '';
     const instagramSuggestionsCssOff = 'div.x78zum5.xdt5ytf.xdj266r.x11i5rnm.xod5an3.x169t7cy.x1j7kr1c.xvbhtw8:has(a[href="/explore/people/"]) { display: none; }';
     const instagramCommentsCssOn = '';
     const instagramCommentsCssOff = 'div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1xmf6yo:has(a[href*="/comments/"]) {display: none !important;}';

     // LinkedIn CSS
     const linkedinFeedCssOn = '';
     const linkedinFeedCssOff = 'div.scaffold-finite-scroll.scaffold-finite-scroll--infinite, #feed-container {display: none !important;}';
     const linkedinNotificationsCssOn = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: block !important; }';
     const linkedinNotificationsCssOff = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: none !important; }';
     const linkedinNewsCssOn = '#feed-news-module, .feed-follows-module { display: block; }';
     const linkedinNewsCssOff = '#feed-news-module, .feed-follows-module { display: none; }';
     const linkedinAdsCssOn = 'section.ad-banner-container { display: block !important;}';
     const linkedinAdsCssOff = 'section.ad-banner-container { display: none;}';

     // WhatsApp CSS
     const whatsappPreviewCssOn = '';
     const whatsappPreviewCssOff = 'div[data-testid="cell-frame-secondary"] { display: none; }';
     const whatsappNotificationPromptCssOn = '';
     const whatsappNotificationPromptCssOff = 'span[data-testid="chat-butterbar"] { display: none; }';

     // Google Search CSS
     const googleAdsCssOn = '#tads, #atvcap, .commercial-unit-desktop-rhs {display: block !important;}';
     const googleAdsCssOff = '#tads, #atvcap, .commercial-unit-desktop-rhs {display: none;}';
     const googleBackgroundCssOff = '#tads, #atvcap .ptJHdc.yY236b.c3mZkd, #tads .CnP9N.U3A9Ac.irmCpc,.commercial-unit-mobile-top,.commercial-unit-mobile-top .v7hl4d,.commercial-unit-mobile-bottom .v7hl4d {background-color: #F2E6C3 !important;}';
     const googleBackgroundCssOn = '';

     // Reddit CSS
     const redditFeedCssOn = '';
     const redditFeedCssOff = 'shreddit-feed { display: none; }';
     const redditPopularCssOn = '';
     const redditPopularCssOff = 'a[href="/r/popular/"] { display: none; }';
     const redditAllCssOn = '';
     const redditAllCssOff = 'a[href="/r/all/"] { display: none; }';
     const redditRecentCssOn = '';
     const redditRecentCssOff = 'reddit-recent-pages { display: none; }';
     const redditCommunitiesCssOn = '';
     const redditCommunitiesCssOff = '[aria-controls="communities_section"] + faceplate-auto-height-animator { display: none; }   [aria-controls="communities_section"] { display: none; }';
     const redditNotificationCssOn = '';
     const redditNotificationCssOff = '#mini-inbox-tooltip { display: none; }';
     const redditChatCssOn = '';
     const redditChatCssOff = 'reddit-chat-header-button { display: none; }';
     const redditTrendingCssOn = '';
     const redditTrendingCssOff = '[search-telemetry-source="popular_carousel"] { display: none; }';
     const redditPopularCommunitiesCssOn = '';
     const redditPopularCommunitiesCssOff = '#popular-communities-list { display: none; }  [aria-label="Popular Communities"] { display: none; }';

     // Shadow DOM selectors
     const shadowSelectors = {
         "redditPopular": "left-nav-top-section",
         "redditAll": "left-nav-top-section",
     };

     // Function to create style element
     function createStyleElement(some_style_id, some_css) {
         const elementToHide = some_style_id.replace("Style", "");
         const dom = (elementToHide in shadowSelectors) ? document.querySelector(shadowSelectors[elementToHide]).shadowRoot : document.head;
         if (!dom.querySelector("#" + some_style_id)) {
             var styleElement = document.createElement("style");
             styleElement.id = some_style_id;
             dom.appendChild(styleElement).innerHTML = some_css;
         } else {
             dom.querySelector("#" + some_style_id).innerHTML = some_css;
         }
     }

     // Function to generate a unique CSS selector for an element
     function generateCSSSelector(el) {
         if (!el || el === document.documentElement) return '';
         let path = [];
         while (el && el.nodeType === Node.ELEMENT_NODE) {
             let selector = el.nodeName.toLowerCase();
             if (el.id) {
                 selector = `#${el.id}`;
                 path.unshift(selector);
                 break;
             } else {
                 let sib = el, nth = 1;
                 while (sib.previousElementSibling) {
                     sib = sib.previousElementSibling;
                     if (sib.nodeName.toLowerCase() === selector) nth++;
                 }
                 if (nth > 1) selector += `:nth-child(${nth})`;
                 if (el.className) {
                     let classes = el.className.trim().split(/\s+/).join('.');
                     if (classes) selector += `.${classes}`;
                 }
                 path.unshift(selector);
             }
             el = el.parentElement;
         }
         return path.join(' > ');
     }

     // Apply custom hidden elements on page load
     platformsWeTarget.forEach(function(platform) {
         if (window.location.hostname.includes(platform)) {
             const storageKey = `${platform}CustomHiddenElements`;
             browser.storage.sync.get(storageKey, function(result) {
                 let customSelectors = result[storageKey] || [];
                 if (customSelectors.length > 0) {
                     const css = customSelectors.map(selector => `${selector} { display: none !important; }`).join('\n');
                     createStyleElement(`customHidden${platform}Style`, css);
                 }
             });
         }
     });

     // Handle existing hardcoded elements
     platformsWeTarget.forEach(function(platform) {
         if (window.location.hostname.includes(platform)) {
             var filteredElements = elementsThatCanBeHidden.filter(element =>
                 element.includes(platform)
             );
             var key = platform + "Status";

             browser.storage.sync.get(key, function(result) {
                 let platformIsOn = result[key] !== false;

                 filteredElements.forEach(function(item) {
                     var styleName = item + "Style";
                     var key = item + "Status";

                     if (!platformIsOn) {
                         createStyleElement(styleName, eval(item + "CssOn"));
                     } else if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                         browser.storage.sync.get(key, function(result) {
                             if (result[key] == undefined || result[key] === false) {
                                 createStyleElement(styleName, eval(item + "CssOn"));
                             } else {
                                 createStyleElement(styleName, eval(item + "Css" + result[key]));
                             }
                         });
                     } else {
                         browser.storage.sync.get(key, function(result) {
                             if (result[key] == true) {
                                 createStyleElement(styleName, eval(item + "CssOff"));
                             } else {
                                 createStyleElement(styleName, eval(item + "CssOn"));
                             }
                         });
                     }
                 });
             });
         }
     });

     // Handle popup queries for element status
     chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
         if (message.method === "check") {
             var currentStyle = document.getElementById(message.element + "Style");

             if (message.element == "youtubeThumbnails" || message.element == "youtubeNotifications") {
                 if (currentStyle.innerHTML === eval(message.element + 'CssBlur')) {
                     sendResponse({text: "blur"});
                 } else if (currentStyle.innerHTML === eval(message.element + 'CssBlack')) {
                     sendResponse({text: "black"});
                 }
             }

             if (currentStyle == undefined) {
                 sendResponse({text: "style element is undefined"});
             } else if (currentStyle.innerHTML === eval(message.element + 'CssOn')) {
                 sendResponse({text: "visible"});
             } else if (currentStyle.innerHTML === eval(message.element + 'CssOff')) {
                 sendResponse({text: "hidden"});
             }
         }
     });

     // Handle toggle messages
     browser.runtime.onMessage.addListener((message) => {
         const dom = (message.element in shadowSelectors) ? document.querySelector(shadowSelectors[message.element]).shadowRoot : document.head;
         var currentStyle = dom.querySelector("#" + message.element + "Style");

         if (message.method === "change") {
             if (currentStyle == undefined) {
                 console.log("not on active tab");
             } else if (currentStyle.innerHTML === eval(message.element + 'CssOn')) {
                 currentStyle.innerHTML = eval(message.element + 'CssOff');
             } else {
                 currentStyle.innerHTML = eval(message.element + 'CssOn');
             }
         } else if (message.method === "hideAll") {
             currentStyle.innerHTML = eval(message.element + 'CssOff');
         } else if (message.method === "showAll") {
             if (window.location.hostname.includes("google")) {
                 currentStyle.innerHTML = googleAdsCssSwitchOff;
             } else {
                 currentStyle.innerHTML = eval(message.element + 'CssOn');
             }
         } else if (message.method === "changeMultiToggle") {
             if (currentStyle == undefined) {
                 console.log("not on active tab");
             } else {
                 currentStyle.innerHTML = eval(message.element + 'Css' + message.action);
             }
         }
     });

     // New message handlers for element selection
     let isSelecting = false;
     let highlightStyle = null;
     let selectorDisplay = null;
     let currentHighlightedElement = null;

     function startSelecting() {
         if (isSelecting) return;
         isSelecting = true;

         // Create highlight style
         highlightStyle = document.createElement('style');
         highlightStyle.id = 'elementHighlightStyle';
         document.head.appendChild(highlightStyle);

         // Create selector display
         selectorDisplay = document.createElement('div');
         selectorDisplay.style.position = 'fixed';
         selectorDisplay.style.background = 'rgba(0, 0, 0, 0.8)';
         selectorDisplay.style.color = 'white';
         selectorDisplay.style.padding = '5px 10px';
         selectorDisplay.style.borderRadius = '3px';
         selectorDisplay.style.zIndex = '10000';
         selectorDisplay.style.fontSize = '12px';
         selectorDisplay.style.pointerEvents = 'none';
         document.body.appendChild(selectorDisplay);

         document.addEventListener('mousemove', highlightElement);
         document.addEventListener('click', selectElement, true);
     }

     function stopSelecting() {
         if (!isSelecting) return;
         isSelecting = false;

         document.removeEventListener('mousemove', highlightElement);
         document.removeEventListener('click', selectElement, true);

         if (highlightStyle) {
             highlightStyle.remove();
             highlightStyle = null;
         }
         if (selectorDisplay) {
             selectorDisplay.remove();
             selectorDisplay = null;
         }
         currentHighlightedElement = null;
     }

     function highlightElement(event) {
         event.preventDefault();
         event.stopPropagation();

         const el = event.target;
         if (el === selectorDisplay || el === document.body || el === document.documentElement) return;

         const selector = generateCSSSelector(el);
         if (!selector) return;

         // Apply a transparent overlay
         highlightStyle.innerHTML = `${selector} { background-color: rgba(255, 0, 0, 0.3) !important; }`;

         selectorDisplay.innerText = selector;

         const rect = el.getBoundingClientRect();
         selectorDisplay.style.top = `${rect.top + window.scrollY - selectorDisplay.offsetHeight - 5}px`;
         selectorDisplay.style.left = `${rect.left + window.scrollX}px`;

         currentHighlightedElement = el; // Store the highlighted element
     }

     function selectElement(event) {
         event.preventDefault();
         event.stopPropagation();

         const el = event.target;
         if (el === selectorDisplay || el === document.body || el === document.documentElement) return;

         const selector = generateCSSSelector(el);
         if (!selector) return;

         // Hide the element
         const platform = platformsWeTarget.find(p => window.location.hostname.includes(p));
         if (platform) {
             const storageKey = `${platform}CustomHiddenElements`;
             browser.storage.sync.get(storageKey, function(result) {
                 let customSelectors = result[storageKey] || [];
                 if (!customSelectors.includes(selector)) {
                     customSelectors.push(selector);
                     browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                         const css = customSelectors.map(s => `${s} { display: none !important; }`).join('\n');
                         createStyleElement(`customHidden${platform}Style`, css);
                         browser.runtime.sendMessage({
                             method: "elementSelected",
                             selector: selector
                         });
                     });
                 }
             });
         }

         stopSelecting();
     }

     browser.runtime.onMessage.addListener((message) => {
         if (message.method === "startSelecting") {
             startSelecting();
         } else if (message.method === "stopSelecting") {
             stopSelecting();
         } else if (message.method === "selectHighlightedElement") {
             if (currentHighlightedElement && isSelecting) {
                 const selector = generateCSSSelector(currentHighlightedElement);
                 if (selector) {
                     const platform = platformsWeTarget.find(p => window.location.hostname.includes(p));
                     if (platform) {
                         const storageKey = `${platform}CustomHiddenElements`;
                         browser.storage.sync.get(storageKey, function(result) {
                             let customSelectors = result[storageKey] || [];
                             if (!customSelectors.includes(selector)) {
                                 customSelectors.push(selector);
                                 browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                                     const css = customSelectors.map(s => `${s} { display: none !important; }`).join('\n');
                                     createStyleElement(`customHidden${platform}Style`, css);
                                     browser.runtime.sendMessage({
                                         method: "elementSelected",
                                         selector: selector
                                     });
                                 });
                             }
                         });
                     }
                     stopSelecting();
                 }
             }
         } else if (message.method === "removeCustomElement") {
             const platform = platformsWeTarget.find(p => window.location.hostname.includes(p));
             if (platform) {
                 const storageKey = `${platform}CustomHiddenElements`;
                 browser.storage.sync.get(storageKey, function(result) {
                     let customSelectors = result[storageKey] || [];
                     customSelectors = customSelectors.filter(s => s !== message.selector);
                     browser.storage.sync.set({ [storageKey]: customSelectors }, function() {
                         const css = customSelectors.map(s => `${s} { display: none !important; }`).join('\n');
                         createStyleElement(`customHidden${platform}Style`, css);
                     });
                 });
             }
         }
     });
 })();
