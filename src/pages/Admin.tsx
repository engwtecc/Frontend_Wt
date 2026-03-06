import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  MenuItem,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
//import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  //Divider
} from "@mui/material";

export default function Admin() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [dataInicio, setDataInicio] = useState<any>(null);
  const [dataFim, setDataFim] = useState<any>(null);
  const [colaborador, setColaborador] = useState("");
  const [status, setStatus] = useState("");
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState("");
  ///const navigate = useNavigate();
  const [bancoTotal, setBancoTotal] = useState<any[]>([]);
  const [horasAbater, setHorasAbater] = useState<{ [key: string]: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [abatimentos, setAbatimentos] = useState<any[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState("");
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  async function carregar() {
    const response = await api.get("/admin/relatorios", {
      params: {
        data_inicio: dataInicio?.format("YYYY-MM-DD"),
        data_fim: dataFim?.format("YYYY-MM-DD"),
        colaborador_id: colaborador || undefined,
        status: status || undefined,
      },
    });

    setRelatorios(response.data);
  }

  async function carregarBancoTotal() {
  const response = await api.get("/admin/banco-total");
  setBancoTotal(response.data);
  }

    async function carregarProjetos() {
    const response = await api.get("/projetos");
    setProjetos(response.data);
  }

  async function carregarFuncionarios() {
    const response = await api.get("/usuarios");

    setFuncionarios(response.data);
  }

  async function aprovar(id: string) {
    await api.put(`/aprovar/${id}`);
    carregar();
    carregarBancoTotal();
  }

  async function reprovar(id: string) {
  const motivo = prompt("Informe o motivo da reprovação:");

  if (!motivo) {
    alert("Motivo é obrigatório.");
    return;
  }

  await api.put(`/reprovar/${id}`, {
    motivo: motivo
  });

  carregar();
  carregarBancoTotal();
}
 async function abaterHoras(colaboradorId: string) {
  const valor = parseFloat(horasAbater[colaboradorId]);

  if (!valor || valor <= 0) {
    alert("Informe um valor válido.");
    return;
  }

  try {
    await api.post("/banco-horas/abatimento", {
      colaborador_id: colaboradorId,
      horas: horasAbater[colaboradorId],   // string HH:MM
      descricao: "Horas pagas"
    });

    setHorasAbater({ ...horasAbater, [colaboradorId]: "" });
    carregarBancoTotal();

  } catch (error: any) {
    alert(error.response?.data?.detail || "Erro ao abater horas");
  }
} 
async function abrirHistorico(colaboradorId: string) {
  setColaboradorSelecionado(colaboradorId);

  const response = await api.get(
    `/banco-horas/abatimentos/${colaboradorId}`
  );

  setAbatimentos(response.data);
  setModalOpen(true);
}
async function excluirAbatimento(id: string) {
  await api.delete(`/banco-horas/abatimento/${id}`);

  abrirHistorico(colaboradorSelecionado);
  carregarBancoTotal();
}
function confirmarExclusao(id: string) {
  setConfirmarId(id);
}

async function excluirRelatorio() {
  if (!confirmarId) return;

  try {
    await api.delete(`/admin/lancamento/${confirmarId}`);

    setConfirmarId(null);

    carregar(); // recarrega lista

  } catch (error) {
    alert("Erro ao excluir relatório");
  }
}
  
function formatarHoras(valor: number) {
  const totalMinutos = Math.round(valor * 60)
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  return `${horas.toString().padStart(2,"0")}:${minutos.toString().padStart(2,"0")}`
}




  useEffect(() => {
    carregar();
    carregarFuncionarios();
    carregarBancoTotal();
    carregarProjetos();
  }, []);

  function statusChip(status: string) {
    switch (status) {
      case "rascunho":
        return <Chip label="Rascunho" />;
      case "enviado":
        return <Chip label="Enviado" color="warning" />;
      case "aprovado":
        return <Chip label="Aprovado" color="success" />;
      case "reprovado":
        return <Chip label="Reprovado" color="error" />;
      default:
        return <Chip label={status} />;
    }
  }

  return (
    <>

      {/* FILTROS */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Data Início"
            value={dataInicio}
            onChange={(newValue) => setDataInicio(newValue)}
            slotProps={{
              textField: { sx: { mr: 2 } },
            }}
          />

          <DatePicker
            label="Data Fim"
            value={dataFim}
            onChange={(newValue) => setDataFim(newValue)}
            slotProps={{
              textField: { sx: { mr: 2 } },
            }}
          />
        </LocalizationProvider>

        {/* DROPDOWN FUNCIONÁRIOS */}
        <TextField
          select
          label="Colaborador"
          value={colaborador}
          onChange={(e) => setColaborador(e.target.value)}
          sx={{ mr: 2, minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {funcionarios.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ mr: 2, minWidth: 150 }}
        >

          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="rascunho">Rascunho</MenuItem>
          <MenuItem value="enviado">Enviado</MenuItem>
          <MenuItem value="aprovado">Aprovado</MenuItem>
          <MenuItem value="reprovado">Reprovado</MenuItem>
        </TextField>
        
                <Button variant="contained" onClick={carregar}>
          Filtrar
        </Button>

        {/* 🔥 SELEÇÃO DE PROJETO ENTRE OS BOTÕES */}
        <TextField
          select
          label="Projeto"
          value={projetoSelecionado}
          onChange={(e) => setProjetoSelecionado(e.target.value)}
          size="small"
          sx={{ ml: 2, minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {projetos.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.nome}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          color="secondary"
          sx={{ ml: 2 }}
          onClick={() => {
            const params = new URLSearchParams();

            if (colaborador) params.append("colaborador_id", colaborador);
            if (dataInicio) params.append("data_inicio", dataInicio.format("YYYY-MM-DD"));
            if (dataFim) params.append("data_fim", dataFim.format("YYYY-MM-DD"));
            if (projetoSelecionado) params.append("projeto_id", projetoSelecionado);

            window.open(
              `${import.meta.env.VITE_API_URL}/admin/pdf-massa?${params.toString()}`,
              "_blank"
            );
          }}
        >
          PDF em Massa
        </Button>
      </Paper>
      
      {/* TABELA */}
      <Paper sx={{ p: 3 }}>
        <TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Data</strong></TableCell>
        <TableCell><strong>Colaborador</strong></TableCell>
        <TableCell><strong>Status</strong></TableCell>
        <TableCell><strong>Descrição</strong></TableCell>
        <TableCell><strong>Ações</strong></TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {relatorios.map((r) => (
        <TableRow key={r.id} hover>
          <TableCell>{r.data}</TableCell>
          <TableCell>{r.colaborador_nome}</TableCell>
          <TableCell>{statusChip(r.status)}</TableCell>
          <TableCell>{r.descricao_geral}</TableCell>
          <TableCell>
            {(r.status === "enviado") && (
              <Button
                size="small"
                color="success"
                onClick={() => aprovar(r.id)}
                sx={{ mr: 1 }}
              >
                Aprovar
              </Button>
            )}

            {(r.status === "enviado" || r.status === "aprovado") && (
              <Button
                size="small"
                color="error"
                onClick={() => reprovar(r.id)}
                sx={{ mr: 1 }}
              >
                Reprovar
              </Button>
            )}

            <Button
              size="small"
              sx={{ mr: 1 }}
              component="a"
              href={`/admin/ver/${r.id}`}
              target="_blank"
            >
              Verificar
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => confirmarExclusao(r.id)}
            >
              Excluir
            </Button>
            <Button
              size="small"
              onClick={() =>
                window.open(`${import.meta.env.VITE_API_URL}/admin/pdf/${r.id}`, "_blank")
              }
            >
              PDF
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      </Paper>
      <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Banco de Horas Acumulado
          </Typography>

          <TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Funcionário</strong></TableCell>
        <TableCell><strong>Banco Total</strong></TableCell>
        <TableCell><strong>Abater Horas</strong></TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {bancoTotal.map((f) => (
        <TableRow key={f.id} hover>
          <TableCell>{f.nome}</TableCell>

          <TableCell
            sx={{
              color: f.banco_total >= 0 ? "green" : "red",
              fontWeight: "bold"
            }}
          >
            {formatarHoras(f.banco_total)}
          </TableCell>

          <TableCell>
            <TextField
              size="small"
              placeholder="HH:MM"
              value={horasAbater[f.id] || ""}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");

                if (value.length > 4) return;

                if (value.length >= 3) {
                  value =
                    value.slice(0, value.length - 2) +
                    ":" +
                    value.slice(-2);
                }

                setHorasAbater({
                  ...horasAbater,
                  [f.id]: value
                });
              }}
              sx={{ width: 90, mr: 1 }}
            />

            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => abaterHoras(f.id)}
              sx={{ mr: 1 }}
            >
              Abater
            </Button>

            <Button
              size="small"
              onClick={() => abrirHistorico(f.id)}
            >
              Histórico
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      </Paper>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>Histórico de Horas Abatidas</DialogTitle>

  <DialogContent>
    <TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Data</strong></TableCell>
        <TableCell><strong>Horas</strong></TableCell>
        <TableCell><strong>Ação</strong></TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {abatimentos.map((a) => (
        <TableRow key={a.id} hover>
          <TableCell>
            {new Date(a.created_at).toLocaleString()}
          </TableCell>

          <TableCell>
            {formatarHoras(a.horas)}
          </TableCell>

          <TableCell>
            <Button
              size="small"
              color="error"
              onClick={() => excluirAbatimento(a.id)}
            >
              Excluir
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setModalOpen(false)}>Fechar</Button>
  </DialogActions>
</Dialog>

      
      <Dialog
  open={!!confirmarId}
  onClose={() => setConfirmarId(null)}
>
  <div style={{ padding: 20 }}>

    <h3>Confirmar exclusão</h3>

    <p>Deseja realmente excluir este relatório?</p>

    <Button
      variant="contained"
      color="error"
      onClick={excluirRelatorio}
      sx={{ mr: 2 }}
    >
      Excluir
    </Button>

    <Button
      variant="outlined"
      onClick={() => setConfirmarId(null)}
    >
      Cancelar
    </Button>

  </div>
</Dialog>
    </>
  );
}






