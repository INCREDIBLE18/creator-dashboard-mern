// src/pages/admin/UserListPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define fetchUsers using useCallback so it can be safely used in useEffect
    // and also called directly by other functions like handleUpdateCredits
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log('UserListPage: Fetching /admin/users...');
        try {
            const res = await axios.get('/admin/users');
            console.log('UserListPage: Received users:', res.data);
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            const errorMsg = err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
            console.error('UserListPage: Error fetching users:', errorMsg);
            setError('Failed to load users list.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means the function itself doesn't change unless component remounts

    // Fetch users when component mounts
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // Include fetchUsers in dependency array

    // --- Handler for Update Credits Button ---
    const handleUpdateCredits = async (userId, currentCredits) => {
        // Prompt admin for new value, pre-fill with current value
        const newValueString = window.prompt(`Update credits for user ${userId}:`, currentCredits);

        // Check if prompt was cancelled
        if (newValueString === null) {
            console.log('Credit update cancelled.');
            return;
        }

        // Validate input - must be a non-negative integer
        const newCreditValue = parseInt(newValueString, 10);
        if (isNaN(newCreditValue) || newCreditValue < 0) {
            alert('Invalid input. Credits must be a whole number greater than or equal to 0.');
            return;
        }

        console.log(`Attempting to update user ${userId} credits to ${newCreditValue}`);
        try {
            // Send PUT request to backend
            await axios.put(`/admin/users/${userId}/credits`, { credits: newCreditValue });

            alert(`Successfully updated user ${userId} credits to ${newCreditValue}`);

            // Refresh the user list to show the change
            fetchUsers();

        } catch (err) {
            const errorMsg = err.response ? err.response.data.msg || JSON.stringify(err.response.data.errors) : err.message;
            console.error(`UserListPage: Error updating credits for ${userId}:`, errorMsg);
            alert(`Failed to update credits: ${errorMsg}`);
        }
    };
    // --------------------------------------


    // Render Logic
    if (loading && users.length === 0) { // Show loading only on initial load
        return <div className="text-center mt-10 animate-pulse text-gray-500">Loading Users...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-600 bg-red-100 p-4 rounded border border-red-300">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin: User Management</h1>

            {/* User Table */}
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Role</th>
                            <th className="px-5 py-3">Credits</th>
                            <th className="px-5 py-3">Joined</th>
                           {/* <th className="px-5 py-3">User ID</th> */} {/* Hide User ID if too long/not needed */}
                           {/* --- Add Actions Header --- */}
                           <th className="px-5 py-3">Actions</th>
                           {/* ------------------------ */}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-5 py-4 text-sm">{user.name}</td>
                                    <td className="px-5 py-4 text-sm">{user.email}</td>
                                    <td className="px-5 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-center">{user.credits}</td>
                                    <td className="px-5 py-4 text-sm">{new Date(user.date).toLocaleDateString()}</td>
                                    {/*<td className="px-5 py-4 text-sm text-gray-500">{user._id}</td>*/}

                                    {/* --- Add Actions Cell --- */}
                                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                                        <button
                                            onClick={() => handleUpdateCredits(user._id, user.credits)}
                                            title={`Set credits for ${user.name}`}
                                            className="text-indigo-600 hover:text-indigo-900 text-xs font-medium bg-indigo-100 hover:bg-indigo-200 rounded px-2 py-1"
                                        >
                                            Update Credits
                                        </button>
                                        {/* Add other action buttons later (e.g., Edit Role, Delete User) */}
                                    </td>
                                    {/* ----------------------- */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* Adjust colSpan if you hid User ID */}
                                <td colSpan="6" className="text-center py-10 text-gray-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserListPage;