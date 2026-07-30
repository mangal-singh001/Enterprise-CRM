import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, metadataService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState('overview'); // 'overview', 'edupulse', 'cloudmetric'
  const [activeEntity, setActiveEntity] = useState(null); // 'subscription_plans', 'message_templates', 'client_sites'
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('crm_theme') === 'dark' || 
      (!localStorage.getItem('crm_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply dark mode class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('crm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('crm_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Initialize SSO Auth Flow
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      setAuthError(null);
      try {
        // 1. Check for URL SSO query parameter ?token=...
        const urlParams = new URLSearchParams(window.location.search);
        const ssoToken = urlParams.get('token');

        if (ssoToken) {
          // Exchange IdP SSO token for session token
          const data = await authService.verifySsoToken(ssoToken);
          localStorage.setItem('crm_session_token', data.access_token);
          setUser(data.user);

          // Clean token from URL query string for security and clean UI
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        } else {
          // Check if existing valid session token exists in localStorage
          const existingToken = localStorage.getItem('crm_session_token');
          if (existingToken) {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } else {
            setAuthError("No authentication token detected. Please open CRM via your company IdP portal or test SSO link.");
          }
        }
      } catch (err) {
        console.error("SSO Initialization error:", err);
        setAuthError(err.response?.data?.detail || "Authentication failed. Invalid or expired token.");
        localStorage.removeItem('crm_session_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch product registry schemas once authenticated
  useEffect(() => {
    if (user) {
      metadataService.getProducts()
        .then(data => {
          setProducts(data);
        })
        .catch(err => {
          console.error("Failed to fetch product registry:", err);
        });
    }
  }, [user]);

  const handleProductSwitch = (prodId) => {
    setActiveProduct(prodId);
    if (prodId === 'overview') {
      setActiveEntity(null);
    } else {
      const prod = products.find(p => p.id === prodId);
      if (prod && prod.entities && prod.entities.length > 0) {
        setActiveEntity(prod.entities[0].id);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('crm_session_token');
    setUser(null);
    setAuthError("You have been signed out. Please authenticate again via IdP portal.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        products,
        activeProduct,
        activeEntity,
        setActiveProduct: handleProductSwitch,
        setActiveEntity,
        loading,
        authError,
        logout,
        darkMode,
        toggleDarkMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
