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
     
     const youtubeSubscriptionsCssOn = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Subscriptions"], ytd-mini-guide-entry-renderer[aria-label="Subscriptions"], #sections ytd-guide-section-renderer:nth-child(2) { display: block; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3){ display: flex; }';
     const youtubeSubscriptionsCssOff = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Subscriptions"], ytd-mini-guide-entry-renderer[aria-label="Subscriptions"], #sections ytd-guide-section-renderer:nth-child(2) { display: none; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3){ display: none; }';
     
     const youtubeExploreCssOn = '#sections ytd-guide-section-renderer:nth-child(3) { display: block; }';
     const youtubeExploreCssOff = '#sections ytd-guide-section-renderer:nth-child(3) { display: none; }';
     
     const youtubeMoreCssOn = '#sections ytd-guide-section-renderer:nth-child(4) { display: block; }';
     const youtubeMoreCssOff = '#sections ytd-guide-section-renderer:nth-child(4) { display: none; }';
    
    const youtubeRelatedCssOn = '#related { visibility: visible; display: block; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: block; }';
    const youtubeRelatedCssOff = '#related { visibility: hidden; display: none; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: none; }';
    
    const youtubeCommentsCssOn = '#comments { visibility: visible; } #app ytm-comments-entry-point-header-renderer { display: block; }';
    const youtubeCommentsCssOff = '#comments { visibility: hidden; } #app ytm-comments-entry-point-header-renderer { display: none; }';
    
    // Facebook CSS
    const facebookFeedCssOn = '#ssrb_feed_start + div { visibility: visible; } #m_news_feed_stream, #screen-root div[data-screen-id="65549"] > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: block; }'
    const facebookFeedCssOff = '#ssrb_feed_start + div { visibility: hidden; } #m_news_feed_stream, #screen-root div[data-screen-id="65549"] > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: none; }'
    
    const facebookWatchCssOn = '#screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(4) {display: flex;}'
    const facebookWatchCssOff = '#screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(4) {display: none;}'
    
    const facebookNotificationsCssOn = 'div[aria-label^="Notifications"], #screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(5) div[data-mcomponent="MContainer"]:nth-child(3) {display: flex;}'
    const facebookNotificationsCssOff = 'div[aria-label^="Notifications"], #screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(5) div[data-mcomponent="MContainer"]:nth-child(3) {display: none;}'
    
    const facebookChatCssOn = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6 { visibility: visible; }'
    const facebookChatCssOff = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6 { visibility: hidden; }'
    
    const facebookStoriesCssOn = '.x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k { display: block; } #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: flex;}'
    const facebookStoriesCssOff = '.x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k { display: none; } #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: none;}'
    
    
    
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
    const linkedinFeedCssOn = '#ember33, .scaffold-finite-scroll.scaffold-finite-scroll--infinite, #feed-container {display: block;}';
    const linkedinFeedCssOff = '#ember33, .scaffold-finite-scroll.scaffold-finite-scroll--infinite, #feed-container {display: none;}';
    
    const linkedinNotificationsCssOn = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: block !important; }'
    const linkedinNotificationsCssOff = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: none !important; }'
    
    const linkedinNewsCssOn = 'aside[aria-label="LinkedIn News"] .news-module, aside[aria-label="LinkedIn News"] .mb2 { display: block; }';
    const linkedinNewsCssOff = 'aside[aria-label="LinkedIn News"] .news-module, aside[aria-label="LinkedIn News"] .mb2 { display: none; }';
    
    // Google search CSS
    const googleAdsCssOn = '#tads {display: block;} #tads, #tads .CnP9N.U3A9Ac.irmCpc,.commercial-unit-mobile-top,.commercial-unit-mobile-top .v7hl4d,.commercial-unit-mobile-bottom .v7hl4d {background-color: #F2E6C3 !important;}'
    const googleAdsCssOff = '#tads {display: none;}'
    const googleAdsCssSwitchOff = '#tads {display: block;}'
    
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
    
    // loop over the elements and create the style
    platformsWeTarget.forEach(function (platform) {
        if (window.location.hostname.includes(platform)){
            var filteredElements = elementsThatCanBeHidden.filter(element =>
              element.includes(platform)
            );
            
            var key = platform + "Status";
            
            browser.storage.sync.get(key, function(result) {
                //console.log("saved status for " + platform + " is " + result[key]);
                
              if (result[key] == true || result[key] == undefined) {
                  //console.log("creating CssOff");
                  //console.log(filteredElements);
                  
                  filteredElements.forEach(function (item) {
                      var styleName = item + "Style";
                      var key = item + "Status";
                      
                      browser.storage.sync.get(key, function(result) {
                          if (result[key] == true || result[key] == undefined){
                              createStyleElement(styleName, eval(item + "CssOn"));
                          } else {
                              createStyleElement(styleName, eval(item + "CssOff"));
                          };
                      });
                  });
              } else {
                  //console.log("creating CssOn");
                  //console.log(filteredElements);
                  filteredElements.forEach(function (item) {
                      var styleName = item + "Style";
                      createStyleElement(styleName, eval(item + "CssOn"));
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
