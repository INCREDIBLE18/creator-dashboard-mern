// src/pages/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import AuthContext from '../context/auth/AuthContext'; // Adjust path if needed

const Register = () => {
  // Get state and actions from AuthContext
  const authContext = useContext(AuthContext);
  const { register, error, clearErrors, isAuthenticated } = authContext;

  const navigate = useNavigate(); // Hook for programmatic navigation

  // Local state for the form inputs
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    password2: '', // For password confirmation
  });
  // Local state for client-side validation errors (optional)
  const [formError, setFormError] = useState('');

  const { name, email, password, password2 } = user;

  // Effect hook to handle redirection and errors
  useEffect(() => {
    // If user is authenticated, redirect to the dashboard
    if (isAuthenticated) {
      console.log('User authenticated, redirecting to dashboard...');
      navigate('/dashboard');
    }

    // If there's an error from the backend (e.g., user already exists)
    if (error) {
      // Display the error(s) - using alert for simplicity, consider a toast notification library
      const errorMsg = Array.isArray(error) ? error.map(e => e.msg).join(', ') : error.msg || 'An error occurred';
      alert(`Registration Error: ${errorMsg}`);
      setFormError(''); // Clear local form error if backend error occurs
      clearErrors(); // Clear the error state in the context
    }
    // Disable exhaustive-deps rule if navigate/clearErrors cause loops,
    // but ensure dependencies are correctly handled for your use case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isAuthenticated, navigate]); // Re-run effect if these values change


  // Update local state when form inputs change
  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
     if (formError) setFormError(''); // Clear local error on input change
  };

  // Handle form submission
  const onSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors

    // Basic client-side validation
    if (name === '' || email === '' || password === '') {
       setFormError('Please enter all fields');
       return;
    }
    if (password !== password2) {
       setFormError('Passwords do not match');
       return;
    }
     if (password.length < 6) {
       setFormError('Password must be at least 6 characters');
       return;
     }

    // If validation passes, call the register action from the context
    register({
      name,
      email,
      password,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-12">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Account <span className="text-indigo-600">Register</span>
      </h1>
      <form onSubmit={onSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        {/* Display local form errors */}
        {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{formError}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            id="name" type="text" placeholder="Your Name"
            name="name" value={name} onChange={onChange} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            id="email" type="email" placeholder="your.email@example.com"
            name="email" value={email} onChange={onChange} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Min. 6 characters)</span>
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            id="password" type="password" placeholder="******************"
            name="password" value={password} onChange={onChange} />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            id="password2" type="password" placeholder="******************"
            name="password2" value={password2} onChange={onChange} />
        </div>
        <div className="flex items-center justify-between">
          <input
            type="submit"
            value="Register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full cursor-pointer transition duration-150 ease-in-out"
          />
        </div>
         <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Login here
            </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;