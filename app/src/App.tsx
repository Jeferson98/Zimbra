import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { useState, useEffect } from 'react';
import Login from './pages/Login/login';
import Reports from './pages/Report/Reports';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [openMenu, setOpenMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  return (
    <div className='app'>
      
      <BrowserRouter>
        
        <Toaster position="top-right" />

        <Navbar openMenu={openMenu} setOpenMenu={setOpenMenu} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

        <Routes>

          <Route 
            path="/" 
            element={isAuthenticated ? 
              <Navigate to="/login" /> : 
              <Login 
                isAuthenticated={isAuthenticated} 
                setIsAuthenticated={setIsAuthenticated} />
              }/>

          <Route 
            path="/login" element={
              <Login 
                isAuthenticated={isAuthenticated} 
                setIsAuthenticated={setIsAuthenticated} />
            } 
          />

          <Route 
            path="/Report" 
            element={
              <ProtectedRoute>
                <Reports  openMenu={openMenu} setOpenMenu={setOpenMenu}/>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default App