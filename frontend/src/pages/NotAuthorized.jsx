import React from 'react';
import { Link } from 'react-router-dom';
const NotAuthorized = () => {
    return (
        <div className="text-center mt-20">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-700 mb-6">You do not have permission to view this page.</p>
            <Link to="/dashboard" className="text-indigo-600 hover:underline">
                Return to Dashboard
            </Link>
        </div>
    );
};
export default NotAuthorized;