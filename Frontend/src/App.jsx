// --- GEÇİCİ TEST KODU ---
import React from "react";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <h1 style={{ color: 'white' }}>Auth Context Yükleniyor...</h1>;
  }

  return (
    <div style={{ color: 'white', fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Uygulama Testi Başarılı!</h1>
      <p>Auth Context Yüklendi ve Hata Vermedi.</p>
      <hr />
      <h2>Oturum Durumu:</h2>
      <pre style={{ background: '#333', padding: '1rem', borderRadius: '8px' }}>
        {JSON.stringify({ isAuthenticated, user }, null, 2)}
      </pre>
    </div>
  );
}

export default App;
