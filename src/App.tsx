import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Lancamento from "./pages/Lancamento";
import Admin from "./pages/Admin";
import Usuarios from "./pages/Usuarios";
import Login from "./pages/Login";
import Projetos from "./pages/Projetos";
import MeusRelatorios from "./pages/MeusRelatorios";
import Layout from "./layout/Layout";
import AdminVerRelatorio from "./pages/AdminVerRelatorio";

function PrivateRoute({ children, perfil }: any) {
  const { usuario, loading } = useAuth();

  if (loading) return null; // 👈 espera carregar

  if (!usuario) return <Navigate to="/login" />;

  if (perfil && usuario.perfil !== perfil)
    return <Navigate to="/" />;

  return children;
}


function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* ROTAS PROTEGIDAS COM LAYOUT */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* PÁGINAS USUÁRIO */}
        <Route path="/" element={<Lancamento />} />
        <Route path="/lancamento" element={<Lancamento />} />
        <Route path="/meus-relatorios" element={<MeusRelatorios />} />

        {/* PÁGINAS ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute perfil="admin">
              <Admin />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/ver/:id"
          element={
            <PrivateRoute perfil="admin">
              <AdminVerRelatorio />
            </PrivateRoute>
          }
        />

        <Route
          path="/projetos"
          element={
            <PrivateRoute perfil="admin">
              <Projetos />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute perfil="admin">
              <Usuarios />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}


export default App;
