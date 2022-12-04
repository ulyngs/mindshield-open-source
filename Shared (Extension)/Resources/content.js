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
    
    const elementsThatCanBeHidden = [ "youtubeRecVids", "youtubeShorts", "youtubeRelated", "youtubeComments", "facebookFeed", "facebookStories", "facebookChat", "inFeed", "inNews", "instagramMutedStories", "instagramExplore", "googleAds" ];
    
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
    const instagramMutedStoriesCssOn = 'main[role="main"] div[role="menu"] button[aria-label~="Story"].xbyyjgo { display: flex; }'
    const instagramMutedStoriesCssOff = 'main[role="main"] div[role="menu"] button[aria-label~="Story"].xbyyjgo { display: none; }'
    
    const instagramExploreCssOn = 'a[href="/explore/"] { display: inline; }'
    const instagramExploreCssOff = 'a[href="/explore/"] { display: none; }'
    
    // LinkedIn CSS
    const inFeedCssOn = '#ember33, .scaffold-finite-scroll.scaffold-finite-scroll--infinite  {display: block;}'
    const inFeedCssOff = '#ember33, .scaffold-finite-scroll.scaffold-finite-scroll--infinite  {display: none;}'
    
    const inNewsCssOn = 'aside[aria-label="LinkedIn News"] .news-module, aside[aria-label="LinkedIn News"] .mb2 { display: block; }'
    const inNewsCssOff = 'aside[aria-label="LinkedIn News"] .news-module, aside[aria-label="LinkedIn News"] .mb2 { display: none; }'
    
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
    elementsThatCanBeHidden.forEach(function (item) {
        var styleName = item + "Style";
        if (localStorage.getItem(item) === "true" || localStorage.getItem("youtube") === "off"){
            createStyleElement(styleName, eval(item + "CssOn"));
        } else {
            createStyleElement(styleName, eval(item + "CssOff"));
        };
    });
    
    // let the popup ask for the current status of the elements and of the saved state
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        function checkStyleStatus(currentStyle, some_css_for_shown){
            if (currentStyle.innerHTML === some_css_for_shown) {
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
        
        if (message.method === "switchOff"){
            localStorage.setItem(message.domain, "off");
        };
        
        if (message.method === "switchOn"){
            localStorage.setItem(message.domain, "on")
        };
    });
   
})();