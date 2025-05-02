// src/components/feed/FeedItem.jsx
import React, { useContext, useState, useEffect } from 'react';
import SavedContext from '../../context/saved/SavedContext';
import AuthContext from '../../context/auth/AuthContext';
import axios from 'axios';

// --- Helper Functions ---
const formatDate = (isoString) => { if (!isoString) return 'Unknown date'; try { return new Date(isoString).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }); } catch (error) { console.error("Error formatting date:", isoString, error); return 'Invalid date'; } };
const getSourceInfo = (source) => { switch(String(source).toLowerCase()) { case 'reddit': return { color: 'bg-orange-100 text-orange-700 border border-orange-300', icon: 'Reddit' }; case 'twitter/x': return { color: 'bg-sky-100 text-sky-700 border border-sky-300', icon: 'X' }; default: return { color: 'bg-gray-100 text-gray-700 border border-gray-300', icon: 'Link' }; } };
// ----------------------

const FeedItem = ({ post }) => {
  // Contexts
  const { savePost, unsavePost, savedPosts, loading: savedLoading } = useContext(SavedContext);
  const { loadUser, isAuthenticated } = useContext(AuthContext);

  // Props & ID
  const { id: feedId, postId: savedPostId, _id: databaseId, source = 'Unknown', title = 'No title available', link = '#', author = 'Unknown Author', timestamp, contentSnippet = '', imageUrl, score = 0 } = post || {};
  const effectivePostId = savedPostId || feedId || 'unknown_id';

  // State
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Effect to update saved state
  useEffect(() => {
    if (effectivePostId !== 'unknown_id') {
       setIsSaved(savedPosts.some(saved => saved.postId === effectivePostId));
       // Don't reset processing here, let finally blocks handle it
    }
  }, [savedPosts, effectivePostId]);

  const formattedDate = formatDate(timestamp);
  const sourceInfo = getSourceInfo(source);

  // --- Action Handlers ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (isProcessing || !isAuthenticated || isSaved) return;
    setIsProcessing(true);
    try { await savePost(post); }
    catch (error) { console.error("FeedItem Save Error:", error); /* Add user feedback? */ }
    finally { setIsProcessing(false); } // Ensure processing resets
  };

  const handleUnsave = async (e) => {
    e.preventDefault();
    if (isProcessing || !isAuthenticated || !isSaved) return;
    setIsProcessing(true);
    try { await unsavePost(effectivePostId); }
    catch(error) { console.error("FeedItem Unsave Error:", error); /* Add user feedback? */ }
    finally { setIsProcessing(false); } // Ensure processing resets
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (link && link !== '#' && navigator.clipboard) {
        navigator.clipboard.writeText(link)
            .then(() => { /* Change button text/state */ })
            .catch(err => { /* Handle error */ });
    } else { /* Handle no link */ }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    const buttonElement = e.currentTarget;
    const reportData = { postId: effectivePostId, source, title, link };
    if (!reportData.postId || reportData.postId === 'unknown_id' || !reportData.link || reportData.link === '#') { alert('Cannot report post: Invalid post data.'); return; }
    buttonElement.disabled = true; buttonElement.textContent = 'Reporting...'; buttonElement.classList.add('opacity-50');
    try {
        await axios.post('/posts/report', reportData);
        buttonElement.textContent = 'Reported'; buttonElement.classList.remove('hover:text-red-600', 'hover:bg-red-100');
        if (loadUser) { loadUser(); }
    } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Failed to report post.';
        alert(errorMsg); buttonElement.disabled = false; buttonElement.textContent = 'Report'; buttonElement.classList.remove('opacity-50');
        console.error("FeedItem: Error reporting post:", err.response?.data || err.message);
    }
  };

  // --- JSX Structure ---
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row mb-4 transition duration-150 ease-in-out hover:shadow-md">
      {/* Image Section */}
      {imageUrl && (
        <div className="flex-shrink-0 sm:w-32 h-32 sm:h-auto bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="" className="object-cover h-full w-full" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* --- THIS DIV CONTAINS THE CONTENT --- */}
        <div>
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 mb-2 gap-x-2">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sourceInfo.color}`}>{sourceInfo.icon}</span>
            <span className="truncate">by {author}</span>
            <span className="whitespace-nowrap">{formattedDate}</span>
          </div>
          {/* Title */}
          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-700 block mb-1">
            <h3 className="font-semibold text-lg text-gray-800 leading-tight">{title}</h3>
          </a>
          {/* Snippet */}
          {contentSnippet && (<p className="text-gray-600 text-sm mb-3 line-clamp-3">{contentSnippet}</p>)}
        </div>
        {/* ------------------------------------ */}

        {/* Footer */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">Score: {score}</span>
          <div className="flex space-x-1 sm:space-x-2">
             {/* Conditional Save/Unsave Button */}
             <button
                onClick={isSaved ? handleUnsave : handleSave}
                title={isSaved ? "Unsave Post" : "Save Post"}
                disabled={isProcessing || savedLoading || !isAuthenticated}
                className={`p-1 px-2 text-xs sm:text-sm rounded transition duration-150 ease-in-out flex items-center justify-center min-w-[70px] ${ isProcessing || savedLoading || !isAuthenticated ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isSaved ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600' }`}
             >
                 {isProcessing ? ( <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> )
                  : ( isSaved ? <><span className="mr-1">★</span>Unsave</> : <><span className="mr-1">☆</span>Save</> )
                 }
             </button>
             <button onClick={handleShare} title="Share Post" className="text-gray-500 hover:text-green-600 p-1 text-xs sm:text-sm rounded hover:bg-green-100 transition duration-150 ease-in-out">Share</button>
             <button onClick={handleReport} title="Report Post" className="text-gray-500 hover:text-red-600 p-1 text-xs sm:text-sm rounded hover:bg-red-100 transition duration-150 ease-in-out">Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedItem;