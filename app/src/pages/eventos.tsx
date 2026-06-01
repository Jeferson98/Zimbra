import { useState, useMemo, type CSSProperties, type KeyboardEvent, type MouseEvent, useEffect } from "react";
import { getHTTP, postHTTP } from "../reuse/httpCall";

// ── Types ────────────────────────────────────────────────────────────────────

type EventType = "evento" | "recordatorio" | "tarea";

interface CalendarEvent {
  id: number;
  text: string;
  title: string;
  participantes: number[];
  type: EventType;
}

type EventsMap = Record<string, CalendarEvent[]>;

interface TypeStyle {
  pill: CSSProperties;
  dot: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS: string[] = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const DAYS: string[] = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

const TYPE_ICONS: Record<EventType, string> = {
  evento: "📅",
  recordatorio: "🔔",
  tarea: "✅",
};

const TYPE_COLORS: Record<EventType, TypeStyle> = {
  evento:       { pill: { background: "#EEEDFE", color: "#3C3489" }, dot: "#7F77DD" },
  recordatorio: { pill: { background: "#E1F5EE", color: "#085041" }, dot: "#1D9E75" },
  tarea:        { pill: { background: "#FAEEDA", color: "#633806" }, dot: "#BA7517" },
};

const btnStyle: CSSProperties = {
  background: "none",
  border: "0.5px solid #ccc",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 15,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "0.5px solid #ccc",
  borderRadius: 8,
  fontSize: 13,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function dateKey(y: number, m: number, d: number): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")} ${hh}:${mm}:${ss}`;
}

function formatDate(key: string): string {
  const [y, m, d] = key.split("-");
  return `${parseInt(d)} de ${MONTHS[parseInt(m) - 1]} de ${y}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CalendarApp() {
  const today = new Date();

  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth());
  const [events, setEvents] = useState<EventsMap>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [newText, setNewText] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newType, setNewType] = useState<EventType>("evento");
  const [participantes, setParticipantes] = useState<{ id: number; name: string }[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  const firstDay = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  // Navigation
  function prevMonth(): void {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth(): void {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  function goToday(): void {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  // Modal
  function openDay(day: number): void {
    setSelected(dateKey(year, month, day));
    setSelectedEvents(events[dateKey(year, month, day).split(" ")[0]] ?? []);
  }

  function closeModal(): void {
    setSelected(null);
    setNewText("");
    setNewType("evento");
  }

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) closeModal();
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => Number(option.value));
    setSeleccionados(values);
  };

  // Events
  function addEvent(): void {
    if (!newText.trim() || !selected || seleccionados.length <= 0 || !newTitle.trim()) return;
    const ev: CalendarEvent = { id: (new Date(selected)).getTime(), text: newText.trim(), type: newType, title: newTitle.trim(), participantes: seleccionados };
    setNewText("");
    setEvents(prev => ({ ...prev, [selected.split(" ")[0] ]: [...(prev[selected.split(" ")[0]] ?? []), ev] }));
    postHTTP("/Eventos/eventos", { 
      creador_id: 1, 
      titulo: newTitle, 
      descripcion: newText, 
      fecha_inicio: obtenerFechaInicio(ev.id), 
      fecha_fin: obtenerFechaInicio(ev.id + 3600000), // +1 hora, 
      participantes: seleccionados }) // Simulate saving to backend
    .then(() => alert("Evento guardado"))
    .catch(() => console.error("Error al guardar el evento"))
    .finally(() => {
      closeModal();
      setSeleccionados([]);
      setNewTitle("");
      setNewText("");
    });

    
  }
  useEffect(() => {
    getHTTP("/Eventos/eventos")
    .then(data => {
      const Keys = new Set<string>();
      data.data.forEach((e: any) => {
        const key = e.fecha_inicio.split("T")[0];
          Keys.add(key);
      });
      Keys.forEach((k) => {
         const FiltEventos = data.data.filter((e: any) => e.fecha_inicio.split("T")[0] === k);
         if (FiltEventos.length > 0) {
          
          const eventos = FiltEventos.map((e: any) => ({
            id: e.id,
            text: e.descripcion,
            title: e.titulo,
            participantes: e.participantes ? e.participantes.split(",").map((p: string) => parseInt(p)) : [],
            type: "evento" as EventType,
          }));
          setEvents(prev => ({ ...prev, [k]: eventos }));
         }
      });
        
    }).catch((error) => {
      debugger;
      console.error("Error al cargar eventos")});
    
    getHTTP("/Usuarios/usuarios").then(data => {
      const users = data.usuarios.map((u: any) => ({ id: u.id, name: u.nombre }));
      setParticipantes(users);
    }).catch(() => console.error("Error al cargar usuarios"));
  }, []);
  function obtenerFechaInicio(Fecha: number) {
    const ahora = new Date(Fecha);

    // Formato: YYYY-MM-DD HH:MM:SS
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    const fecha_inicio = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
    return fecha_inicio;
  }

  function deleteEvent(key: string, id: number): void {
    setEvents(prev => ({ ...prev, [key]: prev[key].filter(e => e.id !== id) }));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") addEvent();
  }

  // Build grid cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];


  return (
    <div style={{ padding: "1rem 0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>{MONTHS[month]} {year}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prevMonth} style={btnStyle}>‹</button>
          <button onClick={goToday} style={btnStyle}>Hoy</button>
          <button onClick={nextMonth} style={btnStyle}>›</button>
        </div>
      </div>

      {/* Day names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#888", fontWeight: 500, padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;

          const key = dateKey(year, month, day).split(" ")[0]; // Use only date part for key
          const dayEvents = events[key] ?? [];
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const isSelected = selected === key;

          return (
            <div
              key={key}
              onClick={() => openDay(day)}
              style={{
                minHeight: 80,
                border: isToday ? "1.5px solid #534AB7" : "0.5px solid #e5e5e5",
                borderRadius: 8,
                padding: 6,
                cursor: "pointer",
                background: isSelected ? "#f5f5f5" : "#fff",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? "#534AB7" : "#888", marginBottom: 4 }}>
                {day}
              </div>
              {dayEvents.slice(0, 2).map(ev => (
                <div
                  key={ev.id}
                  style={{
                    fontSize: 10,
                    padding: "2px 5px",
                    borderRadius: 4,
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...TYPE_COLORS[ev.type].pill,
                  }}
                >
                  {TYPE_ICONS[ev.type]} {ev.text}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div style={{ fontSize: 10, color: "#aaa" }}>+{dayEvents.length - 2} más</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", width: "100%", maxWidth: 360, padding: "1.25rem" }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>📅 {formatDate(selected)}</span>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            {/* Events list */}
            {selectedEvents.length === 0 ? (
              <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "8px 0" }}>
                Sin eventos para este día
              </p>
            ) : (
              <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedEvents.map(ev => (
                  <div
                    key={ev.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, border: "0.5px solid #e5e5e5" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[ev.type].dot, flexShrink: 0, display: "inline-block" }} />
                      {ev.text}
                    </div>
                    <button
                      onClick={() => deleteEvent(selected, ev.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#aaa" }}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add form */}
            <div style={{ borderTop: "0.5px solid #e5e5e5", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#888" }}>Agregar nuevo</span>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as EventType)}
                style={inputStyle}
              >
                <option value="evento">📅 Evento</option>
                <option value="recordatorio">🔔 Recordatorio</option>
                <option value="tarea">✅ Tarea</option>
              </select>
              <input
                type="text"
                placeholder="Titulo"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Descripción..."
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={inputStyle}
              />
              <select
                id="participantes"
                multiple
                value={seleccionados.map(String)}
                onChange={handleChange}
              >
                {participantes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p>Seleccionados:</p>
                {seleccionados.map((p) => (
                  <option key={p} value={p}>
                    {participantes.find(part => part.id === p)?.name || "Desconocido"
                    }
                  </option>
                ))}
              <button
                onClick={addEvent}
                style={{ background: "#534AB7", color: "#EEEDFE", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
