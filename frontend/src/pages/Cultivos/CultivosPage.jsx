import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Sprout, MapPin, Calendar, Eye, Plus, AlertCircle, CheckCircle,
  Droplets, Thermometer, Grid, Layers, ChevronRight, Filter,
  TrendingUp, Clock, Leaf, Search, X, ChevronLeft
} from "lucide-react";
import EditCultivoModal from "../../components/cultivo/EditCultivoModal";
import AddCultivoModal from "../../components/cultivo/AddCultivoModal";
import { getCultivos, createCultivo, updateCultivo, deleteCultivo } from "../../services/cultivos.service";

const T = {
  bg:       "#fffaf8",
  bgAlt:    "#fbefe1",
  accent:   "#f3e5ca",
  card:     "#ffffff",
  border:   "#e2e8f0",
  primary:  "#b0895a",
  primaryD: "#8B6F47",
  text:     "#4b5563",
  textDark: "#2d3748",
};

export default function CultivosPage({ onOpenCultivo }) {
  const { user } = useAuth();
  const userRole = user?.role;

  const [cultivos, setCultivos] = useState([]);
  const [selectedCultivo, setSelectedCultivo] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCultivos();
        setCultivos(Array.isArray(data) ? data : []);
      } catch {
        setCultivos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedCultivo || isAddOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [selectedCultivo, isAddOpen]);

  useEffect(() => {
    if (notification.show) {
      const t = setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
      return () => clearTimeout(t);
    }
  }, [notification.show]);

  const surcos = useMemo(() => {
    const grouped = {};
    cultivos.forEach(({ ubicacion = "Sin ubicación", ...c }) => {
      if (!grouped[ubicacion]) grouped[ubicacion] = [];
      grouped[ubicacion].push({ ubicacion, ...c });
    });
    return Object.entries(grouped).map(([ubicacion, lista]) => ({ id: ubicacion, nombre: ubicacion, cultivos: lista }));
  }, [cultivos]);

  const surcosFiltrados = useMemo(() => {
    let f = surcos;
    if (selectedUbicacion !== "todas") f = f.filter(s => s.nombre === selectedUbicacion);
    if (searchTerm) {
      f = f.map(s => ({
        ...s,
        cultivos: s.cultivos.filter(c => c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
      })).filter(s => s.cultivos.length > 0);
    }
    return f;
  }, [surcos, selectedUbicacion, searchTerm]);

  const handleCreateCultivo = async (nuevo) => {
    try {
      const creado = await createCultivo(nuevo);
      setCultivos(prev => [...prev, creado]);
      setIsAddOpen(false);
      setNotification({ show: true, message: `Cultivo "${creado.nombre}" creado exitosamente`, type: "success" });
    } catch {
      setNotification({ show: true, message: "Error al crear el cultivo", type: "error" });
    }
  };

  const handleUpdateCultivo = async (id, data) => {
    try {
      const updated = await updateCultivo(id, data);
      setCultivos(prev => prev.map(c => c.id === id ? updated : c));
      setSelectedCultivo(null);
      setNotification({ show: true, message: `Cultivo "${updated.nombre}" actualizado correctamente`, type: "success" });
    } catch {
      setNotification({ show: true, message: "Error al actualizar el cultivo", type: "error" });
    }
  };

  const handleDeleteCultivo = async (id) => {
    try {
      const nombre = cultivos.find(c => c.id === id)?.nombre || "desconocido";
      await deleteCultivo(id);
      setCultivos(prev => prev.filter(c => c.id !== id));
      setSelectedCultivo(null);
      setNotification({ show: true, message: `Cultivo "${nombre}" eliminado correctamente`, type: "success" });
    } catch {
      setNotification({ show: true, message: "Error al eliminar el cultivo", type: "error" });
    }
  };

  const getEstadoStyle = (estado) => {
    const map = {
      activo:    { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
      saludable: { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
      alerta:    { bg:"#fee2e2", color:"#991b1b", border:"#fca5a5" },
      inactivo:  { bg:T.accent,  color:T.primaryD, border:T.primary },
      cosechado: { bg:"#fef3c7", color:"#92400e", border:"#fcd34d" },
      perdido:   { bg:"#fee2e2", color:"#991b1b", border:"#fca5a5" },
    };
    return map[estado?.toLowerCase()] || { bg:T.accent, color:T.text, border:T.border };
  };

  const totalActivos = cultivos.filter(c => ["activo","saludable"].includes(c.estado?.toLowerCase())).length;
  const totalAlertas = cultivos.filter(c => c.estado?.toLowerCase() === "alerta").length;

  if (loading) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:"60vh",background:T.bg }}>
      <div style={{ position:"relative",width:64,height:64 }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",
          border:`3px solid ${T.accent}`,borderTopColor:T.primaryD,
          animation:"cp-spin 0.8s linear infinite" }}/>
        <Sprout size={22} color={T.primaryD} style={{ position:"absolute",
          top:"50%",left:"50%",transform:"translate(-50%,-50%)" }}/>
      </div>
      <p style={{ marginTop:"1rem",color:T.text,fontSize:"0.9rem",fontFamily:"'Outfit',sans-serif" }}>
        Cargando cultivos…
      </p>
      <style>{`@keyframes cp-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .cp-root * { font-family:'Outfit',sans-serif; box-sizing:border-box; }
        .cp-root {
          padding:1.75rem;
          max-width:1280px;
          margin:0 auto;
          background:${T.bg};
          min-height:100vh;
        }

        .cp-card {
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:16px;
          padding:1.25rem 1.5rem;
          transition:box-shadow 0.3s ease;
        }
        .cp-card:hover { box-shadow:0 16px 40px rgba(139,111,71,0.10); }

        .cp-kpi {
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:14px;
          padding:1.1rem 1.25rem;
          transition:box-shadow 0.3s ease, transform 0.3s ease;
        }
        .cp-kpi:hover { box-shadow:0 10px 28px rgba(139,111,71,0.12); transform:translateY(-2px); }

        .cp-btn-primary {
          padding:0.6rem 1.4rem;
          background:linear-gradient(135deg,${T.primaryD},${T.primary});
          color:#fff; border:none; border-radius:10px;
          font-weight:700; font-size:0.88rem; font-family:inherit;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          box-shadow:0 4px 14px rgba(139,111,71,0.28);
          transition:all 0.25s ease;
        }
        .cp-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(139,111,71,0.36); }

        .cp-filter-chip {
          padding:0.4rem 1rem;
          border-radius:8px;
          font-size:0.82rem; font-weight:600; font-family:inherit;
          border:1.5px solid ${T.border};
          background:${T.bg};
          color:${T.text};
          cursor:pointer;
          transition:all 0.2s ease;
          white-space:nowrap;
        }
        .cp-filter-chip:hover { border-color:${T.primary}; color:${T.primaryD}; }
        .cp-filter-chip.active {
          background:linear-gradient(135deg,${T.primaryD},${T.primary});
          color:#fff; border-color:transparent;
          box-shadow:0 3px 10px rgba(139,111,71,0.25);
        }

        .cp-input {
          width:100%;
          padding:0.65rem 1rem 0.65rem 2.4rem;
          border:1.5px solid ${T.border};
          border-radius:10px;
          font-size:0.88rem; font-family:inherit;
          background:${T.bg};
          color:${T.textDark};
          outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cp-input:focus { border-color:${T.primary}; box-shadow:0 0 0 3px rgba(176,137,90,0.12); background:${T.card}; }
        .cp-input::placeholder { color:#b0bec5; }

        .cp-section-header {
          background:linear-gradient(90deg,${T.bgAlt},transparent);
          padding:0.85rem 1.25rem;
          border-bottom:1px solid ${T.border};
          display:flex; align-items:center; gap:0.75rem;
        }

        .cp-cultivo-card {
          background:${T.card};
          border:1.5px solid ${T.border};
          border-radius:14px;
          overflow:hidden;
          cursor:pointer;
          transition:all 0.35s ease;
        }
        .cp-cultivo-card:hover {
          border-color:rgba(176,137,90,0.45);
          box-shadow:0 18px 40px rgba(139,111,71,0.13);
          transform:translateY(-4px);
        }

        .cp-cultivo-img {
          height:140px;
          background:${T.bgAlt};
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden;
        }

        .cp-see-btn {
          width:100%; padding:0.55rem;
          border:1.5px solid ${T.border};
          background:${T.bg};
          color:${T.text};
          border-radius:9px;
          font-size:0.78rem; font-weight:600; font-family:inherit;
          cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:5px;
          transition:all 0.25s ease;
          margin-top:0.5rem;
        }
        .cp-see-btn:hover {
          background:linear-gradient(135deg,${T.primaryD},${T.primary});
          color:#fff; border-color:transparent;
        }

        .cp-empty {
          text-align:center;
          padding:4rem 1rem;
          background:${T.bgAlt};
          border:2px dashed rgba(176,137,90,0.25);
          border-radius:18px;
        }

        .cp-toast {
          position:fixed; top:1.25rem; right:1.25rem;
          z-index:10000;
          min-width:260px; max-width:380px;
          border-radius:12px;
          padding:0.85rem 1rem;
          display:flex; align-items:center; gap:0.65rem;
          box-shadow:0 8px 24px rgba(0,0,0,0.12);
          animation:cp-toast-in 0.3s ease both;
        }
        .cp-toast.success { background:#f0fdf4; border-left:3px solid #22c55e; }
        .cp-toast.error   { background:#fef2f2; border-left:3px solid #ef4444; }
        .cp-toast p { margin:0; font-size:0.82rem; font-weight:500; flex:1; }
        .cp-toast.success p { color:#15803d; }
        .cp-toast.error   p { color:#b91c1c; }
        .cp-toast-close { background:none;border:none;cursor:pointer;color:#94a3b8;padding:0;line-height:1; }

        .cp-grid { display:grid; gap:1.25rem; }
        .cp-kpi-grid { grid-template-columns:repeat(4,1fr); }
        .cp-cultivos-grid { grid-template-columns:repeat(4,1fr); }
        @media(max-width:1024px){
          .cp-kpi-grid     { grid-template-columns:repeat(2,1fr); }
          .cp-cultivos-grid{ grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:700px){
          .cp-cultivos-grid{ grid-template-columns:repeat(2,1fr); }
          .cp-kpi-grid     { grid-template-columns:repeat(2,1fr); }
          .cp-root { padding:1rem; }
        }
        @media(max-width:480px){
          .cp-cultivos-grid{ grid-template-columns:1fr; }
        }

        @keyframes cp-spin    { to{transform:rotate(360deg)} }
        @keyframes cp-toast-in{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
      `}</style>

      <div className="cp-root">

        {notification.show && (
          <div className={`cp-toast ${notification.type}`}>
            {notification.type === "success"
              ? <CheckCircle size={16} color="#22c55e"/>
              : <AlertCircle size={16} color="#ef4444"/>}
            <p>{notification.message}</p>
            <button className="cp-toast-close"
              onClick={() => setNotification({ show:false, message:"", type:"success" })}>
              <X size={14}/>
            </button>
          </div>
        )}

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:"1.75rem",flexWrap:"wrap",gap:"1rem" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"0.75rem" }}>
            <div style={{ width:44,height:44,
              background:`linear-gradient(135deg,${T.primaryD},${T.primary})`,
              borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 6px 18px rgba(139,111,71,0.28)" }}>
              <Sprout size={20} color="#fff"/>
            </div>
            <div>
              <h1 style={{ margin:0,fontSize:"1.6rem",fontWeight:800,
                color:T.textDark,letterSpacing:"-0.5px" }}>Mis Cultivos</h1>
              <p style={{ margin:0,fontSize:"0.8rem",color:T.text,
                display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
                <Grid size={12}/> Gestiona tus cultivos
              </p>
            </div>
          </div>
          <button className="cp-btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16}/> Nuevo cultivo
          </button>
        </div>

        <div className="cp-grid cp-kpi-grid" style={{ marginBottom:"1.25rem" }}>
          {[
            { label:"Total cultivos",  value:cultivos.length,  icon:<Sprout size={18}/>,       sub:"Registrados",       accent:false },
            { label:"Ubicaciones",     value:surcos.length,    icon:<MapPin size={18}/>,        sub:"Zonas activas",     accent:false },
            { label:"Activos",         value:totalActivos,     icon:<CheckCircle size={18}/>,   sub:"En buen estado",    accent:false },
            { label:"Alertas",         value:totalAlertas,     icon:<AlertCircle size={18}/>,   sub:"Requieren atención",accent:true  },
          ].map(({ label, value, icon, sub, accent }) => (
            <div key={label} className="cp-kpi">
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"0.5rem" }}>
                <div>
                  <p style={{ margin:0,fontSize:"0.78rem",fontWeight:600,color:T.text }}>{label}</p>
                  <p style={{ margin:"0.3rem 0 0",fontSize:"2rem",fontWeight:800,
                    color: accent && value > 0 ? "#dc2626" : T.textDark,lineHeight:1 }}>{value}</p>
                </div>
                <span style={{ background:T.accent,border:`1px solid rgba(176,137,90,0.2)`,
                  borderRadius:10,padding:"6px 7px",display:"flex",alignItems:"center",
                  color: accent && value > 0 ? "#dc2626" : T.primaryD }}>
                  {icon}
                </span>
              </div>
              <p style={{ margin:0,fontSize:"0.72rem",color:T.text,
                display:"flex",alignItems:"center",gap:3 }}>
                <TrendingUp size={10}/>{sub}
              </p>
            </div>
          ))}
        </div>

        <div className="cp-card" style={{ marginBottom:"1.25rem" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
            marginBottom:"0.85rem" }}>
            <span style={{ display:"flex",alignItems:"center",gap:6,
              fontWeight:700,fontSize:"0.88rem",color:T.textDark }}>
              <Filter size={14} color={T.primaryD}/> Filtros
            </span>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}
                style={{ background:"none",border:"none",cursor:"pointer",
                  fontSize:"0.75rem",color:T.text,display:"flex",alignItems:"center",gap:3 }}>
                <X size={11}/> Limpiar búsqueda
              </button>
            )}
          </div>
          <div style={{ position:"relative",marginBottom:"0.85rem" }}>
            <Search size={15} color="#94a3b8" style={{ position:"absolute",left:10,
              top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
            <input className="cp-input" type="text" placeholder="Buscar cultivo…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:"0.5rem" }}>
            <button className={`cp-filter-chip${selectedUbicacion==="todas"?" active":""}`}
              onClick={() => setSelectedUbicacion("todas")}>Todas</button>
            {surcos.map(s => (
              <button key={s.id}
                className={`cp-filter-chip${selectedUbicacion===s.nombre?" active":""}`}
                onClick={() => setSelectedUbicacion(s.nombre)}>{s.nombre}</button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>
          {surcosFiltrados.map(({ id, nombre, cultivos: lista }) => (
            <div key={id} className="cp-card" style={{ padding:0,overflow:"hidden" }}>
              <div className="cp-section-header">
                <span style={{ background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:8,padding:"5px 6px",display:"flex",alignItems:"center",
                  boxShadow:"0 2px 6px rgba(0,0,0,0.06)" }}>
                  <MapPin size={15} color={T.primaryD}/>
                </span>
                <div style={{ flex:1,minWidth:0 }}>
                  <h2 style={{ margin:0,fontSize:"0.95rem",fontWeight:700,
                    color:T.textDark,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {nombre}
                  </h2>
                  <p style={{ margin:0,fontSize:"0.72rem",color:T.text,
                    display:"flex",alignItems:"center",gap:3,marginTop:2 }}>
                    <Layers size={10}/>{lista.length} cultivo{lista.length!==1?"s":""}
                  </p>
                </div>
                <span style={{ fontSize:"0.72rem",fontWeight:600,color:T.primaryD,
                  background:T.accent,padding:"3px 10px",borderRadius:20,
                  border:`1px solid rgba(176,137,90,0.2)`,whiteSpace:"nowrap" }}>
                  {lista.filter(c=>["activo","saludable"].includes(c.estado?.toLowerCase())).length} activos
                </span>
              </div>

              <div className="cp-grid cp-cultivos-grid" style={{ padding:"1.25rem" }}>
                {lista.map((cultivo, idx) => {
                  const estadoStyle = getEstadoStyle(cultivo.estado);
                  return (
                    <div key={cultivo.id || idx} className="cp-cultivo-card"
                      onClick={() => setSelectedCultivo(cultivo)}>
                      <div className="cp-cultivo-img">
                        {cultivo.imagen ? (
                          <img src={cultivo.imagen} alt={cultivo.nombre}
                            style={{ width:"100%",height:"100%",objectFit:"cover",
                              transition:"transform 0.6s ease" }}
                            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.07)"}
                            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                        ) : (
                          <Sprout size={44} color={`${T.primaryD}55`}/>
                        )}
                        <span style={{ position:"absolute",top:8,right:8,
                          background:estadoStyle.bg,color:estadoStyle.color,
                          border:`1px solid ${estadoStyle.border}`,
                          borderRadius:20,padding:"2px 8px",
                          fontSize:"0.68rem",fontWeight:600,
                          display:"flex",alignItems:"center",gap:3 }}>
                          {cultivo.estado?.toLowerCase()==="alerta" && <AlertCircle size={10}/>}
                          {["activo","saludable"].includes(cultivo.estado?.toLowerCase()) && <CheckCircle size={10}/>}
                          <span style={{ textTransform:"capitalize" }}>{cultivo.estado}</span>
                        </span>
                        {cultivo.fechaSiembra && (
                          <span style={{ position:"absolute",bottom:8,left:8,
                            background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",
                            borderRadius:8,padding:"2px 7px",
                            fontSize:"0.68rem",color:"#fff",
                            display:"flex",alignItems:"center",gap:3 }}>
                            <Calendar size={9}/>
                            {new Date(cultivo.fechaSiembra).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}
                          </span>
                        )}
                      </div>

                      <div style={{ padding:"0.85rem 0.9rem" }}>
                        <h3 style={{ margin:0,fontSize:"0.9rem",fontWeight:700,
                          color:T.textDark,overflow:"hidden",textOverflow:"ellipsis",
                          whiteSpace:"nowrap",marginBottom:"0.5rem",
                          transition:"color 0.2s" }}
                          onMouseEnter={e=>e.currentTarget.style.color=T.primaryD}
                          onMouseLeave={e=>e.currentTarget.style.color=T.textDark}>
                          {cultivo.nombre}
                        </h3>
                        <div style={{ display:"flex",gap:6,marginBottom:"0.65rem" }}>
                          <span style={{ display:"flex",alignItems:"center",gap:3,
                            fontSize:"0.72rem",color:T.text,
                            background:T.accent,padding:"2px 8px",borderRadius:20,
                            border:`1px solid rgba(176,137,90,0.15)` }}>
                            <Droplets size={10} color="#60a5fa"/>{cultivo.humedad||"—%"}
                          </span>
                          <span style={{ display:"flex",alignItems:"center",gap:3,
                            fontSize:"0.72rem",color:T.text,
                            background:T.accent,padding:"2px 8px",borderRadius:20,
                            border:`1px solid rgba(176,137,90,0.15)` }}>
                            <Thermometer size={10} color="#f97316"/>{cultivo.temperatura||"—°C"}
                          </span>
                        </div>
                        <button className="cp-see-btn"
                          onClick={e => { e.stopPropagation(); onOpenCultivo(cultivo); }}>
                          <Eye size={12}/> Ver bitácora
                          <ChevronRight size={11}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!surcosFiltrados.length && surcos.length > 0 && (
            <div className="cp-empty">
              <div style={{ width:60,height:60,background:T.accent,borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 1rem",border:`1px solid rgba(176,137,90,0.25)` }}>
                <Search size={26} color={T.primaryD}/>
              </div>
              <h2 style={{ margin:"0 0 0.4rem",fontSize:"1.2rem",fontWeight:700,color:T.textDark }}>
                No se encontraron cultivos
              </h2>
              <p style={{ margin:"0 0 1.25rem",fontSize:"0.85rem",color:T.text }}>
                {searchTerm ? `Sin resultados para "${searchTerm}"` : "No hay cultivos en esta ubicación"}
              </p>
              {(searchTerm || selectedUbicacion !== "todas") && (
                <button className="cp-btn-primary"
                  onClick={() => { setSearchTerm(""); setSelectedUbicacion("todas"); }}>
                  <ChevronLeft size={15}/> Limpiar filtros
                </button>
              )}
            </div>
          )}

          {!surcos.length && (
            <div className="cp-empty">
              <div style={{ width:70,height:70,background:T.accent,borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 1.25rem",border:`1px solid rgba(176,137,90,0.25)` }}>
                <Sprout size={32} color={T.primaryD}/>
              </div>
              <h2 style={{ margin:"0 0 0.4rem",fontSize:"1.3rem",fontWeight:800,color:T.textDark }}>
                ¡Bienvenido a tu huerto digital!
              </h2>
              <p style={{ margin:"0 0 1.5rem",fontSize:"0.88rem",color:T.text,
                maxWidth:340,marginLeft:"auto",marginRight:"auto" }}>
                Comienza añadiendo tu primer cultivo al sistema
              </p>
              <button className="cp-btn-primary" onClick={() => setIsAddOpen(true)}>
                <Plus size={16}/> Añadir mi primer cultivo
              </button>
            </div>
          )}
        </div>

        <EditCultivoModal
          isOpen={!!selectedCultivo}
          onClose={() => setSelectedCultivo(null)}
          cultivo={selectedCultivo}
          onSave={handleUpdateCultivo}
          onDelete={handleDeleteCultivo}
          userRole={userRole}
        />
        <AddCultivoModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleCreateCultivo}
        />
      </div>
    </>
  );
}
