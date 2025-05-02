// routes/feed.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// --- Helper Function to Fetch Reddit Data ---
const fetchRedditPosts = async (subreddit = 'webdev') => {
  try {
    // Fetching top posts from a subreddit's JSON endpoint
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`; // Get ~15 hot posts
    console.log(`Workspaceing Reddit: ${url}`);
    const response = await axios.get(url, {
        headers: { 'User-Agent': 'creator-dashboard-app/1.0' } // Reddit requires a User-Agent
    });

    if (response.data && response.data.data && response.data.data.children) {
      // Normalize Reddit data
      return response.data.data.children.map(post => ({
        id: `reddit_${post.data.id}`,
        source: 'Reddit',
        title: post.data.title,
        link: `https://www.reddit.com${post.data.permalink}`,
        author: post.data.author,
        timestamp: new Date(post.data.created_utc * 1000), // Convert UTC seconds to Date object
        contentSnippet: post.data.selftext.substring(0, 150) + (post.data.selftext.length > 150 ? '...' : ''), // Short snippet
        imageUrl: (post.data.thumbnail && post.data.thumbnail.startsWith('http')) ? post.data.thumbnail : null, // Basic image check
        score: post.data.score,
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Reddit data for r/${subreddit}:`, error.response ? error.response.status : error.message);
    return []; // Return empty array on error
  }
};

// --- Helper Function to Fetch Twitter/X Data (Requires Bearer Token) ---
const fetchTwitterPosts = async (query = 'webdevelopment') => {
  const token = process.env.TWITTER_BEARER_TOKEN;

  if (!token || token === "YOUR_TWITTER_BEARER_TOKEN") {
    console.warn('Twitter Bearer Token not configured in .env. Skipping Twitter fetch.');
    return []; // Skip if no token
  }

  try {
    // Using Twitter API v2 recent search endpoint (example)
    // You might adjust the query, fields, or endpoint based on your needs/API access
    // Here you can change per click fetch of twitter in the link max_results
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username`;
    console.log(`Workspaceing Twitter: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Basic check for data and includes
    if (response.data && response.data.data && response.data.includes && response.data.includes.users) {
      const users = response.data.includes.users.reduce((map, user) => {
         map[user.id] = user.username;
         return map;
      }, {});

      // Normalize Twitter data
      return response.data.data.map(tweet => ({
        id: `twitter_${tweet.id}`,
        source: 'Twitter/X',
        title: tweet.text.substring(0, 50) + (tweet.text.length > 50 ? '...' : ''), // Use text as title snippet
        link: `https://twitter.com/${users[tweet.author_id] || 'anyuser'}/status/${tweet.id}`,
        author: users[tweet.author_id] || 'Unknown',
        timestamp: new Date(tweet.created_at),
        contentSnippet: tweet.text,
        // imageUrl: null, // Add logic if you request media fields
        score: tweet.public_metrics ? tweet.public_metrics.like_count : 0, // Example: use like count as score
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Twitter data for query "${query}":`, error.response ? `${error.response.status} ${JSON.stringify(error.response.data)}` : error.message);
    return []; // Return empty array on error
  }
};


// --- Main Feed Route ---
// @route   GET api/feed
// @desc    Get aggregated feed from multiple sources
// @access  Public (for now, could be private later)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/feed hit');
    // Fetch from sources concurrently using Promise.allSettled
    // allSettled waits for all promises, even if some reject
    const results = await Promise.allSettled([
      fetchRedditPosts('webdev'), // Fetch from r/webdev
      fetchTwitterPosts('#webdevelopment OR #reactjs -is:retweet lang:en') // Example Twitter query
      // Add more sources here if needed later
    ]);

    let combinedFeed = [];

    // Process Reddit results
    if (results[0].status === 'fulfilled') {
      console.log(`Reddit fetch succeeded with ${results[0].value.length} posts.`);
      combinedFeed = combinedFeed.concat(results[0].value);
    } else {
      console.error('Reddit fetch failed:', results[0].reason);
    }

    // Process Twitter results
    if (results[1].status === 'fulfilled') {
      console.log(`Twitter fetch succeeded with ${results[1].value.length} posts.`);
      combinedFeed = combinedFeed.concat(results[1].value);
    } else {
      console.error('Twitter fetch failed:', results[1].reason);
    }

    // Sort the combined feed by timestamp (newest first)
    combinedFeed.sort((a, b) => b.timestamp - a.timestamp);

    console.log(`Returning combined feed with ${combinedFeed.length} posts.`);
    res.json(combinedFeed);

  } catch (err) {
    console.error('Error in GET /api/feed route:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;