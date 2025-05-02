// src/components/dashboard/RecentActivity.jsx
import React, { useContext, useEffect } from 'react';
import AuthContext from '../../context/auth/AuthContext';

// --- Helper Functions ---
const formatTimestamp = (isoString) => { if (!isoString) return ''; try { return new Date(isoString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch (error) { return 'Invalid date'; } };
const formatActivity = (log) => { if (!log) return null; const time = formatTimestamp(log.timestamp); const details = log.details || {}; switch (log.actionType) { case 'LOGIN': return `Logged in on ${time}`; case 'SAVE_POST': return `Saved "${details.title || details.postId || 'post'}" from ${details.source || '?'} on ${time}`; case 'REPORT_POST': return `Reported "${details.title || details.postId || 'post'}" from ${details.source || '?'} on ${time}`; case 'UPDATE_PROFILE': return `Profile updated on ${time}`; case 'COMPLETE_PROFILE': return `Profile completed! (+${details.pointsAwarded || '?'} credits) on ${time}`; default: return `Performed action: ${log.actionType} on ${time}`; } };
// ----------------------

const RecentActivity = () => {
    const authContext = useContext(AuthContext);
    // Get user object to access its ID, activity state, loading state, and action
    const { activity, activityLoading, getRecentActivity, user, error: authError } = authContext; // Added authError

    // --- UPDATED Use Effect ---
    // Fetch activity logs when the user ID becomes available or the fetch function reference changes
    useEffect(() => {
        // Fetch only if we have a user ID (meaning user is loaded)
        // AND the getRecentActivity function is available from context
        if (user?._id && getRecentActivity) {
            console.log(`RecentActivity useEffect [user._id changed]: Calling getRecentActivity()`);
            getRecentActivity();
        } else {
            console.log(`RecentActivity useEffect [user._id changed]: Conditions not met (User ID: ${user?._id}, GetActivityFn: ${!!getRecentActivity})`);
        }
        // Depend on the USER ID (primitive) and the stable function reference from context
    }, [user?._id, getRecentActivity]); // <-- DEPEND ON user._id and stable function reference
    // --------------------------


    // --- Render Logic ---
    // Display Auth Error if it's related to activity loading perhaps?
    const displayError = authError === 'Could not load recent activity.' ? authError : null;

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Recent Activity</h3>
            {/* Removed manual refresh button */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {/* Show loading indicator */}
                {activityLoading ? (
                    <p className="text-gray-500 animate-pulse">Loading activity...</p>
                 ) : displayError ? ( // Show specific error if exists
                     <p className="text-red-500">{displayError}</p>
                 ) : !activity || activity.length === 0 ? (
                    // Show message if not loading, no error, and activity is empty
                    <p className="text-gray-500">No recent activity found.</p>
                ) : (
                    // Render list if loading finished, no error, and activity has items
                    <ul className="space-y-2">
                        {activity.map((log) => (
                            <li key={log._id} className="text-sm text-gray-700 border-b border-gray-100 pb-1 last:border-b-0">
                                {formatActivity(log)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;