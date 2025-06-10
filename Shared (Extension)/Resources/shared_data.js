//
//  shared_data.js
//  MindShield
//
//  Created by Ulrik Lyngs on 10/06/2025.
//

// Shared list of platforms the extension has specific toggles for.
const platformsWeTarget = ["youtube", "facebook", "x", "instagram", "linkedin", "whatsapp", "google", "reddit"];

// Shared list of all predefined elements that can be hidden across all targeted platforms.
const elementsThatCanBeHidden = [
    // YouTube
    "youtubeSearch", "youtubeSearchPredict", "youtubeRecVids", "youtubeThumbnails", "youtubeNotifications", "youtubeProfileImg",
    "youtubeShorts", "youtubeSubscriptions", "youtubeHistory", "youtubeExplore", "youtubeMore",
    "youtubeRelated", "youtubeSidebar", "youtubeComments", "youtubeAds", "youtubeViews", "youtubeLikes", "youtubeSubscribers",
    // X (Twitter)
    "xExplore", "xNotifications", "xTrends", "xFollow", "xTimeline",
    // Facebook
    "facebookFeed", "facebookWatch", "facebookNotifications", "facebookStories", "facebookChat", "facebookSponsored",
    // LinkedIn
    "linkedinNews", "linkedinNotifications", "linkedinFeed", "linkedinAds",
    // Instagram
    "instagramFeed", "instagramStories", "instagramMutedStories", "instagramExplore", "instagramReels", "instagramSuggestions", "instagramComments",
    // WhatsApp
    "whatsappPreview", "whatsappNotificationPrompt",
    // Google
    "googleAds", "googleBackground",
    // Reddit
    "redditFeed", "redditPopular", "redditAll", "redditRecent", "redditCommunities", "redditNotification", "redditChat", "redditTrending", "redditPopularCommunities"
];
