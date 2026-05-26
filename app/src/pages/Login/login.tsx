import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Zimbra.png";
import { login } from '../../services/authService';

type loginResponse = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

function Login({ isAuthenticated, setIsAuthenticated }: loginResponse) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);

      // Guardar token en localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("role", response.user.rol_id.toString());

      setIsAuthenticated(true);
      navigate("/products");
    } catch (error: any) {
      console.error("Error de login:", error);
      alert(error.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (

    <div className="login-root">
      <div className="login-blob login-blob--1" />
      <div className="login-blob login-blob--2" />
      <div className="login-blob login-blob--3" />

      <form className="login-card" onSubmit={handleLogin}>

        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand__logo">
            {/*<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L25 9V19L14 25L3 19V9L14 3Z" fill="#22c55e" opacity="0.9" />
              <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="white" opacity="0.15" />
              <circle cx="14" cy="14" r="3" fill="white" />
            </svg>*/}
            <img src={logo} alt="Logo" className="login-brand__logo-img" />
          </div>
          <span className="login-brand__name">Zimbra</span>
        </div>

        <h1 className="login-title">Bienvenido de vuelta</h1>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        <div className="login-divider" />

        {/* Campo usuario */}
        <div className="login-field">
          <label className="login-label">Usuario</label>
          <div className="login-input-wrapper">
            <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              className="login-input"
              type="text"
              placeholder="tu_usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Campo contraseña */}
        <div className="login-field">
          <label className="login-label">Contraseña</label>
          <div className="login-input-wrapper">
            <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="login-input"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="login-eye-btn"
              onClick={() => setShowPass(!showPass)}
              type="button"
            >
              {showPass ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* <div className="login-forgot-row">
          <span className="login-forgot">¿Olvidaste tu contraseña?</span>
        </div> */}

        <button
          type="submit"
          className={`login-btn${loading ? " login-btn--loading" : ""}`}
        >
          {loading ? (
            <span className="login-spinner" />
          ) : (
            <>
              Ingresar
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>

        {/* <p className="login-footer">
          ¿No tienes cuenta?{" "}
          <span className="login-link">Regístrate</span>
        </p> */}

      </form>
    </div>

  )

}

export default Login