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
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
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
      case "/ferias":
        return "Férias de Colaboradores";
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
            
                <Button onClick={handleOpenMenu}>
                  Cadastros
                </Button>
            
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/usuarios");
                      handleCloseMenu();
                    }}
                  >
                    Usuários
                  </MenuItem>
            
                  <MenuItem
                    onClick={() => {
                      navigate("/projetos");
                      handleCloseMenu();
                    }}
                  >
                    Projetos
                  </MenuItem>
            
                  <MenuItem
                    onClick={() => {
                      navigate("/ferias");
                      handleCloseMenu();
                    }}
                  >
                    Férias
                  </MenuItem>
                </Menu>
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
