import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 IMPORTANTE

  async function entrar() {
    try {
      const response = await api.post("/login", {
        email,
        senha,
      });

      login(response.data); // 👈 AGORA ATUALIZA O CONTEXTO

      if (response.data.perfil === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao logar");
    }
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 400, margin: "100px auto" }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>

      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Senha"
        type="password"
        fullWidth
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" fullWidth onClick={entrar}>
        Entrar
      </Button>
    </Paper>
  );
}
