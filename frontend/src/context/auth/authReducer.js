// src/context/auth/authReducer.js
import {
  // Auth Types
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  // Activity Types (Import the new types)
  GET_ACTIVITY_SUCCESS,
  ACTIVITY_ERROR,
  SET_ACTIVITY_LOADING,
  CLEAR_ACTIVITY // Also used indirectly by LOGOUT case now

} from '../types';

// The reducer function
export default (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false, // Auth loading finished
        user: action.payload,
      };

    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      console.log('--- REDUCER: LOGIN/REGISTER_SUCCESS CASE REACHED ---', 'Payload:', action.payload);
      if (action.payload && action.payload.token) {
        localStorage.setItem('token', action.payload.token);
        console.log('--- REDUCER: Token SHOULD be set in localStorage now ---');
      } else {
        console.error('--- REDUCER ERROR: No token found in payload! ---', action.payload);
      }
      return {
        ...state,
        ...action.payload, // Contains { token: '...' }
        isAuthenticated: true,
        loading: false, // Auth loading finished
      };

    case REGISTER_FAIL:
    case AUTH_ERROR: // Handles failed user load or failed activity load if using same error state
    case LOGIN_FAIL:
      console.log(`--- REDUCER: ${action.type} CASE REACHED ---`, 'Payload:', action.payload);
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false, // Auth loading finished (even if failed)
        user: null,
        error: action.payload, // Store general auth error
        // We could clear activity here too, but LOGOUT case handles it cleaner
      };

     case LOGOUT: // LOGOUT handles clearing everything
      console.log(`--- REDUCER: ${action.type} CASE REACHED ---`);
      localStorage.removeItem('token');
      return {
          ...state,
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null,
          error: null, // Clear general errors
          activity: [], // <-- Clear activity state
          activityLoading: false // Reset activity loading
      };


    case CLEAR_ERRORS:
      return {
        ...state,
        error: null, // Clear general auth error
      };

    // --- Add Activity Cases ---
    case SET_ACTIVITY_LOADING:
        console.log('--- REDUCER: SET_ACTIVITY_LOADING ---');
        return {
            ...state,
            activityLoading: true
        };
    case GET_ACTIVITY_SUCCESS:
        console.log('--- REDUCER: GET_ACTIVITY_SUCCESS ---', 'Payload length:', action.payload?.length);
        return {
            ...state,
            activity: action.payload, // Store the fetched activity array
            activityLoading: false,
            // We might want a separate activityError state? For now, clearing general error.
            // error: null
        };
    case ACTIVITY_ERROR: // Handles failed activity fetch
         console.log('--- REDUCER: ACTIVITY_ERROR ---', 'Payload:', action.payload);
        return {
            ...state,
            activityLoading: false,
            // Keep existing activity array or clear it? Let's keep it for now.
            // activity: [],
            error: action.payload // Set general error - consider separate activityError state later
        };
    case CLEAR_ACTIVITY: // Explicit clear action if needed elsewhere
         console.log('--- REDUCER: CLEAR_ACTIVITY ---');
         return {
             ...state,
             activity: [],
             activityLoading: false
         };
    // -------------------------

    default:
      // Return current state if action type doesn't match
      return state;
  }
};