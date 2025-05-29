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
     // Only includes predefined elements for targeted platforms
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

     // --- CSS Definitions (Keep as they are) ---
     const youtubeSearchCssOn = ''; const youtubeSearchCssOff = '#center > yt-searchbox.ytSearchboxComponentHost.ytSearchboxComponentDesktop.ytd-masthead, ytd-searchbox { display: none; } button[aria-label="Search YouTube"] {display: none;}';
     const youtubeSearchPredictCssOn = ''; const youtubeSearchPredictCssOff = 'div.gstl_50 { display: none !important; }';
     const youtubeRecVidsCssOn = 'ytd-browse[page-subtype="home"] { visibility: visible !important; } div[tab-identifier="FEwhat_to_watch"] { visibility: visible !important; }'; const youtubeRecVidsCssOff = 'ytd-browse[page-subtype="home"] { display: none; } div[tab-identifier="FEwhat_to_watch"] { visibility: hidden; }';
     const youtubeThumbnailsCssOn = 'ytd-thumbnail, ytd-playlist-thumbnail, yt-collection-thumbnail-view-model, a.yt-lockup-view-model-wiz__content-image { display: block !important; } ytd-thumbnail img, ytd-playlist-thumbnail img { filter: none; } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { display: block !important; filter: none; } .reel-shelf-items ytm-reel-item-renderer, .reel-shelf-items .reel-item-endpoint, .video-thumbnail-container-vertical { height: auto !important; }'; const youtubeThumbnailsCssOff = 'ytd-thumbnail, ytd-playlist-thumbnail, yt-collection-thumbnail-view-model, a.yt-lockup-view-model-wiz__content-image { display: none !important; } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { display: none !important; } .reel-shelf-items ytm-reel-item-renderer, .reel-shelf-items .reel-item-endpoint, .video-thumbnail-container-vertical { height: 100px !important; }'; const youtubeThumbnailsCssBlur = 'ytd-thumbnail img, ytd-playlist-thumbnail img { filter: blur(7px); } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { filter: blur(7px); } ytd-thumbnail, ytd-playlist-thumbnail { display: block !important; } /* Ensure container is visible for blur */'; const youtubeThumbnailsCssBlack = 'ytd-thumbnail img, ytd-playlist-thumbnail img { filter: brightness(0); } /* mobile */ .media-item-thumbnail-container, .video-thumbnail-img { filter: brightness(0); } ytd-thumbnail, ytd-playlist-thumbnail { display: block !important; } /* Ensure container is visible for black */';
     const youtubeNotificationsCssOn = 'ytd-notification-topbar-button-renderer.ytd-masthead { display: inline-flex !important; } ytd-notification-topbar-button-renderer.ytd-masthead .yt-spec-icon-badge-shape__badge { display: inline-flex; }'; const youtubeNotificationsCssOff = 'ytd-notification-topbar-button-renderer.ytd-masthead { display: none !important; }'; const youtubeNotificationsCssBlur = 'ytd-notification-topbar-button-renderer.ytd-masthead { display: inline-flex !important; } ytd-notification-topbar-button-renderer.ytd-masthead .yt-spec-icon-badge-shape__badge { display: none; }'; // Black state not visually distinct from Off, so treat Black as Off
     const youtubeNotificationsCssBlack = youtubeNotificationsCssOff; // Treat Black as Off for notifications
     const youtubeProfileImgCssOn = ''; const youtubeProfileImgCssOff = '#avatar-link, #avatar-container, #avatar {display: none; visibility: hidden;} .channel-thumbnail-icon, #channel-thumbnail, #avatar-section, #author-thumbnail, ytm-comments-entry-point-teaser-renderer img.ytm-comments-entry-point-teaser-avatar, ytm-profile-icon.slim-owner-profile-icon, ytm-profile-icon.comment-icon {display: none;}  #creator-thumbnail, #expander.ytd-comment-replies-renderer .dot.ytd-comment-replies-renderer, ytm-channel-thumbnail-with-link-renderer {display: none !important;}';
     const youtubeShortsCssOn = '';
     const youtubeShortsCssOff = '#endpoint.yt-simple-endpoint.ytd-guide-entry-renderer[title="Shorts"],ytd-mini-guide-entry-renderer[aria-label="Shorts"], ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts], ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model) { display: none; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(2), ytm-reel-shelf-renderer, ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]), ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="SHORTS"]) { display: none !important; }';
     const youtubeSubscriptionsCssOn = 'a[href="/feed/subscriptions"] { display: flex !important; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: flex !important; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty])) { display: block !important; }'; const youtubeSubscriptionsCssOff = 'a[href="/feed/subscriptions"] { display: none !important; } ytm-pivot-bar-renderer[role="tablist"] ytm-pivot-bar-item-renderer:nth-child(3) { display: none !important; } #sections ytd-guide-section-renderer:nth-child(2):not(:has(#guide-section-title[is-empty])) { display: none !important; }';
     const youtubeHistoryCssOn = '#endpoint[href="/feed/history"] { display: flex !important; }'; const youtubeHistoryCssOff = '#endpoint[href="/feed/history"] { display: none !important; }';
     const youtubeExploreCssOn = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: block !important; }'; const youtubeExploreCssOff = '#sections ytd-guide-section-renderer:has(a[href="/gaming"]) { display: none !important; }';
     const youtubeMoreCssOn = '#sections ytd-guide-section-renderer:has(a[href="https://studio.youtube.com/"]) { display: block !important; }'; const youtubeMoreCssOff = '#sections ytd-guide-section-renderer:has(a[href="https://studio.youtube.com/"]) { display: none !important; }';
     const youtubeRelatedCssOn = '#related { visibility: visible !important; display: block !important; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: block !important; } ytm-single-column-watch-next-results-renderer .related-chips-slot-wrapper { transform: translateY(0) !important; }';
     const youtubeRelatedCssOff = '#related { visibility: hidden !important; display: none !important; } #app ytm-item-section-renderer[section-identifier="related-items"] { display: none !important; } ytm-single-column-watch-next-results-renderer .related-chips-slot-wrapper { transform: none !important; }';
     const youtubeSidebarCssOn = '';
     const youtubeSidebarCssOff = '#secondary { display: none !important; } video.html5-main-video { width: 100% !important; height: auto !important; }';
     const youtubeCommentsCssOn = '#comments { visibility: visible !important; } #app ytm-comments-entry-point-header-renderer { display: block !important; }'; const youtubeCommentsCssOff = '#comments { visibility: hidden !important; } #app ytm-comments-entry-point-header-renderer { display: none !important; }';
     const youtubeAdsCssOn = ''; const youtubeAdsCssOff = 'ytm-promoted-sparkles-text-search-renderer, ytd-promoted-sparkles-text-search-renderer, ytd-promoted-sparkles-web-renderer, ytd-carousel-ad-renderer, ytd-ad-slot-renderer, #masthead-ad, ytd-ad-slot-renderer { display: none !important; }  /* video page */ ytm-promoted-sparkles-web-renderer, ytm-companion-ad-renderer, #player-ads {display: none !important; }';
     const youtubeViewsCssOn = ''; const youtubeViewsCssOff = '/* watch page */ #metadata-line.ytd-video-meta-block > .ytd-video-meta-block:first-of-type {display: none !important; } #metadata-line.ytd-video-meta-block>.ytd-video-meta-block:not(:first-of-type):before, #metadata-line.ytd-grid-video-renderer>.ytd-grid-video-renderer:not(:first-of-type):before { content: ""; margin: 0px; } /* video page */ #info-container > .ytd-watch-metadata > .yt-formatted-string:nth-of-type(1), #info-container > .ytd-watch-metadata > .yt-formatted-string:nth-of-type(2) { display: none; } /* channel page */ ytd-two-column-browse-results-renderer #metadata-line span.ytd-grid-video-renderer:first-of-type { display: none !important; } /* m.youtube.com */ ytm-badge-and-byline-renderer .ytm-badge-and-byline-item-byline:not(:first-of-type):not(:last-of-type), ytm-badge-and-byline-renderer .ytm-badge-and-byline-separator:not(:first-of-type) { display: none; } .slim-video-metadata-header .secondary-text .yt-core-attributed-string {display: none;}';
     const youtubeLikesCssOn = ''; const youtubeLikesCssOff = 'ytd-watch-metadata #top-level-buttons-computed like-button-view-model .yt-spec-button-shape-next__button-text-content { display: none !important; } /* m.youtube.com */ ytm-slim-video-metadata-section-renderer like-button-view-model .yt-spec-button-shape-next__button-text-content { display: none !important; }';
     const youtubeSubscribersCssOn = ''; const youtubeSubscribersCssOff = '#owner-sub-count, #subscriber-count { display: none !important; } /* m.youtube.com */ .slim-owner-icon-and-title .subhead .yt-core-attributed-string { display: none !important; }';
     const facebookFeedCssOn = '#ssrb_feed_start + div, div.x1hc1fzr.x1unhpq9.x6o7n8i { visibility: visible !important; } #screen-root div > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+6) { display: block !important; }';
     const facebookFeedCssOff = '#ssrb_feed_start + div, div.x1hc1fzr.x1unhpq9.x6o7n8i { visibility: hidden !important; } #screen-root div:not([data-adjust-on-keyboard-shown="true"]) > div[data-mcomponent="MContainer"] > div.m.displayed:nth-child(n+7) { display: none !important; }';
     const facebookWatchCssOn = '';
     const facebookWatchCssOff = 'a[href$="/watch/"], a[aria-label="Video"], div[aria-label*="video" i] { display: none !important; } /* mobile */ div[role="button"]:has(div[data-hidden-ref-key="videos.jewel.hidden"]) {display: none !important;} div.m.displayed:has(div[data-hidden-ref-key="videos.jewel.hidden"]) {background-color: white !important;} ';
     const facebookNotificationsCssOn = '';
     const facebookNotificationsCssOff = 'div[aria-label*="Notifications"], div[data-hidden-ref-key="notifications.pill.jewel.hidden"], #screen-root div[data-mcomponent="MScreen"] div[data-mcomponent="MContainer"] div[data-mcomponent="MContainer"]:nth-child(2) div[role="button"]:nth-child(5) div[data-mcomponent="MContainer"]:nth-child(3) {visibility: hidden !important;}';
     const facebookChatCssOn = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6:not([role="cell"]) { visibility: visible !important; }'; const facebookChatCssOff = 'div[role="complementary"] div[data-visualcompletion="ignore-dynamic"] > div.x1n2onr6:not([role="cell"]) { visibility: hidden !important; }';
     const facebookStoriesCssOn = 'div[aria-label="Stories"], #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: block !important;}'; const facebookStoriesCssOff = 'div[aria-label="Stories"] { display: none !important; } #screen-root div[data-mcomponent="MContainer"] > div[data-mcomponent="MContainer"]:has(div[aria-label*="story"]) { display: none !important;}';
     const facebookSponsoredCssOn = ''; const facebookSponsoredCssOff = 'a[aria-label="Advertiser"] { display: none !important; }';
     const xExploreCssOn = 'nav[role="navigation"] a[href="/explore"] { display: flex !important; }'; const xExploreCssOff = 'nav[role="navigation"] a[href="/explore"] { display: none !important; }';
     const xNotificationsCssOn = 'nav[role="navigation"] a[href="/notifications"] { display: flex !important; }'; const xNotificationsCssOff = 'nav[role="navigation"] a[href="/notifications"] { display: none !important; }';
     const xTrendsCssOn = 'div[data-testid="sidebarColumn"] section[role="region"] {display: flex !important;}'; const xTrendsCssOff = 'div[data-testid="sidebarColumn"] section[role="region"] {display: none !important; }';
     const xFollowCssOn = 'div[data-testid="sidebarColumn"] div.css-175oi2r.r-1bro5k0:has(aside[role="complementary"]) { display: flex !important;}'; const xFollowCssOff = 'div[data-testid="sidebarColumn"] div.css-175oi2r.r-1bro5k0:has(aside[role="complementary"]) { display: none !important;}';
     const xTimelineCssOn = 'div[data-testid="primaryColumn"] section[role="region"] {visibility: visible !important; }'; const xTimelineCssOff = 'div[data-testid="primaryColumn"] section[role="region"] {visibility: hidden !important; }';
     const instagramFeedCssOn = 'main[role="main"] div.xw7yly9 > div.x168nmei, section._aalv._aal_ div._aam1 > div.x9f619, main[role="main"] div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1:has(article) {display: block !important;}'; const instagramFeedCssOff = 'main[role="main"] div.xw7yly9 > div.x168nmei, /* mobile */ section._aalv._aal_ div._aam1 > div._aac4, /* mobile 8 Apr 2024 */ main[role="main"] div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1:has(article) {display: none !important;}';
     const instagramStoriesCssOn = 'main div.xmnaoh6, section._aalv._aal_ div._aam1 > div._aac4, main[role="main"] div.x1ixjvfu.x1q0q8m5.xso031l {display: block !important;}'; const instagramStoriesCssOff = 'main div.xmnaoh6, /* mobile */ section._aalv._aal_ div._aam1 > div._aac4, /* mobile 8 Apr 2024 */  main[role="main"] div.x1ixjvfu.x1q0q8m5.xso031l {display: none !important;}';
     const instagramMutedStoriesCssOn = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: flex !important; }'; const instagramMutedStoriesCssOff = 'main[role="main"] div[role="menu"] button[role="menuitem"].xbyyjgo { display: none !important; }';
     const instagramExploreCssOn = 'a[href="/explore/"] { display: flex !important; }'; const instagramExploreCssOff = 'a[href="/explore/"] { display: none !important; }';
     const instagramReelsCssOn = 'a[href="/reels/"] { display: flex !important; }'; const instagramReelsCssOff = 'a[href="/reels/"] { display: none !important; }';
     const instagramSuggestionsCssOn = 'div.x78zum5.xdt5ytf.xdj266r.x11i5rnm.xod5an3.x169t7cy.x1j7kr1c.xvbhtw8:has(a[href="/explore/people/"]) { display: block !important; }'; const instagramSuggestionsCssOff = 'div.x78zum5.xdt5ytf.xdj266r.x11i5rnm.xod5an3.x169t7cy.x1j7kr1c.xvbhtw8:has(a[href="/explore/people/"]) { display: none !important; }';
     const instagramCommentsCssOn = 'div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1xmf6yo:has(a[href*="/comments/"]) {display: block !important;}'; const instagramCommentsCssOff = 'div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1xmf6yo:has(a[href*="/comments/"]) {display: none !important;}';
     const linkedinFeedCssOn = 'div.scaffold-finite-scroll.scaffold-finite-scroll--infinite, #feed-container {display: block !important;}';
     const linkedinFeedCssOff = 'div.scaffold-finite-scroll.scaffold-finite-scroll--infinite, div.scaffold-finite-scroll.scaffold-finite-scroll--finite, #feed-container {display: none !important;}';
     const linkedinNotificationsCssOn = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: block !important; }'; const linkedinNotificationsCssOff = 'span.notification-badge--show, #nav-notifications-small-badge, #nav-people-small-badge { display: none !important; }';
     const linkedinNewsCssOn = '#feed-news-module, .feed-follows-module { display: block !important; }'; const linkedinNewsCssOff = '#feed-news-module, .feed-follows-module { display: none !important; }';
     const linkedinAdsCssOn = 'section.ad-banner-container { display: block !important;}'; const linkedinAdsCssOff = 'section.ad-banner-container { display: none !important;}'; // Added !important
     const whatsappPreviewCssOn = 'div[data-testid="cell-frame-secondary"] { display: block !important; }'; const whatsappPreviewCssOff = 'div[data-testid="cell-frame-secondary"] { display: none !important; }';
     const whatsappNotificationPromptCssOn = 'span[data-testid="chat-butterbar"] { display: block !important; }'; const whatsappNotificationPromptCssOff = 'span[data-testid="chat-butterbar"] { display: none !important; }';
     const googleAdsCssOn = '#tads, #atvcap, .commercial-unit-desktop-rhs {display: block !important;}'; const googleAdsCssOff = '#tads, #atvcap, .commercial-unit-desktop-rhs {display: none !important;}'; // Added !important
     const googleBackgroundCssOn = '#tads, #atvcap .ptJHdc.yY236b.c3mZkd, #tads .CnP9N.U3A9Ac.irmCpc,.commercial-unit-mobile-top,.commercial-unit-mobile-top .v7hl4d,.commercial-unit-mobile-bottom .v7hl4d {background-color: transparent !important;}'; const googleBackgroundCssOff = '#tads, #atvcap .ptJHdc.yY236b.c3mZkd, #tads .CnP9N.U3A9Ac.irmCpc,.commercial-unit-mobile-top,.commercial-unit-mobile-top .v7hl4d,.commercial-unit-mobile-bottom .v7hl4d {background-color: #F2E6C3 !important;}';
     const redditFeedCssOn = 'shreddit-feed { display: block !important; }'; const redditFeedCssOff = 'shreddit-feed { display: none !important; }';
     const redditPopularCssOn = 'a[href="/r/popular/"] { display: flex !important; }'; const redditPopularCssOff = 'a[href="/r/popular/"] { display: none !important; }';
     const redditAllCssOn = 'a[href="/r/all/"] { display: flex !important; }'; const redditAllCssOff = 'a[href="/r/all/"] { display: none !important; }';
     const redditRecentCssOn = 'reddit-recent-pages { display: block !important; }'; const redditRecentCssOff = 'reddit-recent-pages { display: none !important; }';
     const redditCommunitiesCssOn = '[aria-controls="communities_section"] + faceplate-auto-height-animator { display: block !important; } [aria-controls="communities_section"] { display: flex !important; }'; const redditCommunitiesCssOff = '[aria-controls="communities_section"] + faceplate-auto-height-animator { display: none !important; } [aria-controls="communities_section"] { display: none !important; }';
     const redditNotificationCssOn = '#mini-inbox-tooltip { display: block !important; }'; const redditNotificationCssOff = '#mini-inbox-tooltip { display: none !important; }';
     const redditChatCssOn = 'reddit-chat-header-button { display: block !important; }'; const redditChatCssOff = 'reddit-chat-header-button { display: none !important; }';
     const redditTrendingCssOn = '[search-telemetry-source="popular_carousel"] { display: block !important; }'; const redditTrendingCssOff = '[search-telemetry-source="popular_carousel"] { display: none !important; }';
     const redditPopularCommunitiesCssOn = '#popular-communities-list { display: block !important; } [aria-label="Popular Communities"] { display: block !important; }'; const redditPopularCommunitiesCssOff = '#popular-communities-list { display: none !important; } [aria-label="Popular Communities"] { display: none !important; }';

     // --- Shadow DOM Selectors (Unchanged) ---
     const shadowSelectors = {
         "redditPopular": "left-nav-top-section",
         "redditAll": "left-nav-top-section",
     };

     // --- Helper Functions ---

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

     // --- Site Identification ---
     let currentSiteIdentifier = null;
     let currentPlatform = null;
     const currentHostname = window.location.hostname;
     for (const platform of platformsWeTarget) {
         if ((platform === 'google' && currentHostname.includes('google.') && !currentHostname.startsWith('ads.')) ||
             (platform !== 'google' && currentHostname.includes(platform))) {
             currentPlatform = platform; currentSiteIdentifier = platform; break;
         }
     }
     if (!currentSiteIdentifier && currentHostname) { currentSiteIdentifier = currentHostname; }
     console.log("MindShield content script running on:", currentSiteIdentifier || "Unknown site");

     // --- Apply Initial Styles ---
     if (currentPlatform) {
         const platformStatusKey = `${currentPlatform}Status`;
         browser.storage.sync.get(platformStatusKey, function(platformResult) {
             let platformIsOn = platformResult[platformStatusKey] !== false;
             elementsThatCanBeHidden
                 .filter(element => element.startsWith(currentPlatform))
                 .forEach(function(item) {
                     const styleName = item + "Style"; const itemStatusKey = item + "Status";
                     if (!platformIsOn) { createStyleElement(styleName, eval(item + "CssOn")); }
                     else {
                         browser.storage.sync.get(itemStatusKey, function(itemResult) {
                             let statusValue = itemResult[itemStatusKey]; let cssToApply;
                             if (item === "youtubeThumbnails" || item === "youtubeNotifications") {
                                 let state = statusValue || "On"; cssToApply = eval(item + "Css" + state);
                             } else { cssToApply = (statusValue === true) ? eval(item + "CssOff") : eval(item + "CssOn"); }
                             createStyleElement(styleName, cssToApply);
                         });
                     }
                 });
         });
     }

     // --- Message Listener from Popup ---
     chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
         if (message.method === "ping") {
                 sendResponse({ status: "pong" });
                 return true; // Keep the channel open for async response
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
             if (currentCss === eval(message.element + 'CssOn')) responseText = "visible";
             else if (currentCss === eval(message.element + 'CssOff')) responseText = "hidden";
             else if ((message.element === "youtubeThumbnails" || message.element === "youtubeNotifications")) {
                 if (currentCss === eval(message.element + 'CssBlur')) responseText = "blur";
                 else if (currentCss === eval(message.element + 'CssBlack')) responseText = (message.element === "youtubeNotifications" && youtubeNotificationsCssBlack === youtubeNotificationsCssOff) ? "hidden" : "black";
             }
             sendResponse({text: responseText}); return false;
         }
         if (message.method === "change" && message.element) {
             if (currentStyleElement) { const cssOn = eval(message.element + 'CssOn'); const cssOff = eval(message.element + 'CssOff'); currentStyleElement.textContent = (currentStyleElement.textContent === cssOn) ? cssOff : cssOn; }
             else { createStyleElement(styleName, eval(message.element + 'CssOff')); }
         } else if (message.method === "changeMultiToggle" && message.element && message.action) { const cssToApply = eval(message.element + 'Css' + message.action); createStyleElement(styleName, cssToApply); }
         else if (message.method === "showAll" && message.element) { const cssOn = eval(message.element + 'CssOn'); createStyleElement(styleName, cssOn); }
         else if (message.method === "hideAll" && message.element) { const cssOff = eval(message.element + 'CssOff'); createStyleElement(styleName, cssOff); }
         else if (message.method === "startSelecting") { startSelecting(); }
         else if (message.method === "stopSelecting") { stopSelecting(message.cancelled); }
         else if (message.method === "removeCustomElement" && message.selector && currentSiteIdentifier) {
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

     // --- Element Selection Logic ---
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
             selectorDisplay.style.position = 'fixed'; selectorDisplay.style.background = 'rgba(0, 0, 0, 0.8)';
             selectorDisplay.style.color = 'white'; selectorDisplay.style.padding = '3px 6px';
             selectorDisplay.style.borderRadius = '3px'; selectorDisplay.style.zIndex = '2147483647';
             selectorDisplay.style.fontSize = '11px'; selectorDisplay.style.fontFamily = 'monospace';
             selectorDisplay.style.pointerEvents = 'none'; selectorDisplay.style.maxWidth = '300px';
             selectorDisplay.style.whiteSpace = 'nowrap'; selectorDisplay.style.overflow = 'hidden';
             selectorDisplay.style.textOverflow = 'ellipsis';
             document.body.appendChild(selectorDisplay);
         }
     }

     function createFeedbackContainer() {
         if (!feedbackContainer) {
             feedbackContainer = document.createElement('div');
             feedbackContainer.id = 'mindshield-feedback-container';
             feedbackContainer.style.position = 'fixed';
             feedbackContainer.style.top = '10px';
             feedbackContainer.style.left = '10px';
             feedbackContainer.style.background = 'rgba(0, 0, 0, 0.8)';
             feedbackContainer.style.color = 'white';
             feedbackContainer.style.padding = '10px';
             feedbackContainer.style.borderRadius = '5px';
             feedbackContainer.style.zIndex = '2147483647';
             feedbackContainer.style.fontFamily = 'Arial, sans-serif';
             feedbackContainer.style.fontSize = '14px';
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
             if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; // Ignore button clicks/touches
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

             // Keep within viewport
             currentX = Math.max(0, Math.min(currentX, window.innerWidth - feedbackContainer.offsetWidth));
             currentY = Math.max(0, Math.min(currentY, window.innerHeight - feedbackContainer.offsetHeight));

             feedbackContainer.style.left = `${currentX}px`;
             feedbackContainer.style.top = `${currentY}px`;
         }

         function stopDragging() {
             isDragging = false;
             feedbackContainer.style.transition = 'all 0.2s ease';
         }

         // Initialize position
         currentX = parseInt(feedbackContainer.style.left) || 10;
         currentY = parseInt(feedbackContainer.style.top) || 10;

         // Mouse events
         feedbackContainer.addEventListener('mousedown', startDragging);
         document.addEventListener('mousemove', drag);
         document.addEventListener('mouseup', stopDragging);

         // Touch events
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
             const selectorToRemove = sessionHiddenSelectors.pop(); // Remove most recent selector
             customSelectors = customSelectors.filter(s => s !== selectorToRemove);
             browser.storage.sync.set({ [customStorageKey]: customSelectors }, function() {
                 if (browser.runtime.lastError) {
                     console.error("Error removing custom selector from storage:", browser.runtime.lastError);
                 } else {
                     applyCustomElementStyles(currentSiteIdentifier, customSelectors);
                     console.log(`Undid hiding selector for ${currentSiteIdentifier}: ${selectorToRemove}`);
                     if (sessionHiddenSelectors.length > 0) {
                         updateFeedbackMessage('Element hidden', true); // Keep Undo button if more to undo
                     } else {
                         updateFeedbackMessage('Click element to hide it'); // No more to undo
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
         document.addEventListener('mousemove', highlightElement, true);
         document.addEventListener('touchstart', highlightElement, { capture: true, passive: true });
         document.addEventListener('click', selectElementOnClick, true);
         document.addEventListener('touchend', selectElementOnTap, true);
         document.body.classList.add('mindshield-selecting');
     }

     function stopSelecting(cancelled = false) {
         if (!isSelecting) return;
         isSelecting = false;
         console.log("Stopping element selection mode.");
         document.removeEventListener('mousemove', highlightElement, true);
         document.removeEventListener('touchstart', highlightElement, { capture: true });
         document.removeEventListener('click', selectElementOnClick, true);
         document.removeEventListener('touchend', selectElementOnTap, true);
         if (feedbackContainer) {
             feedbackContainer.removeEventListener('mousedown', startDragging);
             feedbackContainer.removeEventListener('touchstart', startDragging);
             feedbackContainer.remove();
             feedbackContainer = null;
         }
         document.removeEventListener('mousemove', drag);
         document.removeEventListener('mouseup', stopDragging);
         document.removeEventListener('touchmove', drag);
         document.removeEventListener('touchend', stopDragging);
         if (highlightOverlay) { highlightOverlay.remove(); highlightOverlay = null; }
         if (selectorDisplay) { selectorDisplay.remove(); selectorDisplay = null; }
         currentHighlightedElement = null;
         sessionHiddenSelectors = []; // Clear session selectors
         document.body.classList.remove('mindshield-selecting');
         const tempStyle = document.getElementById(highlightStyleId); if(tempStyle) tempStyle.remove();
         if (cancelled) {
             browser.runtime.sendMessage({ method: "selectionCanceled" }).catch(e => console.debug("Popup likely closed:", e));
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
         // Ghost click prevention
         if (Date.now() - lastTapTime < 500) { event.preventDefault(); event.stopPropagation(); console.log("Ghost click prevented."); return; }
         // Must be in selecting mode
         if (!isSelecting) return;

         // Ignore clicks on feedback container or its buttons
         if (event.target === feedbackContainer || event.target.closest('#mindshield-feedback-container') || event.target.tagName === 'BUTTON') {
             console.log("Click on feedback container or button ignored.");
             return;
         }

         // Check if the click happened directly on the element we last highlighted
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

         // Record tap time for ghost click prevention
         lastTapTime = Date.now();

         // Ignore taps on feedback container or its buttons
         if (event.target === feedbackContainer || event.target.closest('#mindshield-feedback-container') || event.target.tagName === 'BUTTON') {
             console.log("Tap on feedback container or button ignored.");
             return;
         }

         // Use the element that was highlighted *before* the touchend event started
         const elToSelect = currentHighlightedElement;

         // If no element was highlighted when the tap ended, ignore
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
                 sessionHiddenSelectors.push(selector); // Add to session tracking
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
