import { useState } from 'react';
import { LayoutDashboard, Sprout, BarChart3, Users, Settings, ChevronLeft, LogOut, X, AlertCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentPage, onNavigate, role = 'admin', isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const menu = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: 'cultivos', label: 'Cultivos', icon: <Sprout size={20} /> },
    { id: 'reportes', label: 'Reportes', icon: <BarChart3 size={20} /> },
  ];

  if (role === 'admin') {
    menu.push({ id: 'usuarios', label: 'Usuarios', icon: <Users size={20} /> });
  }

  menu.push({ id: 'ajustes', label: 'Ajustes', icon: <Settings size={20} /> });

  const handleLogout = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmLogout(false);
  };

  const handleCloseConfirm = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      setShowConfirmLogout(false);
    }, 200);
  };

  const sidebarClasses = `
    fixed lg:static inset-y-0 left-0 z-50
    w-[260px] h-screen
    px-6 py-8
    flex flex-col
    transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    bg-gradient-to-b from-[#fffaf8] via-[#fbefe1] to-[#f3e5ca] text-gray-800
    shadow-[4px_0_30px_rgba(16,24,40,0.06)]
    lg:shadow-none
  `;

  const headerTitleClasses = `
    text-lg font-semibold
    text-[#5c4731]
  `;

  const navItemClasses = (isActive) => `
    w-full flex items-center gap-3.5 px-4 py-3 rounded-[14px]
    text-sm font-medium transition-all duration-250 ease
    ${isActive 
      ? 'bg-white text-[#8b6f47] shadow-[0_6px_18px_rgba(139,111,71,0.12)]'
      : 'text-gray-500 hover:bg-[rgba(139,111,71,0.08)] hover:text-[#5c4731]'
    }
  `;

  const footerClasses = `
    mt-auto pt-6 border-t
    border-[rgba(139,111,71,0.15)]
  `;

  const avatarClasses = `
    w-[38px] h-[38px] rounded-xl bg-[#8b6f47] text-white font-semibold
    flex items-center justify-center shadow-sm
  `;

  const userNameClasses = `
    text-sm font-semibold
    text-[#5c4731]
  `;

  const userRoleClasses = `
    text-xs
    text-gray-400
  `;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center gap-3 mb-10">
          <img src={logo} alt="Tetlalli" className="w-[38px] h-[38px] rounded-xl object-cover" />
          <h1 className={headerTitleClasses}>Tetlalli</h1>
          <button
            onClick={onClose}
            className="absolute top-8 right-4 p-2 lg:hidden hover:bg-black/5 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={navItemClasses(currentPage === item.id)}
            >
              <span className={`
                flex items-center transition-colors
                ${currentPage === item.id 
                  ? 'text-[#8b6f47]' 
                  : 'text-gray-400'
                }
              `}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'usuarios' && role === 'admin' && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#8b6f47]/10 text-[#8b6f47]">
                  Admin
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={footerClasses}>
          <div className="flex items-center gap-3">
            <div className={avatarClasses}>
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex flex-col">
              <span className={userNameClasses}>{user?.name || "Invitado"}</span>
              <span className={userRoleClasses}>{user?.role || "Usuario"}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto p-2 hover:bg-black/5 rounded-lg transition-colors group"
              title="Cerrar sesión"
            >
              <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {showConfirmLogout && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-3 sm:p-4 transition-all duration-200"
          onClick={handleCloseConfirm}
        >
          <div
            className={`bg-white rounded-2xl w-[calc(100%-2rem)] sm:w-full max-w-md shadow-2xl relative overflow-hidden transition-all duration-300 mx-2 sm:mx-0 ${
              isAnimatingOut 
                ? "opacity-0 scale-95 translate-y-4" 
                : "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500"></div>
            
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut size={20} className="sm:w-5 sm:h-5 text-red-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Cerrar sesión
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                ¿Seguro que deseas cerrar sesión? Deberás iniciar sesión nuevamente para acceder a tu cuenta.
              </p>

              <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 rounded-lg mb-5 sm:mb-6">
                <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-red-600">
                  Serás redirigido a la página de inicio de sesión.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={handleCloseConfirm}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <LogOut size={12} className="sm:w-3.5 sm:h-3.5" />
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInBottom {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        
        .animate-in {
          animation-fill-mode: forwards;
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .zoom-in-95 {
          animation: zoomIn 0.3s ease-out forwards;
        }
        
        .slide-in-from-bottom-4 {
          animation: slideInBottom 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}