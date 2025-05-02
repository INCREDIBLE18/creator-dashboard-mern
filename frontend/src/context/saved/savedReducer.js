// src/context/saved/savedReducer.js
import {
    GET_SAVED_POSTS_SUCCESS,
    SAVE_POST_SUCCESS,
    UNSAVE_POST_SUCCESS,
    POST_ERROR,
    CLEAR_SAVED_POSTS,
    SET_POST_LOADING
} from '../types';

export default (state, action) => {
    switch(action.type) {
        case SET_POST_LOADING:
            return {
                ...state,
                loading: true
            };
        case UNSAVE_POST_SUCCESS:
                console.log('--- REDUCER: UNSAVE_POST_SUCCESS ---', 'Payload (postId):', action.payload);
                console.log('Saved posts BEFORE filter:', state.savedPosts);
                const updatedSavedPosts = state.savedPosts.filter(
                    post => post.postId !== action.payload // Ensure postId exists on items
                );
                console.log('Saved posts AFTER filter:', updatedSavedPosts); // See if item was removed
            return {
                    ...state,
                    savedPosts: updatedSavedPosts, // Use the new array
                    loading: false,
                    error: null
            };
        case SAVE_POST_SUCCESS:
            // Add newly saved post to the beginning of the array
            return {
                ...state,
                // Avoid adding duplicates if already present (optional safety)
                savedPosts: [action.payload, ...state.savedPosts.filter(p => p.postId !== action.payload.postId)],
                loading: false,
                error: null
            };
        case UNSAVE_POST_SUCCESS: // For future implementation
            return {
                ...state,
                // Filter out the unsaved post using its unique DB _id or postId
                savedPosts: state.savedPosts.filter(p => p.postId !== action.payload.postId), // Assuming payload contains postId
                loading: false,
                error: null
            };
        case POST_ERROR:
            return {
                ...state,
                error: action.payload, // Store error message
                loading: false
            };
        case CLEAR_SAVED_POSTS:
            // Reset state on logout
            return {
                ...state,
                savedPosts: [],
                error: null,
                loading: false // Or true if you refetch on login
            };
        // Inside savedReducer.js
        case GET_SAVED_POSTS_SUCCESS:
            console.log('--- REDUCER: GET_SAVED_POSTS_SUCCESS CASE REACHED ---', 'Payload length:', action.payload?.length); // <-- Add Log
            return {
                ...state,
                savedPosts: action.payload,
                loading: false, // Sets loading false
                error: null
    };
        default:
            return state;
    }
}