import { useState, useEffect } from "react";
import {
  Sprout, AlertCircle, Droplets, CloudSun, CloudRain, Sun,
  Thermometer, TrendingUp, Calendar, MapPin, Leaf, BarChart3,
  Activity, Check, Wind, Gauge, ArrowUp, ArrowDown, Clock
} from "lucide-react";

const T = {
  bg:       "#fffaf8",
  bgAlt:    "#fbefe1",
  accent:   "#f3e5ca",
  card:     "#ffffff",
  border:   "#e2e8f0",
  primary:  "#b0895a",
  primaryD: "#8B6F47",
  primaryL: "#d4a574",
  text:     "#4b5563",
  textDark: "#2d3748",
};

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token de autenticación");
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
};

const SectionTitle = ({ icon: Icon, label }) => (
  <h3 style={{ display:"flex", alignItems:"center", gap:"0.5rem", margin:0,
    fontWeight:700, fontSize:"0.95rem", color: T.textDark }}>
    <span style={{ background: T.accent, borderRadius:8, padding:"5px 6px",
      display:"flex", alignItems:"center", border:`1px solid rgba(176,137,90,0.2)` }}>
      <Icon size={16} color={T.primaryD} />
    </span>
    {label}
  </h3>
);

const Card = ({ children, style = {}, className = "" }) => (
  <div className={`db-card ${className}`} style={style}>{children}</div>
);

const Badge = ({ label, variant = "default" }) => {
  const variants = {
    default: { background: T.accent,  color: T.primaryD },
    alta:    { background:"#fee2e2",   color:"#b91c1c"   },
    media:   { background:"#fef3c7",   color:"#92400e"   },
    baja:    { background:"#d1fae5",   color:"#065f46"   },
  };
  const s = variants[variant] || variants.default;
  return (
    <span style={{ ...s, fontSize:"0.68rem", fontWeight:600, padding:"2px 8px",
      borderRadius:20, letterSpacing:"0.2px" }}>{label}</span>
  );
};

export default function DashboardPage() {
  const [kpis, setKpis]                               = useState([]);
  const [zonasCultivo, setZonasCultivo]               = useState([]);
  const [actividad, setActividad]                     = useState([]);
  const [cultivosRecientes, setCultivosRecientes]     = useState([]);
  const [cultivosPorTipo, setCultivosPorTipo]         = useState([]);
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState(null);
  const [hoveredZone, setHoveredZone]                 = useState(null);

  const pronostico = [
    { day:"Lun", icon:<Sun size={18} color="#d97706"/>,      temp:"24°", max:26, min:18 },
    { day:"Mar", icon:<CloudSun size={18} color={T.text}/>,  temp:"22°", max:24, min:16 },
    { day:"Mié", icon:<CloudRain size={18} color={T.text}/>, temp:"20°", max:22, min:15 },
    { day:"Jue", icon:<Sun size={18} color="#d97706"/>,      temp:"23°", max:25, min:17 },
    { day:"Vie", icon:<Sun size={18} color="#d97706"/>,      temp:"25°", max:27, min:19 },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) throw new Error("API_URL no está definida");
        const data = await fetchWithAuth(`${API_URL}/api/cultivos`);

        setKpis([{
          title:"Total de cultivos", value:data.length,
          sub:"Registrados en el sistema",
          icon:<Sprout size={22} />, trend:"+12%", trendUp:true,
        }]);

        setZonasCultivo(data.map(c => ({
          id:c.id, name:c.nombre, lugar:c.ubicacion||"Sin ubicación",
          humedad:c.humedad?`${c.humedad}%`:"—", humedadValue:c.humedad||0,
          temp:c.temperatura?`${c.temperatura}°C`:"—", tempValue:c.temperatura||0,
          status:(c.humedad??0)<60||(c.temperatura??0)>30?"alert":"ok",
        })));

        const recientes = [...data].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
        setCultivosRecientes(recientes);
        setActividad(recientes.map(c=>({
          id:c.id, text:`Se registró "${c.nombre}"`,
          date:new Date(c.createdAt).toLocaleDateString('es-MX',{day:'numeric',month:'short'}),
        })));

        const conteo = {};
        data.forEach(c=>{ const t=c.tipo||"Sin tipo"; conteo[t]=(conteo[t]||0)+1; });
        setCultivosPorTipo(Object.entries(conteo).map(([tipo,total])=>({tipo,total})));

        setActividadesPendientes([
          {id:1,tarea:"Riego programado - Zona Norte",     fecha:"Hoy, 10:00 AM",    completada:false, prioridad:"alta"},
          {id:2,tarea:"Fertilización - Cultivo de maíz",  fecha:"Mañana, 8:30 AM",  completada:false, prioridad:"media"},
          {id:3,tarea:"Control de plagas",                 fecha:"15 Mar, 2:00 PM",  completada:false, prioridad:"alta"},
          {id:4,tarea:"Cosecha - Tomates",                 fecha:"18 Mar, 9:00 AM",  completada:false, prioridad:"baja"},
        ]);
      } catch (err) {
        setError(err.message||"Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completarActividad = (id) =>
    setActividadesPendientes(prev=>prev.map(a=>a.id===id?{...a,completada:true}:a));

  const maxTipo = cultivosPorTipo.length ? Math.max(...cultivosPorTipo.map(t=>t.total)) : 1;

  if (loading) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:"60vh",background:T.bg }}>
      <div style={{ position:"relative",width:64,height:64 }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",
          border:`3px solid ${T.accent}`,borderTopColor:T.primaryD,
          animation:"db-spin 0.8s linear infinite" }}/>
        <Sprout size={22} color={T.primaryD} style={{ position:"absolute",
          top:"50%",left:"50%",transform:"translate(-50%,-50%)" }}/>
      </div>
      <p style={{ marginTop:"1rem",color:T.text,fontSize:"0.9rem" }}>Cargando dashboard…</p>
    </div>
  );

  if (error) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:"60vh",background:T.bg }}>
      <div style={{ width:64,height:64,background:"#fee2e2",borderRadius:"50%",
        display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem" }}>
        <AlertCircle size={32} color="#ef4444"/>
      </div>
      <p style={{ color:"#b91c1c",fontWeight:600,marginBottom:"1rem" }}>{error}</p>
      <button onClick={()=>window.location.reload()} style={{
        padding:"0.6rem 1.5rem",
        background:`linear-gradient(135deg,${T.primaryD},${T.primary})`,
        color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",
        boxShadow:"0 4px 14px rgba(139,111,71,0.3)"
      }}>Reintentar</button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .db-root * { font-family:'Outfit',sans-serif; box-sizing:border-box; }
        .db-root {
          padding:1.75rem;
          max-width:1280px;
          margin:0 auto;
          background:${T.bg};
          min-height:100vh;
        }

        .db-card {
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:16px;
          padding:1.5rem;
          transition:box-shadow 0.3s ease, transform 0.3s ease;
        }
        .db-card:hover { box-shadow:0 16px 40px rgba(139,111,71,0.10); }

        .db-kpi {
          background:${T.bgAlt};
          border:1px solid rgba(176,137,90,0.18);
          border-radius:16px;
          padding:1.5rem;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:1rem;
          transition:box-shadow 0.3s ease, transform 0.3s ease;
        }
        .db-kpi:hover { box-shadow:0 12px 32px rgba(139,111,71,0.14); transform:translateY(-2px); }

        .db-zone {
          padding:0.85rem;
          border-radius:12px;
          text-align:center;
          cursor:pointer;
          transition:transform 0.25s ease, box-shadow 0.25s ease;
          position:relative;
        }
        .db-zone:hover { transform:scale(1.05); box-shadow:0 8px 20px rgba(0,0,0,0.08); }
        .db-zone.ok    { background:${T.accent};  border:1px solid rgba(176,137,90,0.22); }
        .db-zone.alert { background:#fee2e2;        border:1px solid #fca5a5; }

        .db-forecast-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:0.5rem 0.5rem;
          border-bottom:1px solid ${T.border};
          border-radius:8px;
          transition:background 0.2s;
        }
        .db-forecast-row:last-child { border-bottom:none; }
        .db-forecast-row:hover { background:${T.bgAlt}; }

        .db-act-row {
          display:flex; align-items:center; gap:0.65rem;
          padding:0.55rem 0.5rem;
          border-radius:10px;
          transition:background 0.2s, transform 0.2s;
        }
        .db-act-row:hover { background:${T.bgAlt}; transform:translateX(3px); }

        /* Task row */
        .db-task {
          display:flex; align-items:center; gap:0.75rem;
          padding:0.75rem;
          border-radius:12px;
          transition:background 0.2s, transform 0.2s;
        }
        .db-task:hover { background:${T.bgAlt}; transform:translateX(3px); }

        .db-complete-btn {
          padding:0.35rem 0.75rem;
          font-size:0.75rem;
          font-weight:600;
          font-family:inherit;
          border:1.5px solid ${T.border};
          background:${T.bg};
          color:${T.text};
          border-radius:8px;
          cursor:pointer;
          display:flex; align-items:center; gap:4px;
          transition:all 0.25s ease;
          white-space:nowrap;
        }
        .db-complete-btn:hover {
          background:linear-gradient(135deg,${T.primaryD},${T.primary});
          color:#fff; border-color:transparent;
        }

        .db-bar-track {
          width:100%; height:6px;
          background:${T.accent};
          border-radius:6px; overflow:hidden;
          margin-top:4px;
        }
        .db-bar-fill {
          height:100%;
          background:linear-gradient(90deg,${T.primaryD},${T.primary});
          border-radius:6px;
          transition:width 1s ease;
        }

        .db-temp-track { width:48px; height:4px; background:${T.accent}; border-radius:4px; overflow:hidden; }
        .db-temp-fill  { height:100%; background:linear-gradient(90deg,#d97706,#f59e0b); border-radius:4px; }

        .db-btn-primary {
          padding:0.6rem 1.4rem;
          background:linear-gradient(135deg,${T.primaryD},${T.primary});
          color:#fff; border:none; border-radius:10px;
          font-weight:700; font-size:0.88rem; font-family:inherit;
          cursor:pointer; display:flex; align-items:center; gap:6px;
          box-shadow:0 4px 14px rgba(139,111,71,0.28);
          transition:all 0.25s ease;
        }
        .db-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(139,111,71,0.36); }

        .db-icon-bg {
          background:${T.accent};
          border:1px solid rgba(176,137,90,0.2);
          border-radius:8px;
          padding:5px 6px;
          display:flex; align-items:center;
        }

        .db-tooltip {
          position:absolute; bottom:-22px; left:50%;
          transform:translateX(-50%);
          background:${T.textDark}; color:#fff;
          font-size:0.65rem; padding:2px 8px;
          border-radius:20px; white-space:nowrap;
          pointer-events:none;
        }

        .db-grid    { display:grid; gap:1.25rem; }
        .db-col-1   { grid-template-columns:1fr; }
        .db-col-2   { grid-template-columns:repeat(2,1fr); }
        .db-col-3   { grid-template-columns:repeat(3,1fr); }
        .db-col-23  { grid-template-columns:2fr 1fr; }

        @media(max-width:900px){
          .db-col-3  { grid-template-columns:repeat(2,1fr); }
          .db-col-23 { grid-template-columns:1fr; }
          .db-col-2  { grid-template-columns:1fr; }
        }
        @media(max-width:600px){
          .db-col-3  { grid-template-columns:1fr; }
          .db-root   { padding:1rem; }
        }

        @keyframes db-spin { to { transform:rotate(360deg); } }
        @keyframes db-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .db-anim { animation:db-up 0.45s ease both; }
      `}</style>

      <div className="db-root">

        {/* ── Header ── */}
        <div style={{ display:"flex",alignItems:"center",marginBottom:"1.75rem",gap:"0.75rem" }}>
          <div style={{ width:44,height:44,background:`linear-gradient(135deg,${T.primaryD},${T.primary})`,
            borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 6px 18px rgba(139,111,71,0.28)` }}>
            <BarChart3 size={20} color="#fff"/>
          </div>
          <div>
            <h1 style={{ margin:0,fontSize:"1.6rem",fontWeight:800,
              color:T.textDark,letterSpacing:"-0.5px" }}>Inicio</h1>
            <p style={{ margin:0,fontSize:"0.82rem",color:T.text,
              display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
              <Activity size={12}/> Bienvenido a tu resumen agrícola
            </p>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="db-grid db-col-1" style={{ marginBottom:"1.25rem" }}>
          {kpis.map((kpi,i)=>(
            <div key={kpi.title} className="db-kpi db-anim" style={{ animationDelay:`${i*80}ms` }}>
              <div>
                <p style={{ margin:0,fontSize:"0.8rem",fontWeight:600,color:T.text }}>{kpi.title}</p>
                <p style={{ margin:"0.4rem 0",fontSize:"2.8rem",fontWeight:800,
                  color:T.textDark,lineHeight:1 }}>{kpi.value}</p>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                  <p style={{ margin:0,fontSize:"0.78rem",color:T.text,
                    display:"flex",alignItems:"center",gap:3 }}>
                    <Activity size={11}/>{kpi.sub}
                  </p>
                  {kpi.trend && (
                    <span style={{ fontSize:"0.75rem",fontWeight:600,
                      color:kpi.trendUp?"#16a34a":"#dc2626",
                      display:"flex",alignItems:"center",gap:2 }}>
                      {kpi.trendUp?<ArrowUp size={10}/>:<ArrowDown size={10}/>}{kpi.trend}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ background:T.accent,border:`1px solid rgba(176,137,90,0.2)`,
                padding:"0.75rem",borderRadius:12,color:T.primaryD,flexShrink:0 }}>
                {kpi.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Mapa + Pronóstico ── */}
        <div className="db-grid db-col-23" style={{ marginBottom:"1.25rem" }}>
          <Card className="db-anim">
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem" }}>
              <SectionTitle icon={MapPin} label="Mapa de cultivos"/>
              <Badge label={`${zonasCultivo.length} activos`}/>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"0.75rem" }}>
              {zonasCultivo.slice(0,8).map(zone=>(
                <div key={zone.id}
                  className={`db-zone ${zone.status}`}
                  onMouseEnter={()=>setHoveredZone(zone.id)}
                  onMouseLeave={()=>setHoveredZone(null)}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:4 }}>
                    <Sprout size={14} color={zone.status==="alert"?"#dc2626":T.primaryD}/>
                    <p style={{ margin:0,fontSize:"0.82rem",fontWeight:700,color:T.textDark }}>{zone.name}</p>
                  </div>
                  <p style={{ margin:0,fontSize:"0.68rem",color:T.text,overflow:"hidden",
                    textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{zone.lugar}</p>
                  {zone.humedad!=="—" && (
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",
                      gap:6,marginTop:6,fontSize:"0.68rem",color:T.text }}>
                      <span style={{ display:"flex",alignItems:"center",gap:2 }}>
                        <Droplets size={10} color="#60a5fa"/>{zone.humedad}
                      </span>
                      <span style={{ width:1,height:10,background:T.border }}/>
                      <span style={{ display:"flex",alignItems:"center",gap:2 }}>
                        <Thermometer size={10} color="#f97316"/>{zone.temp}
                      </span>
                    </div>
                  )}
                  {hoveredZone===zone.id && zone.humedadValue>0 && (
                    <div className="db-tooltip">
                      {zone.humedadValue<60?"Humedad baja":zone.tempValue>30?"Temperatura alta":"Condiciones óptimas"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="db-anim" style={{ animationDelay:"80ms" }}>
            <div style={{ marginBottom:"1.25rem" }}><SectionTitle icon={CloudSun} label="Pronóstico 5 días"/></div>
            <div>
              {pronostico.map(day=>(
                <div key={day.day} className="db-forecast-row">
                  <span style={{ fontWeight:600,fontSize:"0.85rem",color:T.text,width:30 }}>{day.day}</span>
                  {day.icon}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginLeft:"auto" }}>
                    <span style={{ fontSize:"0.78rem",color:T.text }}>{day.min}°</span>
                    <div className="db-temp-track">
                      <div className="db-temp-fill" style={{ width:`${((day.max-15)/20)*100}%` }}/>
                    </div>
                    <span style={{ fontSize:"0.85rem",fontWeight:700,color:T.textDark }}>{day.temp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="db-grid db-col-3" style={{ marginBottom:"1.25rem" }}>
          <Card className="db-anim">
            <div style={{ marginBottom:"1rem" }}><SectionTitle icon={TrendingUp} label="Recientes"/></div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.25rem" }}>
              {cultivosRecientes.map(c=>(
                <div key={c.id} className="db-act-row">
                  <Leaf size={14} color={T.primaryD}/>
                  <p style={{ margin:0,fontSize:"0.85rem",color:T.textDark }}>{c.nombre}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="db-anim" style={{ animationDelay:"60ms" }}>
            <div style={{ marginBottom:"1rem" }}><SectionTitle icon={Clock} label="Actividad reciente"/></div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.25rem" }}>
              {actividad.map(a=>(
                <div key={a.id} style={{ display:"flex",alignItems:"center",
                  justifyContent:"space-between",padding:"0.45rem 0.5rem",
                  borderRadius:8,transition:"background 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=T.bgAlt}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <p style={{ margin:0,fontSize:"0.82rem",color:T.textDark }}>{a.text}</p>
                  <span style={{ fontSize:"0.68rem",color:T.text,background:T.accent,
                    padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap",marginLeft:6 }}>{a.date}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="db-anim" style={{ animationDelay:"120ms" }}>
            <div style={{ marginBottom:"1rem" }}><SectionTitle icon={Gauge} label="Distribución por tipo"/></div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
              {cultivosPorTipo.map(t=>(
                <div key={t.tipo}>
                  <div style={{ display:"flex",justifyContent:"space-between",
                    marginBottom:4,alignItems:"center" }}>
                    <span style={{ fontSize:"0.82rem",color:T.text }}>{t.tipo}</span>
                    <span style={{ fontSize:"0.82rem",fontWeight:700,color:T.primaryD }}>{t.total}</span>
                  </div>
                  <div className="db-bar-track">
                    <div className="db-bar-fill" style={{ width:`${(t.total/maxTipo)*100}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="db-grid db-col-2">
          <Card className="db-anim">
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem" }}>
              <SectionTitle icon={Calendar} label="Próximas actividades"/>
              <span style={{ fontSize:"0.72rem",fontWeight:600,color:T.primaryD,
                background:T.accent,padding:"2px 10px",borderRadius:20,
                border:`1px solid rgba(176,137,90,0.2)` }}>
                {actividadesPendientes.filter(a=>!a.completada).length} pendientes
              </span>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.4rem" }}>
              {actividadesPendientes.filter(a=>!a.completada).map(act=>(
                <div key={act.id} className="db-task">
                  <div style={{ width:40,height:40,background:T.accent,
                    border:`1px solid rgba(176,137,90,0.2)`,
                    borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Sprout size={18} color={T.primaryD}/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                      <p style={{ margin:0,fontSize:"0.85rem",fontWeight:600,color:T.textDark }}>{act.tarea}</p>
                      <Badge label={act.prioridad} variant={act.prioridad}/>
                    </div>
                    <p style={{ margin:"3px 0 0",fontSize:"0.72rem",color:T.text,
                      display:"flex",alignItems:"center",gap:3 }}>
                      <Calendar size={10}/>{act.fecha}
                    </p>
                  </div>
                  <button className="db-complete-btn" onClick={()=>completarActividad(act.id)}>
                    <Check size={11}/> Completar
                  </button>
                </div>
              ))}
              {actividadesPendientes.filter(a=>!a.completada).length===0 && (
                <div style={{ textAlign:"center",padding:"2.5rem 0" }}>
                  <div style={{ width:52,height:52,background:"#d1fae5",borderRadius:"50%",
                    display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem" }}>
                    <Check size={24} color="#16a34a"/>
                  </div>
                  <p style={{ margin:0,fontWeight:600,color:T.textDark }}>¡Todo al día!</p>
                  <p style={{ margin:"4px 0 0",fontSize:"0.78rem",color:T.text }}>No quedan tareas pendientes</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="db-anim" style={{ animationDelay:"80ms" }}>
            <div style={{ marginBottom:"1.25rem" }}>
              <SectionTitle icon={Check} label="Actividades completadas"/>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.4rem" }}>
              {actividadesPendientes.filter(a=>a.completada).map(act=>(
                <div key={act.id} className="db-task"
                  style={{ background:T.bgAlt,border:`1px solid rgba(176,137,90,0.12)` }}>
                  <div style={{ width:40,height:40,background:"#d1fae5",
                    borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Check size={18} color="#16a34a"/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ margin:0,fontSize:"0.85rem",color:T.text,textDecoration:"line-through" }}>{act.tarea}</p>
                    <p style={{ margin:"3px 0 0",fontSize:"0.72rem",color:T.text,
                      display:"flex",alignItems:"center",gap:3 }}>
                      <Calendar size={10}/>{act.fecha}
                    </p>
                  </div>
                </div>
              ))}
              {actividadesPendientes.filter(a=>a.completada).length===0 && (
                <div style={{ textAlign:"center",padding:"2.5rem 0" }}>
                  <div style={{ width:52,height:52,background:T.accent,borderRadius:"50%",
                    display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem",
                    border:`1px solid rgba(176,137,90,0.2)` }}>
                    <Wind size={22} color={T.primaryD}/>
                  </div>
                  <p style={{ margin:0,fontWeight:600,color:T.textDark }}>Sin completadas aún</p>
                  <p style={{ margin:"4px 0 0",fontSize:"0.78rem",color:T.text }}>Completa tareas para verlas aquí</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

    </>
  );
}
