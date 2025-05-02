// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/auth/AuthContext';

const Login = () => {
  const authContext = useContext(AuthContext);
  const { login, error, clearErrors, isAuthenticated } = authContext;
  const navigate = useNavigate();

  const [user, setUser] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  // --- Add submitting state ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --------------------------

  const { email, password } = user;

  useEffect(() => {
    // console.log('(Login.jsx useEffect) Running effect. isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      // console.log('(Login.jsx useEffect) User authenticated, navigating to dashboard...');
      // Navigate immediately, don't wait for potential state resets below
      navigate('/dashboard');
      return; // Exit effect early after navigation
    }

    if (error) {
      const errorMsg = Array.isArray(error) ? error.map(e => e.msg).join(', ') : error.msg || 'An error occurred';
      setFormError(`Login Error: ${errorMsg}`);
      // console.error('(Login.jsx useEffect) Login error detected:', errorMsg);
      clearErrors();
      setIsSubmitting(false); // Ensure submitting is false if error occurs
    }
    // We only want redirection based on isAuthenticated changing, or error display
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isAuthenticated, navigate]); // Removed clearErrors from deps


  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
     if (formError) setFormError('');
  };

  const onSubmit = async (e) => { // <-- Make onSubmit async
    console.log('--- LOGIN FORM ONSUBMIT ENTERED ---');
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit if already submitting

    setFormError('');
    if (email === '' || password === '') {
       setFormError('Please enter both email and password');
       return;
    }

    setIsSubmitting(true); // <-- Disable button
    console.log('(Login.jsx onSubmit) Calling context login action with:', { email }); // Log email only

    try {
       // Call the login action from the context
       await login({ // <-- await the login action
         email,
         password,
       });
       // If login succeeds, the useEffect above will handle the redirect.
       // If login fails, the useEffect will handle the error.
       // We might not need to explicitly set isSubmitting false here if redirect happens,
       // but we will in the finally block just in case.
    } catch (submitError) {
         // This catch block might not be strictly necessary if AuthState handles errors well,
         // but good for safety.
         console.error("Login submit catch block:", submitError);
         setFormError('An unexpected error occurred during login.');
         setIsSubmitting(false); // Ensure button re-enabled on unexpected error
    } finally {
         // Ensure button is re-enabled if component doesn't unmount via redirect
         // Add a slight delay in case redirect takes time? Or rely on useEffect.
         // For safety:
         // setIsSubmitting(false);
         // Let's rely on useEffect setting it false if login fails and component stays mounted.
         // If login succeeds, component unmounts anyway due to navigation.
    }
  };

  return (
     <div className="max-w-md mx-auto mt-8 sm:mt-12">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Account <span className="text-indigo-600">Login</span>
      </h1>
      <form onSubmit={onSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{formError}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address <span className="text-red-500">*</span></label>
          <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" id="email" type="email" placeholder="your.email@example.com" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password <span className="text-red-500">*</span></label>
          <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" id="password" type="password" placeholder="******************" name="password" value={password} onChange={onChange} required />
        </div>
        <div className="flex items-center justify-between">
          <button // <-- Changed to button element for easier text change
            type="submit"
            disabled={isSubmitting} // <-- Disable button when submitting
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full cursor-pointer transition duration-150 ease-in-out flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} // <-- Add disabled styles
          >
            {isSubmitting && ( // Show spinner when submitting
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            )}
            {isSubmitting ? 'Logging In...' : 'Login'} {/* Change text */}
          </button>
        </div>
         <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{' '} <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Register here</Link>
        </p>
      </form>
    </div>
  );
};
export default Login;