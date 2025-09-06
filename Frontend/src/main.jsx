import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// React uygulamasını 'root' ID'li HTML elementine render et
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Router, tüm yönlendirme işlemlerini yönetir */}
    <Router>
      {/* 2. AuthProvider, tüm uygulamaya oturum bilgilerini sağlar (ANA PRİZ) */}
      <AuthProvider>
        {/* 3. App bileşeni artık bu iki provider'ın içinde güvende */}
        <App />
        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
