// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AuthState from './context/auth/AuthState';
import SavedState from './context/saved/SavedState.jsx'; // Import SavedState
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthState>
      <SavedState> {/* Nest SavedState inside AuthState */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SavedState>
    </AuthState>
  </React.StrictMode>
);