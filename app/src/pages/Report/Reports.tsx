import { Link } from "react-router-dom";
import { modules } from "../../config/modules";

type ReportsProps = {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

function Reports({ openMenu, setOpenMenu }: ReportsProps) {
  return (
    <div
      className={`page-container ${openMenu ? "open" : ""}`}
      onClick={() => setOpenMenu(false)}
    >
      <div className="zm-dashboard" onClick={(e) => e.stopPropagation()}>
        <section className="zm-hero">
          <span className="zm-badge">Zimbra</span>
          <h1>Panel principal del sistema</h1>
          <p>
            Gestiona usuarios, leads, correos, eventos, archivos, campañas, formularios,
            notificaciones y scoring desde un solo lugar.
          </p>
        </section>

        <section className="zm-grid">
          {modules.map((item) => (
              item.key === "eventos" ?
              <Link key={item.key} to={`/${item.key}`} className="zm-module-card">
                <div className="zm-module-card__emoji">{item.emoji}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
              :
            <Link key={item.key} to={`/module/${item.key}`} className="zm-module-card">
              <div className="zm-module-card__emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Reports;