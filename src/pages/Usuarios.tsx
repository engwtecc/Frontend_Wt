import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("funcionario");
  const [senha, setSenha] = useState("");

  // Modal States
  const [openEmail, setOpenEmail] = useState(false);
  const [openSenha, setOpenSenha] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  async function carregar() {
    const response = await api.get("/usuarios");
    setUsuarios(response.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    if (!nome || !email || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    await api.post("/usuarios", {
      nome,
      email,
      senha,
      perfil,
    });

    setNome("");
    setEmail("");
    setSenha("");
    setPerfil("funcionario");

    carregar();
  }

  async function excluirUsuario(id: string) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    await api.delete(`/usuarios/${id}`);
    carregar();
  }

  // ====== MODAL EMAIL ======
  function abrirModalEmail(usuario: any) {
    setUsuarioSelecionado(usuario);
    setNovoEmail(usuario.email);
    setOpenEmail(true);
  }

  async function salvarNovoEmail() {
    await api.put(`/usuarios/${usuarioSelecionado.id}/email`, {
      email: novoEmail,
    });

    setOpenEmail(false);
    carregar();
  }

  // ====== MODAL SENHA ======
  function abrirModalSenha(usuario: any) {
    setUsuarioSelecionado(usuario);
    setNovaSenha("");
    setOpenSenha(true);
  }

  async function salvarNovaSenha() {
    await api.put(`/usuarios/${usuarioSelecionado.id}/senha`, {
      senha: novaSenha,
    });

    setOpenSenha(false);
    alert("Senha alterada com sucesso");
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Cadastro de Usuários
      </Typography>

      {/* FORM CADASTRO */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Nome"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          sx={{ mb: 2 }}
        />

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

        <TextField
          select
          label="Perfil"
          fullWidth
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="funcionario">Funcionário</MenuItem>
          <MenuItem value="admin">Administrador</MenuItem>
        </TextField>

        <Button variant="contained" onClick={salvar}>
          Salvar Usuário
        </Button>
      </Paper>

      {/* LISTA */}
      <Paper sx={{ p: 3 }}>
  <Typography variant="h6" sx={{ mb: 2 }}>
    Usuários Cadastrados
  </Typography>

  <TableContainer>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
          <TableCell><strong>Nome</strong></TableCell>
          <TableCell><strong>Email</strong></TableCell>
          <TableCell><strong>Perfil</strong></TableCell>
          <TableCell align="right"><strong>Ações</strong></TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {usuarios.map((u) => (
          <TableRow key={u.id} hover>
            <TableCell>{u.nome}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell sx={{ textTransform: "capitalize" }}>
              {u.perfil}
            </TableCell>
            <TableCell align="right">
              <Button
                size="small"
                onClick={() => abrirModalEmail(u)}
                sx={{ mr: 1 }}
              >
                Editar Email
              </Button>

              <Button
                size="small"
                onClick={() => abrirModalSenha(u)}
                sx={{ mr: 1 }}
              >
                Trocar Senha
              </Button>

              <Button
                size="small"
                color="error"
                onClick={() => excluirUsuario(u.id)}
              >
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

      {/* MODAL EMAIL */}
      <Dialog open={openEmail} onClose={() => setOpenEmail(false)}>
        <DialogTitle>Alterar Email</DialogTitle>
        <DialogContent>
          <TextField
            label="Novo Email"
            fullWidth
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmail(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarNovoEmail}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL SENHA */}
      <Dialog open={openSenha} onClose={() => setOpenSenha(false)}>
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <TextField
            label="Nova Senha"
            type="password"
            fullWidth
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSenha(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarNovaSenha}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
