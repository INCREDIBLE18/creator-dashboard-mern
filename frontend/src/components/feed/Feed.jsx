// src/components/feed/Feed.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/auth/AuthContext';
import FeedItem from './FeedItem'; // Import the FeedItem component

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authContext = useContext(AuthContext);
  // const { isAuthenticated } = authContext; // Keep if needed later

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      console.log('Feed.jsx: Fetching /feed...'); // Log updated path
      try {
        // --- CHANGE IS HERE ---
        // Use path relative to the baseURL ('/api') set in AuthState.jsx
        const res = await axios.get('/feed'); // Changed from '/api/feed'
        // --------------------

        console.log('Feed.jsx: Received feed data:', res.data);
        setPosts(Array.isArray(res.data) ? res.data : []); // Ensure posts is always an array
      } catch (err) {
        // Axios error objects have a 'response' property for server errors
        const errorMsg = err.response
            ? `Status ${err.response.status}: ${JSON.stringify(err.response.data)}`
            : `Network/Request Error: ${err.message}`;
        console.error('Feed.jsx: Error fetching feed:', errorMsg);
        setError('Failed to load feed. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []); // Empty dependency array means this runs once on mount

  // --- Render Logic ---

  if (loading) {
    return <div className="text-center mt-10 animate-pulse text-gray-500">Loading Feed...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600 bg-red-100 p-4 rounded border border-red-300">{error}</div>;
  }

  if (!posts || posts.length === 0) {
     return <div className="text-center mt-10 text-gray-500">No posts available in the feed right now.</div>;
  }

  return (
    <div className="mt-6 max-w-2xl mx-auto"> {/* Constrain width */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Aggregated Feed</h2>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2"> {/* Scrollable container */}
        {/* Map over the posts and render FeedItem for each */}
        {posts.map((post) => (
          <FeedItem key={post?.id || Math.random()} post={post} /> // Use optional chaining and fallback key
        ))}
      </div>
    </div>
  );
};

export default Feed;