import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function obterTitulo() {
    switch (location.pathname) {
      case "/":
      case "/lancamento":
        return "Relatório Diário de Obras (RDO)";
      case "/meus-relatorios":
        return "Meus Relatórios";
      case "/admin":
        return "Painel Administrativo";
      case "/usuarios":
        return "Usuários";
      case "/projetos":
        return "Projetos";
      default:
        return "";
    }
  }

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#e9ece8",
          color: "#333",
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          
          {/* LADO ESQUERDO - LOGO + TÍTULO */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 45 }}
            />
            <Typography variant="h6" fontWeight="bold">
              {obterTitulo()}
            </Typography>
          </Box>

          {/* LADO DIREITO - BOTÕES */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={() => navigate("/")}>
              Relatório
            </Button>

            <Button onClick={() => navigate("/meus-relatorios")}>
              Meus Relatórios
            </Button>

            {usuario?.perfil === "admin" && (
              <>
                <Button onClick={() => navigate("/admin")}>
                  Admin
                </Button>

                <Button onClick={() => navigate("/usuarios")}>
                  Usuários
                </Button>

                <Button onClick={() => navigate("/projetos")}>
                  Projetos
                </Button>
              </>
            )}

            <Button color="error" onClick={logout}>
              Logout
            </Button>
          </Box>

        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </>
  );
}
