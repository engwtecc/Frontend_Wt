import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";

export default function Projetos() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  
  async function carregar() {
  
    const response = await api.get("/projetos", {
      params: {
        inativos: mostrarInativos
      }
    });
  
    setProjetos(response.data);
  }

  useEffect(() => {
    carregar();
  }, [mostrarInativos]);

  async function salvar() {
    if (!nome || !cliente) {
      alert("Preencha todos os campos.");
      return;
    }

    await api.post("/projetos", {
      nome,
      cliente,
    });

    setNome("");
    setCliente("");
    carregar();
  }

  async function editarProjeto() {
  
    if (!editandoId) return;
  
    await api.put(`/projetos/${editandoId}`, {
      nome,
      cliente,
    });
  
    setNome("");
    setCliente("");
    setEditandoId(null);
  
    carregar();
  }
  async function inativar(id: string) {
  
    if (!confirm("Deseja inativar este projeto?")) return;
  
    await api.put(`/projetos/${id}/inativar`);
  
    carregar();
  }

  async function reativar(id: string) {
  
    if (!confirm("Deseja reativar este projeto?")) return;
  
    await api.put(`/projetos/${id}/reativar`);
  
    carregar();
  }
  
  return (
    <>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Nome do Projeto"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Cliente"
          fullWidth
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          sx={{ mb: 2 }}
        />

        <div style={{ display: "flex", gap: 10 }}>
        
          <Button
            variant="contained"
            onClick={editandoId ? editarProjeto : salvar}
          >
            {editandoId ? "Atualizar Projeto" : "Salvar Projeto"}
          </Button>
        
          <Button
            variant="outlined"
            color={mostrarInativos ? "warning" : "primary"}
            onClick={() => setMostrarInativos(!mostrarInativos)}
          >
            {mostrarInativos ? "Ver Projetos Ativos" : "Projetos Inativos"}
          </Button>
        
        </div>
      </Paper>
      <Paper sx={{ p: 3 }}>
  <Typography variant="h6" sx={{ mb: 2 }}>
    Projetos Cadastrados
  </Typography>

  <TableContainer>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
          <TableCell><strong>Projeto</strong></TableCell>
          <TableCell><strong>Cliente</strong></TableCell>
          <TableCell align="right"><strong>Ações</strong></TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {projetos.map((p) => (
          <TableRow key={p.id} hover>
            <TableCell>{p.nome}</TableCell>
            <TableCell>{p.cliente}</TableCell>
            <TableCell align="right">
              <Button
                size="small"
                color="primary"
                onClick={() => {
                  setNome(p.nome);
                  setCliente(p.cliente);
                  setEditandoId(p.id);
                }}
              >
                Editar
              </Button>
            
              {mostrarInativos ? (
              
                <Button
                  size="small"
                  color="success"
                  onClick={() => reativar(p.id)}
                >
                  Reativar
                </Button>
              
              ) : (
              
                <Button
                  size="small"
                  color="warning"
                  onClick={() => inativar(p.id)}
                >
                  Inativar
                </Button>
              
              )}
            
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>
      
    </>
  );
}
