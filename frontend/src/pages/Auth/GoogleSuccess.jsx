import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token && userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      login(token, user);
      navigate("/app");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Iniciando sesión con Google...</p>;
}