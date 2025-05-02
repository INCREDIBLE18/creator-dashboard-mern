// src/utils/setAuthToken.js
import axios from 'axios';

// This function takes a token...
// If the token exists, it adds it to the global Axios default headers.
// If the token does not exist (e.g., on logout), it removes the header.
const setAuthToken = (token) => {
  if (token) {
    // Apply the 'x-auth-token' header to every subsequent request if logged in
    axios.defaults.headers.common['x-auth-token'] = token;
    console.log('Token set in Axios headers'); // Optional: for debugging
  } else {
    // Delete the header if not logged in (or logging out)
    delete axios.defaults.headers.common['x-auth-token'];
    console.log('Token removed from Axios headers'); // Optional: for debugging
  }
};

export default setAuthToken;