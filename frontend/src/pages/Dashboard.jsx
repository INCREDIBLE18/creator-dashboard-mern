// src/pages/Dashboard.jsx
import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/auth/AuthContext';
import SavedContext from '../context/saved/SavedContext';
import Feed from '../components/feed/Feed';
import FeedItem from '../components/feed/FeedItem';
import RecentActivity from '../components/dashboard/RecentActivity'; // 1. Import RecentActivity

const Dashboard = () => {
  // Get Auth context details
  const authContext = useContext(AuthContext);
  const { user, loading: authLoading, loadUser } = authContext;

  // Get Saved Posts Context details
  const savedContext = useContext(SavedContext);
  const { savedPosts, loading: savedPostsLoading, getSavedPosts } = savedContext;

  // Effect to load user if not already loaded
  useEffect(() => {
     if (!user && !authLoading) {
         console.log('(Dashboard.jsx useEffect [Auth]) User not found, calling loadUser()');
         loadUser();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Effect to load saved posts (dependent on user)
  useEffect(() => {
      if (user) {
          console.log('(Dashboard.jsx useEffect [Saved]) User loaded, calling getSavedPosts()');
          getSavedPosts();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  // Render Logic
  if (authLoading && !user) {
    return <div className="text-center mt-20">Loading Dashboard Data...</div>;
  }
  if (!user) {
      return <div className='text-center mt-10 text-red-500'>Could not load user data. Please try logging in again.</div>
  }

  // Add log to check state just before render
  console.log('(Dashboard.jsx rendering) savedPosts length:', savedPosts?.length, 'savedPostsLoading:', savedPostsLoading);


  // Main dashboard content
  return (
    <div className='mt-5'>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* User Info Section */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-2xl mb-3 text-indigo-700">Welcome, {user.name}!</h2>
        <p className="mb-1"><span className="font-semibold">Email:</span> {user.email}</p>
        <p className="mb-1"><span className="font-semibold">Role:</span> {user.role}</p>
        <p className="mb-4"><span className="font-semibold">Credits:</span> {user.credits !== undefined ? user.credits : 'N/A'}</p>
      </div>

      {/* --- Grid for Saved Posts & Recent Activity --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Saved Posts Section */}
        <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Saved Posts</h2>
            {savedPostsLoading ? (
                <div className="text-center text-gray-500 animate-pulse">Loading saved posts...</div>
            ) : savedPosts && savedPosts.length > 0 ? (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {savedPosts.map(post => (
                        <FeedItem key={post._id || post.postId} post={post} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">You haven't saved any posts yet.</p>
            )}
        </div>

        {/* --- Recent Activity Section --- */}
        <div className="bg-white shadow-md rounded p-6">
             {/* 2. Render the RecentActivity component here */}
             <RecentActivity />
        </div>
        {/* ----------------------------- */}

      </div>
      {/* --- End Grid --- */}


      {/* Feed Section (Aggregated Feed) - Full width below */}
      <Feed />

      {/* Admin Specific Section */}
      {user.role === 'Admin' && (
           <div className='mt-8 p-6 border-l-4 border-yellow-500 bg-yellow-50 shadow-md rounded'>
              <h2 className="text-2xl mb-3 text-yellow-800">Admin Panel Access</h2>
               <p className='text-yellow-700'>Admin-specific controls available via Navbar.</p>
           </div>
       )}

    </div>
  );
};

export default Dashboard;