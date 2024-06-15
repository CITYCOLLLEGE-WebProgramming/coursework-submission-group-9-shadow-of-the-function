// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import Mail from './Mail'
// import Settings from './Settings'
// import AccSettings from './AccSettings'
// import { BrowserRouter,Routes, Route } from 'react-router-dom'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path='/' element={<App />}></Route>
//       <Route path='/mail' element={<Mail />}></Route>
//       <Route path='/account_settings' element={<AccSettings />}></Route>
//       <Route path='/settings' element={<Settings/>}></Route>
//     </Routes>
//   </BrowserRouter>
// )

import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Mail from './Mail';
import Settings from './Settings';
import AccSettings from './AccSettings';
import Sent from './Sent';
import Flagged from './Flagged';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

const ProtectedRoute = ({ children }) => {
  const auth = useContext(AuthContext);
  return auth ? children : <Navigate to="/" />;
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/mail" element={<ProtectedRoute><Mail /></ProtectedRoute>} />
        <Route path="/account_settings" element={<ProtectedRoute><AccSettings /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/sent" element={<ProtectedRoute><Sent /></ProtectedRoute>} />
        <Route path="/flagged" element={<ProtectedRoute><Flagged /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
