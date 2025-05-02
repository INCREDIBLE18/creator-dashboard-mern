// src/context/saved/SavedState.jsx
import React, { useReducer, useContext, useEffect } from 'react';
import axios from 'axios';
import SavedContext from './SavedContext';
import savedReducer from './savedReducer';
import AuthContext from '../auth/AuthContext';

import {
    GET_SAVED_POSTS_SUCCESS,
    SAVE_POST_SUCCESS,
    UNSAVE_POST_SUCCESS, // Ensure this is imported
    POST_ERROR,
    CLEAR_SAVED_POSTS,
    SET_POST_LOADING
} from '../types';

// Set Axios Defaults
axios.defaults.baseURL = import.meta.env.VITE_API || 'http://localhost:5000/api';

const SavedState = props => {
    const initialState = {
        savedPosts: [],
        loading: true,
        error: null
    };

    const [state, dispatch] = useReducer(savedReducer, initialState);
    const authContext = useContext(AuthContext);
    const { isAuthenticated, loadUser } = authContext;

    // --- Actions ---

    const setLoading = () => dispatch({ type: SET_POST_LOADING });

    const getSavedPosts = async () => {
        console.log('SavedState: getSavedPosts ACTION - STARTING'); // <-- Log 1
        setLoading(); // Dispatches SET_POST_LOADING
        try {
            console.log('SavedState: getSavedPosts ACTION - Making API call to /posts/saved...'); // <-- Log 2
            const res = await axios.get('/posts/saved');
            console.log('SavedState: getSavedPosts ACTION - API call SUCCEEDED. Response:', res.data); // <-- Log 3
            dispatch({
                type: GET_SAVED_POSTS_SUCCESS,
                payload: res.data
            });
            console.log('SavedState: getSavedPosts ACTION - Dispatched GET_SAVED_POSTS_SUCCESS'); // <-- Log 4
        } catch (err) {
            const errorMsg = err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
            console.error('SavedState: getSavedPosts ACTION - API call FAILED:', errorMsg); // <-- Log 5 (Error)
            dispatch({
                type: POST_ERROR,
                payload: err.response ? err.response.data.msg || JSON.stringify(err.response.data.errors) : 'Server Error fetching saved posts'
            });
            console.log('SavedState: getSavedPosts ACTION - Dispatched POST_ERROR'); // <-- Log 6 (Error)
        } finally {
            // Optional: Although reducer sets loading false, log here too for clarity
            console.log('SavedState: getSavedPosts ACTION - FINALLY block reached.'); // <-- Log 7
        }
    };

    const savePost = async (postData) => {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const body = JSON.stringify({
            postId: postData.id || postData.postId, // Handle both possible ID names
            source: postData.source,
            title: postData.title,
            link: postData.link,
            author: postData.author,
            contentSnippet: postData.contentSnippet
        });

        try {
            console.log('SavedState: Sending POST /posts/save', body);
            const res = await axios.post('/posts/save', body, config);
            console.log('SavedState: Save Post Response Status:', res.status);

            // Use returned post from backend (includes _id) if available
            const savedPostData = res.data.savedPost ? res.data.savedPost : { ...postData, postId: postData.id || postData.postId }; // Ensure payload has postId

            dispatch({
                type: SAVE_POST_SUCCESS,
                payload: savedPostData
            });
            console.log('SavedState: Dispatched SAVE_POST_SUCCESS');

            if (res.status === 201 && loadUser) { // Awarded credits only on 201
               console.log('SavedState: New post saved, calling loadUser() to update credits...');
               loadUser();
            } else { console.log('SavedState: Post was already saved (status 200), not calling loadUser().'); }

        } catch (err) {
            console.error("SavedState Error saving post:", err.response ? err.response.data : err.message);
             if (err.response && (err.response.status === 200 || err.response.status === 400) && err.response.data.msg?.includes('already saved')) {
                 console.log('Post was already saved.');
                 // Optional: dispatch success here if needed for UI consistency
             } else {
                  dispatch({ type: POST_ERROR, payload: err.response ? err.response.data.msg || JSON.stringify(err.response.data.errors) : 'Server Error saving post' });
             }
        }
    };

    // --- ADD UNSAVE POST ACTION ---
    const unsavePost = async (postId) => {
        // setLoading(); // Optional: loading state for unsave?
        if (!postId) {
            console.error("Unsave Error: postId is missing.");
            dispatch({ type: POST_ERROR, payload: 'Cannot unsave post without ID' });
            return;
        }
        try {
            console.log(`SavedState: Sending DELETE /posts/unsave/${postId}`);
            // Send DELETE request with postId in the URL
            await axios.delete(`/posts/unsave/${postId}`); // Requires auth token header

            // Dispatch success, passing the postId so reducer can filter
            dispatch({
                type: UNSAVE_POST_SUCCESS,
                payload: postId // Send the ID of the post that was unsaved
            });
             console.log(`SavedState: Dispatched UNSAVE_POST_SUCCESS for ${postId}`);
            // Optional: User feedback

        } catch (err) {
             console.error("SavedState Error unsaving post:", err.response ? err.response.data : err.message);
             dispatch({
                 type: POST_ERROR,
                 payload: err.response ? err.response.data.msg || JSON.stringify(err.response.data.errors) : 'Server Error unsaving post'
             });
        }
    };
    // -----------------------------


    const clearSavedPosts = () => {
          console.log('SavedState: Clearing saved posts state');
          dispatch({ type: CLEAR_SAVED_POSTS });
    }

    // Effect to clear state on Auth Logout
    useEffect(() => {
        if (authContext.isAuthenticated === false) {
            clearSavedPosts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext.isAuthenticated]);


    return (
        <SavedContext.Provider
            value={{
                savedPosts: state.savedPosts,
                loading: state.loading,
                error: state.error,
                getSavedPosts,
                savePost,
                clearSavedPosts,
                unsavePost // <-- 4. Add unsavePost action here
            }}
        >
            {props.children}
        </SavedContext.Provider>
    );
};

export default SavedState;