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
    
    const platformsWeTarget = [ "youtube", "facebook", "google", "instagram", "linkedin" ];
    const elementsThatCanBeHidden = [ "youtubeRecVids", "youtubeShorts", "youtubeRelated", "youtubeComments", "facebookFeed", "facebookStories", "facebookChat", "linkedinFeed", "linkedinNews", "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramSuggestions", "googleAds" ];
    
    // YouTube CSS
    const youtubeRecVidsCssOn = 'ytd-browse[page-subtype="home"] { visibility: visible; } div[tab-identifier="FEwhat_to_watch"]  { visibility: visible; }';
    const youtubeRecVidsCssOff = 'ytd-browse[page-subtype="home"] { visibility: hidden; } div[tab-identifier="FEwhat_to_watch"]  { visibility: hidden; }';
    
    const youtubeShortsCssOn =  '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer [aria-label="Shorts"] { display: block; }  ytm-pivot-bar-renderer[role="tablist"]ytm-pivot-bar-item-renderer:nth-child(2){ visibility: visible; }'
    const youtubeShortsCssOff =  '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer [aria-label="Shorts"] { display: none; }  ytm-pivot-bar-renderer[role="tablist"]ytm-pivot-bar-item-renderer:nth-child(2){ visibility: hidden; }';
    
    const youtubeRelatedCssOn = '#related { visibility: visible; display: block; }  ytm-item-section-renderer[section-identifier="related-items"] {visibility: visible; }';
    const youtubeRelatedCssOff = '#related { visibility: hidden; display: none; }  ytm-item-section-renderer[section-identifier="related-items"] {visibility: hidden; }';
    
    const youtubeCommentsCssOn = '#comments { visibility: visible; }';
    const youtubeCommentsCssOff = '#comments { visibility: hidden; }';
    
    // Facebook CSS
    const facebookFeedCssOn = '#ssrb_feed_start + div { visibility: visible; } #m_news_feed_stream, #screen-root div[data-screen-id="65549"] > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: block; }'
    const facebookFeedCssOff = '#ssrb_feed_start + div { visibility: hidden; } #m_news_feed_stream, #screen-root div[data-screen-id="65549"] > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: none; }'
    
    const facebookChatCssOn = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6 { visibility: visible; }'
    const facebookChatCssOff = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6 { visibility: hidden; }'
    
    const facebookStoriesCssOn = '.x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k { display: block; }'
    const facebookStoriesCssOff = '.x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k { display: none; }'
    
    // Instagram CSS
    const instagramFeedCssOn = 'main[role="main"] div._aam1._aam2._aam5 div._ab8w._ab94._ab99._ab9f._ab9m._ab9p._abc0._abcm { visibility: visible; }';
    const instagramFeedCssOff = 'main[role="main"] div._aam1._aam2._aam5 div._ab8w._ab94._ab99._ab9f._ab9m._ab9p._abc0._abcm { visibility: hidden; }';
    
    const instagramStoriesCssOn = 'main[role="main"] div._aac4._aac5._aac6 { display: block; }';
    const instagramStoriesCssOff = 'main[role="main"] div._aac4._aac5._aac6 { display: none; }';
    
    const instagramMutedStoriesCssOn = 'main[role="main"] div[role="menu"] button[aria-label~="Story"].xbyyjgo { display: flex; }';
    const instagramMutedStoriesCssOff = 'main[role="main"] div[role="menu"] button[aria-label~="Story"].xbyyjgo { display: none; }';
    
    const instagramExploreCssOn = 'a[href="/explore/"] { display: inline; }';
    const instagramExploreCssOff = 'a[href="/explore/"] { display: none; }';
    
    const instagramSuggestionsCssOn = 'div._aak6._aak9 div._aak3 { display: flex; }';
    const instagramSuggestionsCssOff = 'div._aak6._aak9 div._aak3 { display: none; }';
    
    // LinkedIn CSS
    const linkedinFeedCssOn = '#ember33, .scaffold-finite-scroll.scaffold-finite-scroll--infinite  {display: block;}';
    const linkedinFeedCssOff = '#ember33, .scaffold-finite-scroll.scaffold-finite-scroll--infinite  {display: none;}';
    
    const linkedinNewsCssOn = 'aside[aria-label="LinkedIn News"] .news-module, aside[aria-label="LinkedIn News"] .mb2 { display: block; }';
    const linkedinNewsCssOff = 'aside[aria-label="LinkedIn News"] .news-module, aside[aria-label="LinkedIn News"] .mb2 { display: none; }';
    
    // Google search CSS
    const googleAdsCssOn = '#tads {display: block;}'
    const googleAdsCssOff = '#tads {display: none;}'
    
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
        
        if(request.method === "checkSwitch"){
            if (localStorage.getItem(request.domain) === "off"){
                sendResponse({text: "off"});
            } else {
                sendResponse({text: "on"});
            };
        };

        if(request.method == "getSavedState"){
            var response = {};
            elementsThatCanBeHidden.forEach(function(element) {
              response[element] = localStorage.getItem(element);
            });
            sendResponse(response);
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
            toggleHiding(message.element + 'Style', eval(message.element + 'CssOn'), eval(message.element + 'CssOff'),  message.status);
        };
    
        // save state if the popup asks for it
        if (message.method === "saveState"){
            elementsThatCanBeHidden.forEach(function (item) {
                localStorage.setItem(item, eval('message.' + item));
            });
        };
        
    });
   
})();
