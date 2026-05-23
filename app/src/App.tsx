import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/login';
import ModulePage from './pages/ModulePage';
import Reports from './pages/Report/Reports';
import './styles/zimbra.css';

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

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Reports openMenu={openMenu} setOpenMenu={setOpenMenu} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/module/:moduleKey"
            element={
              <ProtectedRoute>
                <ModulePage />
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default App