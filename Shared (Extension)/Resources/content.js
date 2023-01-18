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
    
    const platformsWeTarget = [ "youtube", "facebook", "twitter", "instagram", "linkedin", "google" ];
    const elementsThatCanBeHidden = [ "youtubeRecVids", "youtubeShorts", "youtubeSubscriptions", "youtubeExplore", "youtubeMore", "youtubeRelated", "youtubeComments", "twitterExplore", "twitterNotifications", "twitterTrends", "twitterFollow", "twitterTimeline", "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat", "linkedinNews", "linkedinNotifications", "linkedinFeed", "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramSuggestions", "googleAds" ];
    
    // YouTube CSS
    const youtubeRecVidsCssOn = 'ytd-browse[page-subtype="home"] { visibility: visible; } div[tab-identifier="FEwhat_to_watch"] { visibility: visible; }';
    const youtubeRecVidsCssOff = 'ytd-browse[page-subtype="home"] { visibility: hidden; } div[tab-identifier="FEwhat_to_watch"] { visibility: hidden; }';
    
    const youtubeShortsCssOn = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer[aria-label="Shorts"] { display: block; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(2){ display: flex; }'
    const youtubeShortsCssOff = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer[aria-label="Shorts"] { display: none; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(2){ display: none; }';
     
     const youtubeSubscriptionsCssOn = 'a[href="/feed/subscriptions/] { display: flex; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: flex; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty]))';
     const youtubeSubscriptionsCssOff = 'a[href="/feed/subscriptions"] { display: none !important; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: none; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty])) { display: none; }';
     
     const youtubeExploreCssOn = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: block; }';
     const youtubeExploreCssOff = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: none; }';
     
     const youtubeMoreCssOn = '#sections ytd-guide-section-renderer:has(a[href="/premium"]) { display: block; }';
     const youtubeMoreCssOff = '#sections ytd-guide-section-renderer:has(a[href="/premium"]) { display: none; }';
    
    const youtubeRelatedCssOn = '#related { visibility: visible; display: block; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: block; }';
    const youtubeRelatedCssOff = '#related { visibility: hidden; display: none; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: none; } ytm-single-column-watch-next-results-renderer .related-chips-slot-wrapper { transform: none !important; }';
    
    const youtubeCommentsCssOn = '#comments { visibility: visible; } #app ytm-comments-entry-point-header-renderer { display: block; }';
    const youtubeCommentsCssOff = '#comments { visibility: hidden; } #app ytm-comments-entry-point-header-renderer { display: none; }';
    
    // Facebook CSS
    const facebookFeedCssOn = '#ssrb_feed_start + div { visibility: visible; } #m_news_feed_stream, #screen-root div[data-screen-id="65549"] > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: block; }'
    const facebookFeedCssOff = '#ssrb_feed_start + div { visibility: hidden; } #m_news_feed_stream, #screen-root div[data-screen-id="65549"] > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: none; }'
    
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
    const instagramFeedCssOn = 'main[role="main"] section._aalv > div._aam1 article { visibility: visible; }';
    const instagramFeedCssOff = 'main[role="main"] section._aalv > div._aam1 article { visibility: hidden; }';
    
    const instagramStoriesCssOn = 'main[role="main"] div._aac4._aac5._aac6 { display: block; } main ._aauo[role="menu"] {display: flex;}';
    const instagramStoriesCssOff = 'main[role="main"] div._aac4._aac5._aac6 { display: none; } main ._aauo[role="menu"] {display: none;}';
    
    const instagramMutedStoriesCssOn = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: flex; }';
    const instagramMutedStoriesCssOff = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: none; }';
    
    const instagramExploreCssOn = 'a[href="/explore/"] { display: inline; }';
    const instagramExploreCssOff = 'a[href="/explore/"] { display: none; }';
    
    const instagramSuggestionsCssOn = 'div._aak6._aak9 div._aak3 { display: flex; }';
    const instagramSuggestionsCssOff = 'div._aak6._aak9 div._aak3 { display: none; }';
    
    // LinkedIn CSS
    const linkedinFeedCssOn = '#ember33, #main .scaffold-finite-scroll, #feed-container {display: block;}';
    const linkedinFeedCssOff = '#ember33, #main .scaffold-finite-scroll, #feed-container {display: none;}';
    
    const linkedinNotificationsCssOn = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: block !important; }'
    const linkedinNotificationsCssOff = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: none !important; }'
    
    const linkedinNewsCssOn = '#feed-news-module, .feed-follows-module { display: block; }';
    const linkedinNewsCssOff = '#feed-news-module, .feed-follows-module { display: none; }';

    // Google search CSS
    const googleAdsCssOn = '#tads, .commercial-unit-desktop-rhs {display: block;} #tads, #tads .CnP9N.U3A9Ac.irmCpc,.commercial-unit-mobile-top,.commercial-unit-mobile-top .v7hl4d,.commercial-unit-mobile-bottom .v7hl4d {background-color: #F2E6C3 !important;}'
    const googleAdsCssOff = '#tads, .commercial-unit-desktop-rhs {display: none;}'
    const googleAdsCssSwitchOff = '#tads, commercial-unit-desktop-rhs {display: block;}'
    
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
            
            var key = platform + "Status";
            
            browser.storage.sync.get(key, function(result) {
                //console.log("saved status for " + platform + " is " + result[key]);
                
              if (result[key] == true || result[key] == undefined) {
                  
                  // loop over the elements and create HTML style element for each
                  // If an element's key in storage is set to 'false', show the
                  // element, otherwise hide it
                  filteredElements.forEach(function (item) {
                      var styleName = item + "Style";
                      var key = item + "Status";
                      
                      browser.storage.sync.get(key, function(result) {
                          if (result[key] == false){
                              createStyleElement(styleName, eval(item + "CssOn"));
                          } else {
                              createStyleElement(styleName, eval(item + "CssOff"));
                          };
                      });
                  });
              }
            });
        };
    });
    
    // let the popup ask for the current status of the elements and of the saved state
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        function checkStyleStatus(currentStyle, some_css_for_shown){
            if (currentStyle == undefined){
                sendResponse({text: "not on active tab"});
            } else if (currentStyle.innerHTML === some_css_for_shown) {
                sendResponse({text: "visible"});
            } else {
                sendResponse({text: "hidden"});
            };
        };
    
        if(request.method === "check"){
            var currentStyle = document.getElementById(request.element + "Style");
    
            checkStyleStatus(currentStyle, eval(request.element + 'CssOn'));
        };
    });
    
    // let the content script toggle elements when the popup asks for it
    function toggleHiding(some_style_id, css_shown, css_hidden, status){
        var styleElement = document.getElementById(some_style_id);
    
        if(status == true){
            styleElement.innerHTML = css_shown;
        } else {
            styleElement.innerHTML = css_hidden;
        };
    };
    
    browser.runtime.onMessage.addListener((message) => {
        // toggling hiding when popup asks
        if(message.method === "change"){
            if (message.element == "googleAds" && message.changeType == "switch off"){
                document.getElementById("googleAdsStyle").innerHTML = googleAdsCssSwitchOff;
            } else {
                toggleHiding(message.element + 'Style', eval(message.element + 'CssOn'), eval(message.element + 'CssOff'),  message.status);
            }
        };
    });
})();
