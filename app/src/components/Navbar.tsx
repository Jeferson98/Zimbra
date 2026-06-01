import { Link, useNavigate } from "react-router-dom";
import iconReports from "../assets/ReportIcon.png";

type NavbarProps = {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

function Navbar({ openMenu, setOpenMenu, isAuthenticated, setIsAuthenticated }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  }
  
    if (!isAuthenticated) {
      return null; // No renderizar la barra de navegación si no está autenticado
    }else{
        return(
        
        <div className="divNavBar">
            <div className="navegationBar">
                <button className="menuButton" onClick={() => setOpenMenu(!openMenu)}>
                    ☰ Menu
                </button>
                <button className="logoutButton" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>
            
        <div className={`sidebar ${openMenu ? "open" : ""}`}>

            <Link
                to="/Report"
                onClick={() => setOpenMenu(false)}
            >
                <div className="menuRow">
                    <img
                        className="menuIcon"
                        src={iconReports}
                    />

                    {openMenu && (
                        <h4 style={{ margin: "1px" }}>
                            Report
                        </h4>
                    )}
                </div>
            </Link>

            <Link
                to="/module/archivos"
                onClick={() => setOpenMenu(false)}
            >
                <div className="menuRow">
                    <span className="menuIcon">📁</span>

                    {openMenu && (
                        <h4 style={{ margin: "1px" }}>
                            Archivos
                        </h4>
                    )}
                </div>
            </Link>
            <Link
                to="/eventos"
                onClick={() => setOpenMenu(false)}
            >
                <div className="menuRow">
                    <span className="menuIcon">📅</span>

                    {openMenu && (
                        <h4 style={{ margin: "1px" }}>
                            Eventos
                        </h4>
                    )}
                </div>
            </Link>

        </div>
        </div>)
    }
}

export default Navbar;