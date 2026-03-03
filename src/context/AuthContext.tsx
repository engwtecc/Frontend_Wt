import { createContext, useContext, useState, useEffect } from "react";

interface Usuario {
  id: string;
  nome: string;
  perfil: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (user: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("usuario");
    if (saved) {
      setUsuario(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  function login(user: Usuario) {
    localStorage.setItem("usuario", JSON.stringify(user));
    setUsuario(user);
  }

  function logout() {
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return context;
}
