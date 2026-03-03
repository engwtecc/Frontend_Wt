import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  
} from "@mui/material";
import { api } from "../services/api";

interface Props {
  onAdd: (bloco: any) => Promise<void>;
  disabled?: boolean;
  data: string;
}


export default function BlocoForm({
  onAdd,
  disabled,
  data,
}: Props) {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [projetoId, setProjetoId] = useState("");
  const [tipoId, setTipoId] = useState(1);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [descricao, setDescricao] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);


  useEffect(() => {
    api
      .get("/projetos")
      .then((res) => setProjetos(res.data))
      .catch((err) => console.error("Erro ao carregar projetos", err));
  }, []);

  async function adicionar() {
    if (!projetoId || !inicio || !fim || !tipoId) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      await onAdd({
        projeto_id: projetoId,
        tipo_id: tipoId,
        inicio: `${data}T${inicio}:00`,
        fim: `${data}T${fim}:00`,
        descricao,
      });

      setDescricao("");
      setInicio("");
      setFim("");
      setProjetoId("");
      setOpenSnackbar(true);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao salvar atividade");
    }
  }

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* PROJETO */}
        <TextField
          select
          label="Projeto"
          fullWidth
          value={projetoId}
          disabled={disabled}
          onChange={(e) => setProjetoId(e.target.value)}
          sx={{ mb: 2 }}
        >
          {projetos.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.nome} - {p.cliente}
            </MenuItem>
          ))}
        </TextField>

        {/* HORÁRIOS */}
        <TextField
          type="time"
          label="Início"
          fullWidth
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          type="time"
          label="Fim"
          fullWidth
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          value={fim}
          onChange={(e) => setFim(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* TIPO */}
        <TextField
          select
          label="Tipo Atividade"
          fullWidth
          value={tipoId}
          disabled={disabled}
          onChange={(e) => setTipoId(Number(e.target.value))}
          sx={{ mb: 2 }}
        >
          <MenuItem value={1}>Comissionamento</MenuItem>
          <MenuItem value={2}>Startup</MenuItem>
          <MenuItem value={3}>Desenvolvimento</MenuItem>
          <MenuItem value={4}>Deslocamento</MenuItem>
          <MenuItem value={5}>Refeição</MenuItem>
          <MenuItem value={6}>Acompanhamento</MenuItem>
          <MenuItem value={7}>Problema no Campo</MenuItem>
        </TextField>

        {/* DESCRIÇÃO */}
        <TextField
          label="Descrição"
          fullWidth
          disabled={disabled}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={adicionar}
          disabled={disabled}
          sx={{ mt: 2 }}
        >
          Adicionar Atividade
        </Button>

      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" variant="filled">
          Atividade adicionada com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
}
