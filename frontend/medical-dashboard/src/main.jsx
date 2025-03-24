import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // ✅ Import AuthProvider
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ Ensure Router wraps everything */}
      <AuthProvider> {/* ✅ AuthProvider is now inside BrowserRouter */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
