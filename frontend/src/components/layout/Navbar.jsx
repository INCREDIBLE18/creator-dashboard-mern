// src/components/layout/Navbar.jsx
import React, { useContext, Fragment } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  // Make sure 'user' is destructured from context
  const { isAuthenticated, logout, user } = authContext;

  const onLogout = () => {
    logout();
  };

  // Links to show when user IS logged in
  const authLinks = (
    <Fragment>
      <li className="mx-2 my-1 sm:my-0 text-gray-300">
        Hello, {user && user.name}! {/* Display username */}
      </li>
      <li className="mx-2 my-1 sm:my-0">
         <Link to='/dashboard' className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out">Dashboard</Link>
      </li>
      <li className="mx-2 my-1 sm:my-0">
           <Link to='/profile/edit' className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out">Edit Profile</Link>
      </li>

      {/* --- Conditionally Render Admin Links --- */}
      {user && user.role === 'Admin' && (
          <Fragment>
              <li className="mx-2 my-1 sm:my-0 border-l border-gray-600 pl-2"> {/* Optional separator */}
                 <span className="text-xs text-yellow-400 block sm:inline">Admin:</span>
              </li>
              <li className="mx-2 my-1 sm:my-0">
                 <Link to='/admin/users' className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out">Users</Link>
              </li>
               <li className="mx-2 my-1 sm:my-0">
                 <Link to='/admin/reports' className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out">Reports</Link>
              </li>
          </Fragment>
      )}
      {/* -------------------------------------- */}

      <li className="mx-2 my-1 sm:my-0">
        <a onClick={onLogout} href="#!" className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out cursor-pointer">
          Logout
        </a>
      </li>
    </Fragment>
  );

  // Links to show when user IS NOT logged in
  const guestLinks = (
    <Fragment>
      <li className="mx-2 my-1 sm:my-0">
        <Link to='/register' className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out">Register</Link>
      </li>
      <li className="mx-2 my-1 sm:my-0">
        <Link to='/login' className="px-3 py-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out">Login</Link>
      </li>
    </Fragment>
  );

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <h1 className="text-xl font-semibold">
            <Link to='/'>Creator Dashboard</Link>
        </h1>
        <ul className="flex flex-col sm:flex-row items-center mt-2 sm:mt-0">
            {/* Check loading state from context if needed before rendering links */}
            {isAuthenticated ? authLinks : guestLinks}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;