import { useState, useEffect } from "react";
import { getReportesByCultivo, createReporte } from "../../services/reportes.service";
import AddReporteModal from "../../components/cultivo/AddReporteModal";
import {
  ArrowLeft, MapPin, Calendar, Droplets, FileText, Clock,
  Image as ImageIcon, Sprout, Plus, TrendingUp, AlertCircle,
  CheckCircle, Wind, Search, X
} from "lucide-react";

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

const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" });

const formatDateShort = (date) =>
  new Date(date).toLocaleDateString("es-MX", { month:"short", day:"numeric" });

const getEstadoStyle = (estado) => {
  const map = {
    activo:    { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
    saludable: { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
    alerta:    { bg:"#fee2e2", color:"#991b1b", border:"#fca5a5" },
    inactivo:  { bg:T.accent,  color:T.primaryD, border:T.primary },
    cosechado: { bg:"#fef3c7", color:"#92400e", border:"#fcd34d" },
    perdido:   { bg:"#fee2e2", color:"#991b1b", border:"#fca5a5" },
  };
  return map[estado?.toLowerCase()] || { bg:T.accent, color:T.primaryD, border:T.primary };
};

const getEstadoIcon = (estado) => {
  if (estado?.toLowerCase() === "alerta")    return <AlertCircle  size={16} color="#991b1b"/>;
  if (["saludable","activo"].includes(estado?.toLowerCase())) return <CheckCircle size={16} color="#065f46"/>;
  return <Sprout size={16} color={T.primaryD}/>;
};

export default function CultivoDetallePage({ cultivo, onBack }) {
  const [reportes, setReportes]         = useState([]);
  const [isReporteOpen, setIsReporteOpen] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [notification, setNotification] = useState({ show:false, message:"", type:"success" });

  useEffect(() => {
    if (isReporteOpen) {
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
  }, [isReporteOpen]);

  useEffect(() => {
    if (notification.show) {
      const t = setTimeout(() => setNotification({ show:false, message:"", type:"success" }), 3000);
      return () => clearTimeout(t);
    }
  }, [notification.show]);

  useEffect(() => {
    if (!cultivo) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getReportesByCultivo(cultivo.id);
        setReportes(data);
      } catch (e) {
        console.error("Error cargando reportes", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [cultivo]);

  const handleCreateReporte = async (formData) => {
    try {
      const nuevo = await createReporte(formData);
      setReportes(prev => [nuevo, ...prev]);
      setIsReporteOpen(false);
      setNotification({ show:true, message:`Reporte "${nuevo.titulo}" registrado exitosamente`, type:"success" });
    } catch {
      setNotification({ show:true, message:"Error al registrar el reporte", type:"error" });
    }
  };

  if (!cultivo) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:400,textAlign:"center",
      padding:"2rem",background:T.bg,fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ width:72,height:72,background:T.accent,borderRadius:"50%",
        display:"flex",alignItems:"center",justifyContent:"center",
        marginBottom:"1.25rem",border:`1px solid rgba(176,137,90,0.25)` }}>
        <ImageIcon size={30} color={T.primaryD}/>
      </div>
      <h2 style={{ margin:"0 0 0.5rem",fontSize:"1.3rem",fontWeight:800,color:T.textDark }}>
        No hay cultivo seleccionado
      </h2>
      <p style={{ margin:"0 0 1.5rem",fontSize:"0.88rem",color:T.text }}>
        Selecciona un cultivo para ver su información detallada
      </p>
      <button style={{ padding:"0.65rem 1.5rem",
        background:`linear-gradient(135deg,${T.primaryD},${T.primary})`,
        color:"#fff",border:"none",borderRadius:10,fontWeight:700,
        fontSize:"0.88rem",cursor:"pointer",fontFamily:"inherit",
        display:"inline-flex",alignItems:"center",gap:6,
        boxShadow:"0 4px 14px rgba(139,111,71,0.28)" }}
        onClick={onBack}>
        <ArrowLeft size={15}/> Volver a cultivos
      </button>
    </div>
  );

  if (loading) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:"60vh",background:T.bg,fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ position:"relative",width:60,height:60 }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",
          border:`3px solid ${T.accent}`,borderTopColor:T.primaryD,
          animation:"cd-spin 0.8s linear infinite" }}/>
        <Sprout size={20} color={T.primaryD} style={{ position:"absolute",
          top:"50%",left:"50%",transform:"translate(-50%,-50%)" }}/>
      </div>
      <p style={{ marginTop:"1rem",color:T.text,fontSize:"0.9rem" }}>
        Cargando información del cultivo…
      </p>
      <style>{`@keyframes cd-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const filteredReportes = reportes.filter(r =>
    r.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const diasDesdeSiembra = Math.floor((new Date() - new Date(cultivo.fechaSiembra)) / 86400000);
  const reportesSemana   = reportes.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7*86400000)).length;
  const estadoStyle      = getEstadoStyle(cultivo.estado);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .cd-root * { font-family:'Outfit',sans-serif; box-sizing:border-box; }
        .cd-root { max-width:1100px; margin:0 auto; padding:1.75rem; background:${T.bg}; min-height:100vh; }

        .cd-card {
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:16px;
          padding:1.5rem;
          transition:box-shadow 0.3s ease;
        }
        .cd-card:hover { box-shadow:0 14px 36px rgba(139,111,71,0.10); }

        .cd-info-row {
          display:flex; align-items:flex-start; gap:0.75rem;
          padding:0.75rem; border-radius:12px;
          background:${T.bgAlt};
          border:1px solid rgba(176,137,90,0.12);
          transition:background 0.2s, box-shadow 0.2s;
        }
        .cd-info-row:hover { background:${T.accent}; box-shadow:0 4px 12px rgba(139,111,71,0.08); }

        .cd-info-icon {
          background:${T.card};
          border:1px solid rgba(176,137,90,0.2);
          border-radius:8px; padding:6px;
          display:flex; align-items:center; flex-shrink:0;
        }

        .cd-stat {
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:12px;
          padding:1rem;
          text-align:center;
          transition:box-shadow 0.25s ease, transform 0.25s ease;
        }
        .cd-stat:hover { box-shadow:0 8px 22px rgba(139,111,71,0.10); transform:translateY(-2px); }

        .cd-btn-primary {
          padding:0.6rem 1.4rem;
          background:linear-gradient(135deg,${T.primaryD},${T.primary});
          color:#fff; border:none; border-radius:10px;
          font-weight:700; font-size:0.88rem; font-family:inherit;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          box-shadow:0 4px 14px rgba(139,111,71,0.28);
          transition:all 0.25s ease;
        }
        .cd-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(139,111,71,0.36); }

        .cd-back-btn {
          display:inline-flex; align-items:center; gap:6px;
          background:${T.card}; border:1.5px solid ${T.border};
          border-radius:10px; padding:0.45rem 1rem;
          font-size:0.82rem; font-weight:600; font-family:inherit;
          color:${T.text}; cursor:pointer;
          transition:all 0.25s ease;
          box-shadow:0 2px 6px rgba(0,0,0,0.05);
          margin-bottom:1.25rem;
        }
        .cd-back-btn:hover { border-color:${T.primary}; color:${T.primaryD}; box-shadow:0 4px 14px rgba(176,137,90,0.18); }

        .cd-input {
          width:100%; padding:0.65rem 2.4rem 0.65rem 2.4rem;
          border:1.5px solid ${T.border}; border-radius:10px;
          font-size:0.88rem; font-family:inherit;
          background:${T.bg}; color:${T.textDark}; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cd-input:focus { border-color:${T.primary}; box-shadow:0 0 0 3px rgba(176,137,90,0.12); background:${T.card}; }
        .cd-input::placeholder { color:#b0bec5; }

        .cd-reporte-card {
          background:${T.card}; border:1.5px solid ${T.border};
          border-radius:14px; padding:1.25rem 1.5rem;
          cursor:pointer;
          transition:all 0.3s ease;
        }
        .cd-reporte-card:hover {
          border-color:rgba(176,137,90,0.4);
          box-shadow:0 12px 32px rgba(139,111,71,0.11);
          transform:translateY(-2px);
        }

        .cd-reporte-num {
          width:36px; height:36px; flex-shrink:0;
          background:${T.accent};
          border:1px solid rgba(176,137,90,0.25);
          border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:0.82rem; color:${T.primaryD};
          transition:transform 0.25s ease;
        }
        .cd-reporte-card:hover .cd-reporte-num { transform:scale(1.1); }

        .cd-empty {
          text-align:center; padding:4rem 1rem;
          background:${T.bgAlt};
          border:2px dashed rgba(176,137,90,0.25);
          border-radius:18px;
        }

        .cd-toast {
          position:fixed; top:1.25rem; right:1.25rem; z-index:10000;
          min-width:260px; max-width:380px;
          border-radius:12px; padding:0.85rem 1rem;
          display:flex; align-items:center; gap:0.65rem;
          box-shadow:0 8px 24px rgba(0,0,0,0.12);
          animation:cd-toast-in 0.3s ease both;
        }
        .cd-toast.success { background:#f0fdf4; border-left:3px solid #22c55e; }
        .cd-toast.error   { background:#fef2f2; border-left:3px solid #ef4444; }
        .cd-toast p { margin:0; font-size:0.82rem; font-weight:500; flex:1; }
        .cd-toast.success p { color:#15803d; }
        .cd-toast.error   p { color:#b91c1c; }
        .cd-toast-close { background:none;border:none;cursor:pointer;color:#94a3b8;padding:0;line-height:1; }

        .cd-2col { display:grid; grid-template-columns:1fr 2fr; gap:1.25rem; }
        .cd-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .cd-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; }
        @media(max-width:768px){
          .cd-2col { grid-template-columns:1fr; }
          .cd-info-grid { grid-template-columns:1fr; }
          .cd-root { padding:1rem; }
        }
        @media(max-width:480px){
          .cd-stats-grid { grid-template-columns:repeat(3,1fr); }
        }

        @keyframes cd-spin    { to{transform:rotate(360deg)} }
        @keyframes cd-toast-in{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
      `}</style>

      <div className="cd-root">

        {notification.show && (
          <div className={`cd-toast ${notification.type}`}>
            {notification.type === "success"
              ? <CheckCircle size={16} color="#22c55e"/>
              : <AlertCircle  size={16} color="#ef4444"/>}
            <p>{notification.message}</p>
            <button className="cd-toast-close"
              onClick={() => setNotification({ show:false, message:"", type:"success" })}>
              <X size={14}/>
            </button>
          </div>
        )}

        <button className="cd-back-btn" onClick={onBack}>
          <ArrowLeft size={14}/> Regresar a cultivos
        </button>

        <div className="cd-card" style={{ marginBottom:"1.25rem",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:3,
            background:`linear-gradient(90deg,${T.primaryD},${T.primary},${T.primaryD})` }}/>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
            flexWrap:"wrap",gap:"1rem",paddingTop:"0.5rem" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"0.85rem" }}>
              <div style={{ width:48,height:48,
                background:`linear-gradient(135deg,${T.primaryD},${T.primary})`,
                borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 6px 18px rgba(139,111,71,0.28)" }}>
                {getEstadoIcon(cultivo.estado)}
              </div>
              <div>
                <h1 style={{ margin:0,fontSize:"1.75rem",fontWeight:800,
                  color:T.textDark,letterSpacing:"-0.5px" }}>{cultivo.nombre}</h1>
                <p style={{ margin:"3px 0 0",fontSize:"0.78rem",color:T.text,
                  display:"flex",alignItems:"center",gap:4 }}>
                  <Clock size={11}/> Creado el {formatDate(cultivo.createdAt || new Date())}
                </p>
              </div>
            </div>
            <span style={{ background:estadoStyle.bg,color:estadoStyle.color,
              border:`1px solid ${estadoStyle.border}`,
              borderRadius:20,padding:"5px 14px",
              fontSize:"0.82rem",fontWeight:600,
              display:"inline-flex",alignItems:"center",gap:5 }}>
              {getEstadoIcon(cultivo.estado)}
              <span style={{ textTransform:"capitalize" }}>{cultivo.estado || "activo"}</span>
            </span>
          </div>
        </div>

        <div className="cd-2col" style={{ marginBottom:"1.25rem" }}>
          <div>
            {cultivo.imagen ? (
              <div style={{ borderRadius:16,overflow:"hidden",
                boxShadow:"0 8px 24px rgba(0,0,0,0.10)",position:"relative" }}>
                <img src={cultivo.imagen} alt={cultivo.nombre}
                  style={{ width:"100%",height:240,objectFit:"cover",
                    display:"block",transition:"transform 0.6s ease" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
              </div>
            ) : (
              <div style={{ width:"100%",height:240,
                background:T.bgAlt,borderRadius:16,
                border:`2px dashed rgba(176,137,90,0.25)`,
                display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:8 }}>
                <div style={{ width:56,height:56,background:T.accent,borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  border:`1px solid rgba(176,137,90,0.2)` }}>
                  <ImageIcon size={24} color={T.primaryD}/>
                </div>
                <p style={{ margin:0,fontSize:"0.8rem",color:T.text }}>Sin imagen disponible</p>
              </div>
            )}
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:"0.85rem" }}>
            <div className="cd-card" style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:"1rem" }}>
                <div style={{ width:3,height:22,background:`linear-gradient(180deg,${T.primaryD},${T.primary})`,
                  borderRadius:3 }}/>
                <p style={{ margin:0,fontSize:"0.72rem",fontWeight:700,
                  color:T.text,textTransform:"uppercase",letterSpacing:"1px" }}>
                  Información del cultivo
                </p>
              </div>
              <div className="cd-info-grid">
                {[
                  { icon:<MapPin size={15} color={T.primaryD}/>,  label:"Ubicación",           value:cultivo.ubicacion||"Sin especificar" },
                  { icon:<Calendar size={15} color={T.primaryD}/>, label:"Fecha de siembra",    value:formatDate(cultivo.fechaSiembra) },
                  { icon:<Droplets size={15} color={T.primaryD}/>, label:"Frecuencia de riego", value:`Cada ${cultivo.frecuenciaRiego||"—"} días` },
                  { icon:<Wind size={15} color={T.primaryD}/>,     label:"Tipo de cultivo",     value:cultivo.tipo||"Sin especificar" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="cd-info-row">
                    <div className="cd-info-icon">{icon}</div>
                    <div>
                      <p style={{ margin:0,fontSize:"0.7rem",color:T.text,marginBottom:2 }}>{label}</p>
                      <p style={{ margin:0,fontSize:"0.85rem",fontWeight:700,color:T.textDark }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-stats-grid">
              {[
                { value:reportes.length,   color:T.primaryD,  label:"Reportes",      icon:<FileText size={11}/> },
                { value:reportesSemana,    color:"#16a34a",   label:"Última semana", icon:<Calendar size={11}/> },
                { value:diasDesdeSiembra,  color:"#d97706",   label:"Días",          icon:<Sprout size={11}/> },
              ].map(({ value, color, label, icon }) => (
                <div key={label} className="cd-stat">
                  <p style={{ margin:0,fontSize:"1.8rem",fontWeight:800,color,lineHeight:1 }}>{value}</p>
                  <p style={{ margin:"4px 0 0",fontSize:"0.68rem",color:T.text,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:3 }}>
                    {icon}{label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
            flexWrap:"wrap",gap:"1rem",marginBottom:"1rem" }}>
            <div>
              <h2 style={{ margin:0,fontSize:"1.4rem",fontWeight:800,color:T.textDark,
                display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ display:"inline-block",width:4,height:24,
                  background:`linear-gradient(180deg,${T.primaryD},${T.primary})`,
                  borderRadius:3 }}/>
                Bitácora
              </h2>
              <p style={{ margin:"3px 0 0",fontSize:"0.78rem",color:T.text,
                display:"flex",alignItems:"center",gap:4 }}>
                <TrendingUp size={11}/>
                {filteredReportes.length} reporte{filteredReportes.length!==1?"s":""}
              </p>
            </div>
            <button className="cd-btn-primary" onClick={() => setIsReporteOpen(true)}>
              <Plus size={15}/> Registrar reporte
            </button>
          </div>

          <div style={{ position:"relative",marginBottom:"1rem" }}>
            <Search size={15} color="#94a3b8" style={{ position:"absolute",left:10,
              top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
            <input className="cd-input" type="text"
              placeholder="Buscar en la bitácora…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}
                style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:0 }}>
                <X size={13}/>
              </button>
            )}
          </div>

          {filteredReportes.length === 0 ? (
            <div className="cd-empty">
              <div style={{ width:60,height:60,background:T.accent,borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 1rem",border:`1px solid rgba(176,137,90,0.25)` }}>
                <FileText size={26} color={T.primaryD}/>
              </div>
              <p style={{ margin:"0 0 0.35rem",fontSize:"1.05rem",fontWeight:700,color:T.textDark }}>
                {searchTerm ? "No se encontraron reportes" : "Bitácora vacía"}
              </p>
              <p style={{ margin:"0 0 1.25rem",fontSize:"0.85rem",color:T.text }}>
                {searchTerm
                  ? `Sin resultados para "${searchTerm}"`
                  : "Comienza registrando el primer reporte"}
              </p>
              {!searchTerm && (
                <button className="cd-btn-primary" onClick={() => setIsReporteOpen(true)}>
                  <Plus size={15}/> Crear primer reporte
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
              {filteredReportes.map((reporte, index) => (
                <div key={reporte.id} className="cd-reporte-card">
                  <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.6rem" }}>
                    <div className="cd-reporte-num">{index + 1}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                      <span style={{ fontSize:"0.72rem",fontWeight:600,
                        background:T.accent,color:T.primaryD,
                        padding:"2px 10px",borderRadius:20,
                        border:`1px solid rgba(176,137,90,0.2)`,
                        display:"flex",alignItems:"center",gap:3 }}>
                        <Calendar size={10}/>{formatDateShort(reporte.createdAt)}
                      </span>
                      <span style={{ fontSize:"0.7rem",color:T.text }}>
                        {new Date(reporte.createdAt).toLocaleTimeString("es-MX",{ hour:"2-digit",minute:"2-digit" })}
                      </span>
                    </div>
                  </div>
                  <h4 style={{ margin:"0 0 0.35rem 2.75rem",fontSize:"0.95rem",fontWeight:700,
                    color:T.textDark,transition:"color 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=T.primaryD}
                    onMouseLeave={e=>e.currentTarget.style.color=T.textDark}>
                    {reporte.titulo}
                  </h4>
                  <p style={{ margin:"0 0 0 2.75rem",fontSize:"0.85rem",
                    color:T.text,lineHeight:1.6 }}>
                    {reporte.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <AddReporteModal
          isOpen={isReporteOpen}
          onClose={() => setIsReporteOpen(false)}
          cultivoId={cultivo.id}
          onSave={handleCreateReporte}
        />
      </div>
    </>
  );
}
