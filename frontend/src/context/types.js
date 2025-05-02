// src/context/types.js

// Authentication Action Types
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const USER_LOADED = 'USER_LOADED'; // User successfully loaded from token
export const AUTH_ERROR = 'AUTH_ERROR';   // Token failed validation or no token
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT = 'LOGOUT';
export const CLEAR_ERRORS = 'CLEAR_ERRORS'; // Clear any error messages

// Add other types later for Feed, Credits, etc. if needed
// export const GET_FEED_SUCCESS = 'GET_FEED_SUCCESS';
// export const UPDATE_CREDITS = 'UPDATE_CREDITS';
// Saved Post Action Types
export const GET_SAVED_POSTS_SUCCESS = 'GET_SAVED_POSTS_SUCCESS';
export const SAVE_POST_SUCCESS = 'SAVE_POST_SUCCESS';
export const UNSAVE_POST_SUCCESS = 'UNSAVE_POST_SUCCESS'; // For later
export const POST_ERROR = 'POST_ERROR'; // Generic error for post actions
export const CLEAR_SAVED_POSTS = 'CLEAR_SAVED_POSTS'; // e.g., on logout
export const SET_POST_LOADING = 'SET_POST_LOADING';

// Activity Log Action Types
export const GET_ACTIVITY_SUCCESS = 'GET_ACTIVITY_SUCCESS';
export const ACTIVITY_ERROR = 'ACTIVITY_ERROR';
export const SET_ACTIVITY_LOADING = 'SET_ACTIVITY_LOADING';
export const CLEAR_ACTIVITY = 'CLEAR_ACTIVITY'; // On logout