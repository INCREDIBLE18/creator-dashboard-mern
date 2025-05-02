// src/context/auth/AuthState.jsx
import React, { useReducer, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import {
    REGISTER_SUCCESS, REGISTER_FAIL, USER_LOADED, AUTH_ERROR, LOGIN_SUCCESS, LOGIN_FAIL,
    LOGOUT, CLEAR_ERRORS, GET_ACTIVITY_SUCCESS, ACTIVITY_ERROR, SET_ACTIVITY_LOADING, CLEAR_ACTIVITY
} from '../types';

axios.defaults.baseURL = import.meta.env.VITE_API || 'http://localhost:5000/api';

const AuthState = (props) => {
    const initialState = {
        token: localStorage.getItem('token'), isAuthenticated: null, loading: true,
        user: null, error: null, activity: [], activityLoading: false
    };
    const [state, dispatch] = useReducer(authReducer, initialState);

    // --- Actions wrapped in useCallback ---

    // Load User
    const loadUser = useCallback(async (tokenOverride = null) => {
        // console.log('(AuthState) loadUser called'); // Removed debug log
        const token = tokenOverride || localStorage.getItem('token');
        if (token) { setAuthToken(token); }
        else { dispatch({ type: AUTH_ERROR }); return; }
        try {
            const res = await axios.get('/auth/user');
            dispatch({ type: USER_LOADED, payload: res.data });
        } catch (err) {
            dispatch({ type: AUTH_ERROR });
        }
    }, [dispatch]);

    // Register User
    const register = useCallback(async (formData) => {
        const config = { headers: { 'Content-Type': 'application/json' } };
        try {
            const res = await axios.post('/auth/register', formData, config);
            dispatch({ type: REGISTER_SUCCESS, payload: res.data });
            loadUser(res.data.token); // Pass token directly
        } catch (err) {
            const errorPayload = err.response?.data?.errors || [{ msg: 'Registration failed' }];
            dispatch({ type: REGISTER_FAIL, payload: errorPayload });
        }
    }, [dispatch, loadUser]);

    // Login User
    const login = useCallback(async (formData) => {
        console.log('--- AUTHSTATE LOGIN useCallback body ENTERED ---'); // <-- Log Added Here
        const config = { headers: { 'Content-Type': 'application/json' } };
        try {
            console.log('(AuthState.jsx login) Making API call to /auth/login'); // Keep log
            const res = await axios.post('/auth/login', formData, config);
            console.log('(AuthState.jsx login) API call successful, RESPONSE:', res.data); // Keep log
            dispatch({ type: LOGIN_SUCCESS, payload: res.data });
            console.log('(AuthState.jsx login) Dispatched LOGIN_SUCCESS'); // Keep log
            loadUser(res.data.token); // Pass token directly
            console.log('(AuthState.jsx login) Called loadUser() after login success'); // Keep log
        } catch (err) {
            console.error('(AuthState.jsx login) API call FAILED', err.response ? err.response.data : err.message); // Keep error log
            const errorPayload = err.response?.data?.errors || [{ msg: 'Login failed' }];
            dispatch({ type: LOGIN_FAIL, payload: errorPayload });
        }
    }, [dispatch, loadUser]); // Depends on dispatch and memoized loadUser

    // Logout User
    const logout = useCallback(() => {
        dispatch({ type: LOGOUT });
        setAuthToken();
    }, [dispatch]);

    // Clear Errors
    const clearErrors = useCallback(() => dispatch({ type: CLEAR_ERRORS }), [dispatch]);

    // Get Recent Activity
    const getRecentActivity = useCallback(async (limit = 15) => {
        if (!state.token) { dispatch({ type: CLEAR_ACTIVITY }); return; }
        dispatch({ type: SET_ACTIVITY_LOADING });
        try {
            const res = await axios.get(`/activity/me?limit=${limit}`);
            dispatch({ type: GET_ACTIVITY_SUCCESS, payload: res.data });
        } catch (err) {
            const errorPayload = 'Could not load recent activity.';
            console.error("getRecentActivity Error:", err.response?.data || err.message);
            dispatch({ type: ACTIVITY_ERROR, payload: errorPayload });
        }
    }, [dispatch, state.token]);


    // --- Effects ---
    useEffect(() => { loadUser(); }, [loadUser]); // Initial loadUser
    useEffect(() => {
        const syncLogout = (event) => { if (event.key === 'token' && !event.newValue) { logout(); } };
        window.addEventListener('storage', syncLogout);
        return () => { window.removeEventListener('storage', syncLogout); };
    }, [logout]); // Logout listener


    // --- Provider Value ---
    return (
        <AuthContext.Provider value={{
            token: state.token, isAuthenticated: state.isAuthenticated, loading: state.loading,
            user: state.user, error: state.error, activity: state.activity,
            activityLoading: state.activityLoading,
            // Pass memoized actions
            register, loadUser, login, logout, clearErrors, getRecentActivity
        }}>
            {props.children}
        </AuthContext.Provider>
    );
};
export default AuthState;