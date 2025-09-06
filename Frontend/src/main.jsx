import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';
import './index.css';

// react-toastify stillerini ve bileşenini import et
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Router, tüm yönlendirme işlemlerini yönetir */}
    <Router>
      {/* 2. AuthProvider, tüm uygulamaya oturum bilgilerini sağlar */}
      <AuthProvider>
        {/* 3. App bileşeni artık bu iki provider'ın içinde güvende */}
        <App />
        {/* Bildirimler (Toast) için container */}
        <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="dark"
          />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
