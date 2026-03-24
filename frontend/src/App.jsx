import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import GoogleSuccess from "./pages/Auth/GoogleSuccess";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import CultivosPage from "./pages/Cultivos/CultivosPage";
import ReportesPage from "./pages/Reportes/ReportesPage";
import UsuariosPage from "./pages/Usuarios/UsuariosPage";
import AjustesPage from "./pages/Ajustes/AjustesPage";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import LandingPage from "./pages/Landing/LandingPage";
import CultivoDetallePage from "./pages/Cultivos/CultivoDetallePage";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function AppLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedCultivo, setSelectedCultivo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole] = useState("admin");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [darkMode]);

  const pageConfig = {
    dashboard: { component: DashboardPage, title: "Inicio" },
    cultivos: { component: CultivosPage, title: "Cultivos" },
    cultivoDetalle: { component: CultivoDetallePage, title: "Detalle del Cultivo" },
    reportes: { component: ReportesPage, title: "Reportes" },
    usuarios: { component: UsuariosPage, title: "Usuarios" },
    ajustes: { component: AjustesPage, title: "Ajustes" },
  };

  const { component: CurrentPage, title } = pageConfig[currentPage];

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
        role={userRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="main-layout">
        <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />

        {currentPage === "cultivoDetalle" ? (
          <CultivoDetallePage
            cultivo={selectedCultivo}
            onBack={() => setCurrentPage("cultivos")}
          />
        ) : (
          <CurrentPage
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            cultivo={selectedCultivo}
            onOpenCultivo={(cultivo) => {
              setSelectedCultivo(cultivo);
              setCurrentPage("cultivoDetalle");
            }}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/app" />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route path="/auth/success" element={<GoogleSuccess />} />

      <Route
        path="/app"
        element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;