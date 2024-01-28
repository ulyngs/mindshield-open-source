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
    
    const platformsWeTarget = [ "youtube", "facebook", "twitter", "instagram", "linkedin", "whatsapp", "google" ];
    const elementsThatCanBeHidden = [ "youtubeSearch", "youtubeSearchPredict", "youtubeRecVids", "youtubeThumbnails", "youtubeNotifications", "youtubeProfileImg",
                                      "youtubeShorts", "youtubeSubscriptions", "youtubeLibrary", "youtubeHistory", "youtubeExplore", "youtubeMore",
                                      "youtubeRelated", "youtubeSidebar", "youtubeComments", "youtubeAds", "youtubeViews", "youtubeLikes", "youtubeSubscribers",
                                      "twitterExplore", "twitterNotifications", "twitterTrends", "twitterFollow", "twitterTimeline",
                                      "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat",
                                      "linkedinNews", "linkedinNotifications", "linkedinFeed", "linkedinAds",
                                      "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramReels", "instagramSuggestions", "instagramComments",
                                      "whatsappPreview","whatsappNotificationPrompt",
                                      "googleAds", "googleBackground" ];
    
    // YouTube CSS
    const youtubeSearchCssOn = '';
    const youtubeSearchCssOff = 'ytd-searchbox { display: none; } button[aria-label="Search YouTube"] {display: none;}';
    
    const youtubeSearchPredictCssOn = '';
    const youtubeSearchPredictCssOff = 'div.gstl_50 { display: none !important; }';
   
    const youtubeRecVidsCssOn = 'ytd-browse[page-subtype="home"] { visibility: visible !important; } div[tab-identifier="FEwhat_to_watch"] { visibility: visible !important; }';
    const youtubeRecVidsCssOff = 'ytd-browse[page-subtype="home"] { display: none; } div[tab-identifier="FEwhat_to_watch"] { visibility: hidden; }';
    
    const youtubeThumbnailsCssOn = 'ytd-thumbnail, ytd-playlist-thumbnail {display: block; } ytd-compact-video-renderer { padding: 0px 10px 10px 10px; } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { display: block; }';
    const youtubeThumbnailsCssOff = 'ytd-thumbnail, ytd-playlist-thumbnail { display: none; } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { display: none !important; } .reel-shelf-items ytm-reel-item-renderer, .reel-shelf-items .reel-item-endpoint, .video-thumbnail-container-vertical { height: 100px !important; }';
    const youtubeThumbnailsCssBlur = 'ytd-thumbnail img, ytd-playlist-thumbnail img { filter: blur(7px); } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { filter: blur(7px); }';
    
    const youtubeNotificationsCssOn = '';
    const youtubeNotificationsCssOff = 'ytd-notification-topbar-button-renderer.ytd-masthead { display: none !important; }';
    const youtubeNotificationsCssBlur = 'ytd-notification-topbar-button-renderer.ytd-masthead .yt-spec-icon-badge-shape__badge { display: none; }';

    const youtubeProfileImgCssOn = '#avatar-link {display: inline-block; visibility: visible;} .channel-thumbnail-icon {display: inline-block;} #channel-thumbnail, #avatar-section, #author-thumbnail { display: block;}';
    const youtubeProfileImgCssOff = '#avatar-link {display: none; visibility: hidden;} .channel-thumbnail-icon, #channel-thumbnail, #avatar-section, #author-thumbnail {display: none;}';
   
    const youtubeShortsCssOn = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"], ytd-mini-guide-entry-renderer[aria-label="Shorts"], ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="SHORTS"]) { display: block; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(2), ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts], ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]) { display: flex; }'
    const youtubeShortsCssOff = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer[aria-label="Shorts"], ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts] { display: none; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(2), ytm-reel-shelf-renderer, ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]), ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="SHORTS"]) { display: none !important; }';
    
    const youtubeSubscriptionsCssOn = 'a[href="/feed/subscriptions/] { display: flex; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: flex; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty]))';
    const youtubeSubscriptionsCssOff = 'a[href="/feed/subscriptions"] { display: none !important; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: none; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty])) { display: none; }';
    
    const youtubeLibraryCssOn = '#endpoint[href="/feed/library"] { display: flex; } /* mobile */ ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(4) { display: flex; }';
    const youtubeLibraryCssOff = '#endpoint[href="/feed/library"] { display: none !important; } /* mobile */ ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(4) { display: none; } ';
    
    const youtubeHistoryCssOn = '#endpoint[href="/feed/history"] { display: flex; }';
    const youtubeHistoryCssOff = '#endpoint[href="/feed/history"] { display: none !important; }';
    
    const youtubeExploreCssOn = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: block; }';
    const youtubeExploreCssOff = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: none; }';
    
    const youtubeMoreCssOn = '#sections ytd-guide-section-renderer:has(a[href="/premium"]) { display: block; }';
    const youtubeMoreCssOff = '#sections ytd-guide-section-renderer:has(a[href="/premium"]) { display: none; }';
   
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
    const youtubeLikesCssOff = '#segmented-like-button .yt-core-attributed-string { display: none; } /* m.youtube.com */ ytm-segmented-like-dislike-button-renderer .animated-like-toggle-button .yt-spec-button-shape-next__button-text-content .yt-core-attributed-string { display: none; }';
    
    const youtubeSubscribersCssOn = '';
    const youtubeSubscribersCssOff = '#owner-sub-count, #subscriber-count { display: none !important; } /* m.youtube.com */ .slim-owner-icon-and-title .subhead .yt-core-attributed-string { display: none; }';
    
    // Facebook CSS
    const facebookFeedCssOn = '#ssrb_feed_start + div, div.x1hc1fzr.x1unhpq9.x6o7n8i { visibility: visible; } #screen-root div > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: block; }'
    const facebookFeedCssOff = '#ssrb_feed_start + div, div.x1hc1fzr.x1unhpq9.x6o7n8i { visibility: hidden; } #screen-root div:not([data-adjust-on-keyboard-shown="true"]) > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: none; }'
    
    const facebookWatchCssOn = '#screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(4) {display: flex;}'
    const facebookWatchCssOff = '#screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(4) {display: none;}'
    
    const facebookNotificationsCssOn = 'div.x9f619.x1n2onr6.x1ja2u2z a[href="/notifications/"] + div, #screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(5) div[data-mcomponent="MContainer"]:nth-child(3) {visibility: visible;}'
    const facebookNotificationsCssOff = 'div.x9f619.x1n2onr6.x1ja2u2z a[href="/notifications/"] + div, #screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(5) div[data-mcomponent="MContainer"]:nth-child(3) {visibility: hidden;}'
    
    const facebookChatCssOn = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6:not([role="cell"]) { visibility: visible; }';
    const facebookChatCssOff = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6:not([role="cell"]) { visibility: hidden; }';
    
    const facebookStoriesCssOn = '.x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k { display: block; } #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: flex;}';
    const facebookStoriesCssOff = '.x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k { display: none; } #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: none;}';
    
    
    
    // Twitter CSS
    const twitterExploreCssOn = 'nav[role="navigation"] a[href="/explore"] { display: flex; }';
    const twitterExploreCssOff = 'nav[role="navigation"] a[href="/explore"] { display: none; }';
    
    const twitterNotificationsCssOn = 'nav[role="navigation"] a[href="/notifications"] { display: flex; }';
    const twitterNotificationsCssOff = 'nav[role="navigation"] a[href="/notifications"] { display: none; }';
    
    const twitterTrendsCssOn = 'div[data-testid="sidebarColumn"] section[role="region"] {display: flex;}';
    const twitterTrendsCssOff = 'div[data-testid="sidebarColumn"] section[role="region"] {display: none; }';
    
    const twitterFollowCssOn = 'div[data-testid="sidebarColumn"] div.css-1dbjc4n.r-1bro5k0:has(aside[role="complementary"]) { display: flex;}';
    const twitterFollowCssOff = 'div[data-testid="sidebarColumn"] div.css-1dbjc4n.r-1bro5k0:has(aside[role="complementary"]) { display: none;}';
    
    const twitterTimelineCssOn = 'div[data-testid="primaryColumn"] section[role="region"] {visibility: visible; }';
    const twitterTimelineCssOff = 'div[data-testid="primaryColumn"] section[role="region"] {visibility: hidden; }';
    
    // Instagram CSS
    const instagramFeedCssOn = '';
    const instagramFeedCssOff = 'main[role="main"] div.xw7yly9 > div.x168nmei {display: none !important;}';
    
    const instagramStoriesCssOn = '';
    const instagramStoriesCssOff = 'main div.xmnaoh6 {display: none !important;}';
    
    const instagramMutedStoriesCssOn = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: flex; }';
    const instagramMutedStoriesCssOff = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: none; }';
    
    const instagramExploreCssOn = '';
    const instagramExploreCssOff = 'a[href^="/explore/"] { display: none; }';
    
    const instagramReelsCssOn = '';
    const instagramReelsCssOff = 'a[href*="/reels/"] { display: none; }';
    
    const instagramSuggestionsCssOn = '';
    const instagramSuggestionsCssOff = 'div._aak6._aak9 div._aak3 { display: none; } div._aak3._agh4 {display: none !important; }';
    
    const instagramCommentsCssOn = '';
    const instagramCommentsCssOff = 'div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1xmf6yo:has(a[href*="/comments/"]) {display: none !important;}';
    
    // LinkedIn CSS
    const linkedinFeedCssOn = 'main.scaffold-layout__main:not(:has(.nt-content)) .scaffold-finite-scroll, #feed-container {display: block;}';
    const linkedinFeedCssOff = 'main.scaffold-layout__main:not(:has(.nt-content)) .scaffold-finite-scroll, #feed-container {display: none !important;}';
    
    
    const linkedinNotificationsCssOn = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: block !important; }'
    const linkedinNotificationsCssOff = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: none !important; }'
    
    const linkedinNewsCssOn = '#feed-news-module, .feed-follows-module { display: block; }';
    const linkedinNewsCssOff = '#feed-news-module, .feed-follows-module { display: none; }';
    
    const linkedinAdsCssOn = 'section.ad-banner-container { display: block !important;}';
    const linkedinAdsCssOff = 'section.ad-banner-container { display: none;}';
    
    // WhatsApp
    const whatsappPreviewCssOn = ''
    const whatsappPreviewCssOff = 'div[data-testid="cell-frame-secondary"] { display: none; }'
    const whatsappNotificationPromptCssOn = ''
    const whatsappNotificationPromptCssOff = 'span[data-testid="chat-butterbar"] { display: none; }'

    // Google search CSS
    const googleAdsCssOn = '#tads, #atvcap, .commercial-unit-desktop-rhs {display: block !important;}'
    const googleAdsCssOff = '#tads, #atvcap, .commercial-unit-desktop-rhs {display: none;}'
    
    const googleBackgroundCssOff = '#tads, #atvcap .ptJHdc.yY236b.c3mZkd, #tads .CnP9N.U3A9Ac.irmCpc,.commercial-unit-mobile-top,.commercial-unit-mobile-top .v7hl4d,.commercial-unit-mobile-bottom .v7hl4d {background-color: #F2E6C3 !important;}'
    const googleBackgroundCssOn = ''
    
    
    // function to create style element with the specified CSS content
    function createStyleElement(some_style_id, some_css){
        if(!document.getElementById(some_style_id)){
            var styleElement = document.createElement("style");
            styleElement.id = some_style_id;
            document.head.appendChild(styleElement).innerHTML = some_css;
        } else {
            document.getElementById(some_style_id).innerHTML = some_css;
        };
    };
    
    // loop over the platforms. If the platform for the current URL is 'on' (or we haven't saved a status for it), create its style elements
    platformsWeTarget.forEach(function (platform) {
        if (window.location.hostname.includes(platform)){
            var filteredElements = elementsThatCanBeHidden.filter(element =>
              element.includes(platform)
            );
            
            // if we're on mobile twitter, then don't hide the explore element as it's the search button
            if (window.location.hostname.includes("m.twitter")){
                var filteredElements = elementsThatCanBeHidden.filter(element =>
                                                                      !element.includes("Explore")
                                                                      );
            };
            
            var key = platform + "Status";
            
            browser.storage.sync.get(key, function(result) {
                
                let platformIsOn = result[key];
                  // loop over the elements and create HTML style element for each
                  // If an element's key in storage is set to 'false', show the
                  // element, otherwise hide it
                  filteredElements.forEach(function (item) {
                      var styleName = item + "Style";
                      var key = item + "Status";
                      
                      if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                          
                          browser.storage.sync.get(key, function(result) {
                              
                              console.log(result[key]);
                              
                              if (result[key] == undefined || result[key] === false){
                                  createStyleElement(styleName, eval(item + "CssOn"));
                              } else {
                                  createStyleElement(styleName, eval(item + "Css" + result[key]));
                              };
                          });
                      } else {
                          browser.storage.sync.get(key, function(result) {
                              if (result[key] == true){
                                  createStyleElement(styleName, eval(item + "CssOff"));
                              } else {
                                  createStyleElement(styleName, eval(item + "CssOn"));
                              };
                          });
                      }
                  });
              
            });
        };
    });
    
    // let the popup ask for the current view status of the elements (so it can set the checkboxes accordingly)
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(message.method === "check"){
            var currentStyle = document.getElementById(message.element + "Style");
    
            // only check the blur element for elements that have it
            if(message.element == "youtubeThumbnails" || message.element == "youtubeNotifications"){
                if (currentStyle.innerHTML === eval(message.element + 'CssBlur')){
                    sendResponse({text: "blur"});
                }
            }
            
           // do the other checks for all
           if (currentStyle == undefined){
               sendResponse({text: "style element is undefined"});
               
            } else if (currentStyle.innerHTML === eval(message.element + 'CssOn')) {
                sendResponse({text: "visible"});
                
            } else if (currentStyle.innerHTML === eval(message.element + 'CssOff')){
                sendResponse({text: "hidden"});
            };
        };
    });
    
    // let the content script toggle elements when the popup asks for it
    browser.runtime.onMessage.addListener((message) => {
        var currentStyle = document.getElementById(message.element + "Style");
        
        if(message.method === "change"){
            if (currentStyle == undefined){
                console.log("not on active tab");
            } else if (currentStyle.innerHTML === eval(message.element + 'CssOn')) {
                currentStyle.innerHTML = eval(message.element + 'CssOff')
            } else {
                currentStyle.innerHTML = eval(message.element + 'CssOn')
            };
        } else if(message.method === "hideAll"){
            currentStyle.innerHTML = eval(message.element + 'CssOff')
        } else if(message.method === "showAll"){
            if (window.location.hostname.includes("google")){
                currentStyle.innerHTML = googleAdsCssSwitchOff;
            } else {
                currentStyle.innerHTML = eval(message.element + 'CssOn')
            }
        };
        
        // handle blur events
        if(message.method === "changeHideBlur"){
            if (currentStyle == undefined){
                console.log("not on active tab");
            } else {
                
                currentStyle.innerHTML = eval(message.element + 'Css' + message.action)
            };
        };
    });
})();
