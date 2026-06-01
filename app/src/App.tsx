import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Archivos from "./pages/Archivos/Archivos";
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

  function Layout({
  children,
  openMenu,
  setOpenMenu,
  isAuthenticated,
  setIsAuthenticated
}: any) {

  const location = useLocation();

  const showNavbar =
    isAuthenticated &&
    location.pathname !== "/" &&
    location.pathname !== "/login";

  return (
    <>
      {showNavbar && (
        <Navbar
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}

      {children}
    </>
  );
}

  return (
    <div className='app'>
      
      <BrowserRouter>
        
        <Toaster position="top-right" />

        <Layout
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        >

        <Routes>

          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to="/products" />
                : (
                  <Login
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                )
            }
          />

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

          <Route
            path="/archivos"
            element={
              <ProtectedRoute>
                <Archivos />
              </ProtectedRoute>
            }
          />
          
        </Routes>
        </Layout>
      </BrowserRouter>

    </div>
  )
}

export default App