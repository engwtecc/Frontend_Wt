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

  async function carregar() {
    const response = await api.get("/projetos");
    setProjetos(response.data);
  }

  useEffect(() => {
    carregar();
  }, []);

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

  async function excluir(id: string) {
    if (!confirm("Deseja excluir este projeto?")) return;

    await api.delete(`/projetos/${id}`);
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

        <Button variant="contained" onClick={salvar}>
          Salvar Projeto
        </Button>
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
                color="error"
                onClick={() => excluir(p.id)}
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
      
    </>
  );
}
