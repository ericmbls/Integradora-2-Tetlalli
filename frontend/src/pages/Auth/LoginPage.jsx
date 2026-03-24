import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario, registerUsuario } from "../../services/usuarios.service";
import { useAuth } from "../../context/AuthContext";
import { Sprout, Mail, Lock, User, ArrowLeft, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function LoginPage({ setIsLoggedIn, setToken }) {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ nombre: "", email: "", password: "" });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoToLanding = () => navigate("/");

  const handleInputChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "nombre":
        if (!isLoginActive && value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
        return "";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Ingresa un email válido (ejemplo: usuario@dominio.com)";
      case "password":
        if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
        if (!isLoginActive && value.length > 0 && !/(?=.*[A-Za-z])(?=.*\d)/.test(value))
          return "La contraseña debe contener al menos una letra y un número";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const errors = { nombre: "", email: "", password: "" };
    let valid = true;
    if (!isLoginActive) { const e = validateField("nombre", formData.nombre); if (e) { errors.nombre = e; valid = false; } }
    const ee = validateField("email", formData.email); if (ee) { errors.email = ee; valid = false; }
    const pe = validateField("password", formData.password); if (pe) { errors.password = pe; valid = false; }
    setFieldErrors(errors);
    if (!valid) setErrorMessage("Por favor, corrige los errores en el formulario");
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = isLoginActive
        ? await loginUsuario({ email: formData.email, password: formData.password })
        : await registerUsuario({ name: formData.nombre, email: formData.email, password: formData.password });
      login(res.access_token, res.user);
      setToken(res.access_token);
      setIsLoggedIn(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginActive(!isLoginActive);
    setFormData({ nombre: "", email: "", password: "" });
    setErrorMessage("");
    setFieldErrors({ nombre: "", email: "", password: "" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
          --bg:        #fffaf8;
          --bg-alt:    #fbefe1;
          --accent:    #f3e5ca;
          --primary:   #b0895a;
          --primary-d: #8B6F47;
          --primary-l: #d4a574;
          --text:      #4b5563;
          --text-dark: #2d3748;
          --border:    #e2e8f0;
          --card:      #ffffff;
          --glass:     rgba(255,255,255,0.85);
        }

        .lp-root * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }

        .lp-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(circle at 10% 20%, rgba(176,137,90,0.10) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(139,111,71,0.08) 0%, transparent 45%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        /* Back button */
        .lp-back {
          position: fixed;
          top: 1.25rem; left: 1.25rem;
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          z-index: 100;
        }
        .lp-back:hover { border-color: var(--primary); color: var(--primary-d); box-shadow: 0 4px 16px rgba(176,137,90,0.18); }
        .lp-back:hover .lp-back-icon { transform: translateX(-3px); }
        .lp-back-icon { transition: transform 0.25s ease; }

        /* Card wrapper */
        .lp-card {
          width: 100%; max-width: 960px;
          display: flex; flex-direction: column;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(139,111,71,0.14), 0 0 0 1px rgba(176,137,90,0.12);
          animation: lp-rise 0.55s cubic-bezier(0.23,1,0.32,1) both;
        }
        @keyframes lp-rise {
          from { opacity:0; transform: translateY(28px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* Sidebar */
        .lp-side {
          background: linear-gradient(145deg, var(--primary-d), #6b5436);
          padding: 3rem 2.5rem;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .lp-side::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%);
        }
        /* Decorative rings */
        .lp-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none;
        }
        .lp-ring-1 { width: 280px; height: 280px; top: -80px; left: -80px; }
        .lp-ring-2 { width: 200px; height: 200px; bottom: -60px; right: -60px; }
        .lp-ring-3 { width: 120px; height: 120px; top: 40%; left: 70%; }

        .lp-side-inner { position: relative; z-index: 2; }

        .lp-logo-wrap {
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.75rem;
          backdrop-filter: blur(8px);
        }

        .lp-side h2 {
          font-size: 2rem; font-weight: 800;
          color: #fff; margin: 0 0 0.75rem;
          letter-spacing: -0.5px;
        }
        .lp-side p {
          color: rgba(255,255,255,0.82);
          font-size: 0.95rem; line-height: 1.65;
          margin: 0 0 2rem;
        }

        .lp-toggle-btn {
          padding: 0.65rem 1.5rem;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          color: #fff; font-weight: 600; font-size: 0.88rem;
          cursor: pointer; font-family: inherit;
          transition: all 0.25s ease;
          backdrop-filter: blur(4px);
        }
        .lp-toggle-btn:hover { background: rgba(255,255,255,0.25); }

        /* Form panel */
        .lp-form-panel {
          background: var(--card);
          padding: 2.5rem 2.5rem;
          flex: 1; display: flex; flex-direction: column; justify-content: center;
        }

        /* Error banner */
        .lp-error {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.9rem 1rem;
          background: #fef2f2;
          border-left: 3px solid #ef4444;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          animation: lp-slide 0.3s ease both;
        }
        @keyframes lp-slide {
          from { opacity:0; transform: translateY(-8px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .lp-error p { margin: 0; font-size: 0.85rem; color: #b91c1c; flex: 1; }
        .lp-error-close { background: none; border: none; color: #f87171; cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1; }

        /* Form heading */
        .lp-form-head { text-align: center; margin-bottom: 2rem; }
        .lp-icon-wrap {
          width: 56px; height: 56px;
          background: var(--accent);
          border-radius: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
          border: 1px solid rgba(176,137,90,0.2);
        }
        .lp-form-head h2 {
          font-size: 1.75rem; font-weight: 800;
          color: var(--text-dark); margin: 0 0 0.3rem;
          letter-spacing: -0.5px;
        }
        .lp-form-head p { color: var(--text); font-size: 0.9rem; margin: 0; }

        /* Fields */
        .lp-field { margin-bottom: 1.1rem; }
        .lp-label {
          display: block;
          font-size: 0.82rem; font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.45rem;
          letter-spacing: 0.2px;
        }
        .lp-input-wrap { position: relative; }
        .lp-input-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; pointer-events: none;
        }
        .lp-input {
          width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.92rem; font-family: inherit;
          background: var(--bg);
          color: var(--text-dark);
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .lp-input::placeholder { color: #b0bec5; }
        .lp-input:focus {
          border-color: var(--primary);
          background: var(--card);
          box-shadow: 0 0 0 3px rgba(176,137,90,0.12);
        }
        .lp-input.error { border-color: #fca5a5; }
        .lp-field-error {
          display: flex; align-items: center; gap: 4px;
          margin-top: 0.35rem;
          font-size: 0.75rem; color: #ef4444;
        }

        /* Submit button */
        .lp-submit {
          width: 100%; margin-top: 0.5rem;
          padding: 0.85rem;
          background: linear-gradient(135deg, var(--primary-d), var(--primary));
          color: #fff;
          border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 700; font-family: inherit;
          letter-spacing: 0.4px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 6px 20px rgba(139,111,71,0.28);
        }
        .lp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(139,111,71,0.36);
          background: linear-gradient(135deg, #7a5f3c, var(--primary-d));
        }
        .lp-submit:active:not(:disabled) { transform: translateY(0); }
        .lp-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* Divider */
        .lp-divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.5rem 0 1rem;
        }
        .lp-divider-line { flex: 1; height: 1px; background: var(--border); }
        .lp-divider span { font-size: 0.78rem; color: var(--text); font-weight: 500; }

        /* Google button */
        .lp-google-btn {
          width: 100%; padding: 0.75rem 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.88rem; font-weight: 600; font-family: inherit;
          color: var(--text);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .lp-google-btn:hover {
          border-color: var(--primary);
          color: var(--primary-d);
          background: var(--bg-alt);
          box-shadow: 0 2px 12px rgba(176,137,90,0.12);
        }
        .lp-google-btn img { width: 18px; height: 18px; }

        /* Responsive */
        @media (min-width: 768px) {
          .lp-card { flex-direction: row; }
          .lp-side { width: 38%; flex-shrink: 0; }
          .lp-form-panel { padding: 3rem; }
        }
      `}</style>

      <div className="lp-root">
        <button className="lp-back" onClick={handleGoToLanding}>
          <ArrowLeft size={16} className="lp-back-icon" />
          Volver al inicio
        </button>

        <div className="lp-card">
          {/* Sidebar */}
          <div className="lp-side">
            <div className="lp-ring lp-ring-1" />
            <div className="lp-ring lp-ring-2" />
            <div className="lp-ring lp-ring-3" />
            <div className="lp-side-inner">
              <div className="lp-logo-wrap">
                <Sprout size={36} color="#fff" />
              </div>
              <h2>{isLoginActive ? "¡Hola de nuevo!" : "¡Bienvenido!"}</h2>
              <p>
                {isLoginActive
                  ? "Ingresa a tu cuenta para gestionar tus cultivos y mantener tu huerto digital organizado."
                  : "Crea tu cuenta y comienza a gestionar tus cultivos de manera inteligente."}
              </p>
              <button className="lp-toggle-btn" onClick={toggleMode}>
                {isLoginActive ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </div>

          {/* Form panel */}
          <div className="lp-form-panel">
            {errorMessage && (
              <div className="lp-error">
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <p>{errorMessage}</p>
                <button className="lp-error-close" onClick={() => setErrorMessage("")}>×</button>
              </div>
            )}

            <div className="lp-form-head">
              <div className="lp-icon-wrap">
                {isLoginActive
                  ? <LogIn size={26} color="#8B6F47" />
                  : <UserPlus size={26} color="#8B6F47" />}
              </div>
              <h2>{isLoginActive ? "Iniciar sesión" : "Crear cuenta"}</h2>
              <p>{isLoginActive ? "Usa tu correo y contraseña para acceder" : "Regístrate para comenzar a gestionar tus cultivos"}</p>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLoginActive && (
                <div className="lp-field">
                  <label className="lp-label">Nombre completo</label>
                  <div className="lp-input-wrap">
                    <User size={16} className="lp-input-icon" />
                    <input
                      className={`lp-input${fieldErrors.nombre ? " error" : ""}`}
                      type="text" name="nombre" value={formData.nombre}
                      onChange={handleInputChange} onBlur={handleBlur}
                      required disabled={loading} placeholder="Tu nombre completo" autoComplete="name"
                    />
                  </div>
                  {fieldErrors.nombre && (
                    <div className="lp-field-error">
                      <AlertCircle size={11} />{fieldErrors.nombre}
                    </div>
                  )}
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label">Correo electrónico</label>
                <div className="lp-input-wrap">
                  <Mail size={16} className="lp-input-icon" />
                  <input
                    className={`lp-input${fieldErrors.email ? " error" : ""}`}
                    type="email" name="email" value={formData.email}
                    onChange={handleInputChange} onBlur={handleBlur}
                    required disabled={loading} placeholder="ejemplo@correo.com" autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <div className="lp-field-error">
                    <AlertCircle size={11} />{fieldErrors.email}
                  </div>
                )}
              </div>

              <div className="lp-field">
                <label className="lp-label">Contraseña</label>
                <div className="lp-input-wrap">
                  <Lock size={16} className="lp-input-icon" />
                  <input
                    className={`lp-input${fieldErrors.password ? " error" : ""}`}
                    type="password" name="password" value={formData.password}
                    onChange={handleInputChange} onBlur={handleBlur}
                    required disabled={loading}
                    placeholder={isLoginActive ? "Mínimo 6 caracteres" : "Una letra y un número"}
                    autoComplete={isLoginActive ? "current-password" : "new-password"}
                  />
                </div>
                {fieldErrors.password && (
                  <div className="lp-field-error">
                    <AlertCircle size={11} />{fieldErrors.password}
                  </div>
                )}
              </div>

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? (
                  <><div className="lp-spinner" /><span>Cargando...</span></>
                ) : isLoginActive ? (
                  <><LogIn size={17} /><span>Iniciar sesión</span></>
                ) : (
                  <><UserPlus size={17} /><span>Registrarse</span></>
                )}
              </button>
            </form>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span>O continúa con</span>
              <div className="lp-divider-line" />
            </div>

            <button
              type="button"
              className="lp-google-btn"
              onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`; }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              Continuar con Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
