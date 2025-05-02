// src/pages/ProfileEdit.jsx
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/auth/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const authContext = useContext(AuthContext);
  const { user, loading: authLoading, loadUser, error: authError } = authContext;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Effect to populate form - ONLY populates form now
  useEffect(() => {
    if (user && !authLoading) {
      console.log("ProfileEdit: Populating form with user data", user);
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
      });
      // --- Removed alert clearing logic from here ---
    }
    // Still depends on user and loading state to know when to populate
  }, [user, authLoading]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear alert when user starts typing again
    if (alert.message) setAlert({ type: '', message: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert({ type: '', message: '' }); // Clear previous alerts

    const updateData = { name: formData.name, bio: formData.bio };

    try {
      console.log('ProfileEdit: Sending PUT /profile with data:', updateData);
      const res = await axios.put('/profile', updateData);
      console.log('ProfileEdit: Update successful', res.data);

      // Set success alert
      const successMessage = `Profile updated successfully! ${res.data.bonusAwarded > 0 ? `You earned ${res.data.bonusAwarded} profile completion credits!` : ''}`;
      setAlert({ type: 'success', message: successMessage });

      // Refresh user data in context
      if(loadUser) {
          console.log("ProfileEdit: Calling loadUser() to refresh context...");
          loadUser();
      }

      // --- Optional: Clear success message after a delay ---
      const timerId = setTimeout(() => {
          setAlert({ type: '', message: '' }); // Clear alert after 4 seconds
      }, 4000);
      // Optional: Store timerId if you need to clear it on component unmount
      // return () => clearTimeout(timerId); // Only needed if timeout might outlive component
      // -----------------------------------------------------

    } catch (err) {
      const errorMsg = err.response?.data?.errors ? err.response.data.errors.map(er => er.msg).join(', ') : err.response?.data?.msg || err.message || 'Failed to update profile.';
      console.error('ProfileEdit: Update failed:', errorMsg);
      setAlert({ type: 'error', message: `Error: ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  // (Loading/Error checks remain the same)
  if (authLoading || (!user && !authError)) { return <div className="text-center mt-20 animate-pulse text-gray-500">Loading Profile...</div>; }
  if (authError && !user) { return <div className="text-center mt-10 text-red-500 bg-red-100 p-4 rounded border border-red-300">Error loading profile data. Please try logging in again.</div>;}
  if (!user) { return <div className="text-center mt-10 text-orange-500">Profile data not available.</div>; }

  return (
    <div className="max-w-2xl mx-auto mt-5">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Profile</h1>

      {/* Alert Display */}
      {alert.message && (
         <div className={`p-4 mb-4 text-sm rounded-lg border ${ alert.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`} role="alert">
             {alert.message}
         </div>
      )}

      <form onSubmit={onSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        {/* Display Only Section */}
        <div className="mb-4 border-b pb-4">
             {/* ... (Account Info remains the same) ... */}
             <h3 className="text-lg font-semibold text-gray-700 mb-2">Account Information</h3>
            <p className="text-sm mb-1"><span className="font-semibold text-gray-600 w-40 inline-block">Email:</span> <span className="text-gray-800">{user.email}</span></p>
            <p className="text-sm mb-1"><span className="font-semibold text-gray-600 w-40 inline-block">Role:</span> <span className="text-gray-800">{user.role}</span></p>
            <p className="text-sm mb-1"><span className="font-semibold text-gray-600 w-40 inline-block">Credits:</span> <span className="text-gray-800 font-bold">{user.credits ?? 'N/A'}</span></p>
            <p className="text-sm mb-1"><span className="font-semibold text-gray-600 w-40 inline-block">Joined:</span> <span className="text-gray-800">{new Date(user.date).toLocaleDateString()}</span></p>
            <p className="text-sm"><span className="font-semibold text-gray-600 w-40 inline-block">Completion Bonus:</span> <span className={`font-medium ${user.profileCompleted ? 'text-green-600' : 'text-orange-600'}`}>{user.profileCompleted ? 'Awarded' : 'Not Yet Awarded'}</span></p>
        </div>

         {/* Editable Fields Section */}
        <div className="mb-4 pt-2">
           {/* ... (Name input remains the same) ... */}
           <h3 className="text-lg font-semibold text-gray-700 mb-2">Editable Information</h3>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name <span className="text-red-500">*</span></label>
          <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" id="name" type="text" placeholder="Your Name" name="name" value={formData.name} onChange={onChange} required />
        </div>
        <div className="mb-6">
           {/* ... (Bio textarea remains the same) ... */}
           <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">Bio <span className="text-xs text-gray-500 font-medium">(Complete this to earn credits!)</span></label>
           <textarea className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" id="bio" placeholder="Tell us a little about yourself... (Max 500 characters)" name="bio" value={formData.bio} onChange={onChange} rows="5" maxLength="500"></textarea>
           {!user.profileCompleted && !formData.bio && ( <p className="text-xs text-orange-600 mt-1">Add a bio to complete your profile and earn profile completion credits!</p> )}
        </div>
        <div className="flex items-center justify-end mt-6">
           {/* ... (Submit button remains the same) ... */}
           <button type="submit" disabled={isSubmitting || authLoading} className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${isSubmitting || authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSubmitting ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;