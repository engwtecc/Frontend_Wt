import { useEffect, useState } from "react";
import BlocoForm from "../components/BlocoForm";
import { api } from "../services/api";
import {
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FormControlLabel, Checkbox } from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  //Divider
} from "@mui/material";
export default function Lancamento() {

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [feriado, setFeriado] = useState(false);
  const [data, setData] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );

  const [blocos, setBlocos] = useState<any[]>([]);
  const [descricaoGeral, setDescricaoGeral] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [resumo, setResumo] = useState<any>(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  //const [fotos, setFotos] = useState<string[]>([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [lancamentoId, setLancamentoId] = useState<string | null>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);
  const [folga, setFolga] = useState(false);
  const [modalEditar, setModalEditar] = useState(false)
  const [blocoEditando, setBlocoEditando] = useState<any>(null)

  // 🔒 Proteção de rota
  useEffect(() => {
    if (!usuario) {
      navigate("/login");
    }
  }, [usuario, navigate]);

  async function carregar() {
    if (!usuario) return;

    try {
      const response = await api.get(
        `/lancamento/${usuario.id}/${data}`
      );

      setBlocos(response.data.blocos || []);
      setDescricaoGeral(response.data.descricao_geral || "");
      setStatus(response.data.status || "rascunho");
      setResumo(response.data.resumo || null);
      setFeriado(response.data.feriado || false);
      setFolga(response.data.folga || false);
      setMotivoReprovacao(response.data.motivo_reprovacao || "");
      setFotos(response.data.fotos || []);
      setLancamentoId(response.data.id || null);



    } catch (error) {
      console.error("Erro ao carregar lançamento:", error);
    }
  }

  useEffect(() => {
    carregar();
  }, [data, usuario]);

  async function adicionarBloco(bloco: any) {
  try {
    await api.post("/lancamento", {
      colaborador_id: usuario?.id,
      data,
    feriado,
      blocos: [bloco],
    });

    carregar();
  } catch (error: any) {
    alert(
      error.response?.data?.detail ||
      "Erro ao salvar bloco"
    );
  }
}


  async function excluirBloco(id: string) {
    try {
      await api.delete(`/bloco/${id}`);
      carregar();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao excluir bloco");
    }
  }

  async function salvarDescricao() {
    try {
      await api.put(
        `/descricao/${usuario?.id}/${data}`,
        null,
        { params: { descricao: descricaoGeral } }
      );
      alert("Descrição salva");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao salvar descrição");
    }
  }

async function enviarFoto() {
  if (!arquivoSelecionado || !usuario || !lancamentoId) {
    alert("Salve o lançamento antes de enviar fotos.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", arquivoSelecionado);

    await api.post(
      `/upload-foto/${lancamentoId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setArquivoSelecionado(null);
    await carregar();

  } catch (error: any) {
    alert(error.response?.data?.detail || "Erro ao enviar foto");
  }
}

async function excluirFoto(id: string) {
  try {
    await api.delete(`/foto/${id}`);
    carregar();
  } catch (error: any) {
    alert(error.response?.data?.detail || "Erro ao excluir foto");
  }
}
  
async function cancelarEnvio() {
  try {
    await api.put(`/cancelar/${usuario?.id}/${data}`);

    alert("Envio cancelado. Você pode editar novamente.");

    carregar();

  } catch (error: any) {
    alert(error.response?.data?.detail || "Erro ao cancelar envio");
  }
}
  async function finalizarDia() {
    try {
      await api.put(`/finalizar/${usuario?.id}/${data}`);
      alert("Dia enviado para aprovação");
      carregar();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao finalizar");
    }
  }

  async function salvarEdicao(){

  await api.put(`/bloco/${blocoEditando.id}`, blocoEditando)

  setModalEditar(false)

  carregar()   // recarrega lista
}
  function abrirEdicao(bloco:any){
  setBlocoEditando(bloco)
  setModalEditar(true)
}


  
  function formatarHoras(valor: number) {
  if (!valor) return "00:00"

  const horas = Math.floor(valor)
  const minutos = Math.round((valor - horas) * 60)

  return `${horas}:${minutos.toString().padStart(2, "0")}`
}


  return (
    <>
      
      {/* CABEÇALHO */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography>
          Usuário: <strong>{usuario?.nome}</strong>
        </Typography>

        <TextField
          type="date"
          label="Data do Relatório"
          value={data}
          onChange={(e) => setData(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
        />
        <FormControlLabel
        control={
          <Checkbox
        checked={feriado}
        disabled={!(status === "rascunho" || status === "reprovado")}
        onChange={async (e) => {
        const novoValor = e.target.checked;

        setFeriado(novoValor);

        if (novoValor) {
          setFolga(false); // 🔒 desmarca folga visualmente
        }

          try {
            await api.put(
        `/feriado/${usuario?.id}/${data}`,
        { feriado: novoValor }
        
      );

      await carregar(); // 🔥 recalcula tudo
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao atualizar feriado");
    }
  }}
/>

     
  }
  label="Dia é Feriado"
/>
<FormControlLabel
  control={
    <Checkbox
      checked={folga}
      disabled={!(status === "rascunho" || status === "reprovado")}
      onChange={async (e) => {
        const novoValor = e.target.checked;

        setFolga(novoValor);

        if (novoValor) {
          setFeriado(false); // 🔒 desmarca feriado visualmente
        }

        await api.put(
          `/folga/${usuario?.id}/${data}`,
          { folga: novoValor }
        );

        await carregar();
      }}
    />
  }
  label="Dia de Folga"
/>
        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2, ml: 2 }}
          onClick={logout}
        >
          Logout
        </Button>
      </Paper>
<Button
  variant="outlined"
  sx={{ ml: 2 }}
  onClick={() => navigate("/meus-relatorios")}
>
  Meus Relatórios
</Button>

      {/* FORM BLOCO */}
      <BlocoForm
  onAdd={adicionarBloco}
  disabled={!(status === "rascunho" || status === "reprovado")|| folga}
  data={data}
/>




      {/* APONTAMENTOS */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Apontamentos</Typography>

        <TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Início</strong></TableCell>
        <TableCell><strong>Fim</strong></TableCell>
        <TableCell><strong>Projeto</strong></TableCell>
        <TableCell><strong>Tipo</strong></TableCell>
        <TableCell><strong>Descrição</strong></TableCell>
        {(status === "rascunho" || status === "reprovado") && (
          <TableCell><strong>Ações</strong></TableCell>
        )}
      </TableRow>
    </TableHead>

    <TableBody>
      {blocos.map((b) => (
        <TableRow key={b.id} hover>
          <TableCell>
            {new Date(b.hora_inicio).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </TableCell>

          <TableCell>
            {new Date(b.hora_fim).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </TableCell>

          <TableCell>{b.projeto_nome}</TableCell>
          <TableCell>{b.tipo_nome}</TableCell>
          <TableCell>{b.descricao}</TableCell>

          {(status === "rascunho" || status === "reprovado") && (
            <TableCell>
            
            <Button
              size="small"
              onClick={() => abrirEdicao(b)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            
            <Button
              size="small"
              color="error"
              onClick={() => excluirBloco(b.id)}
            >
              Excluir
            </Button>
            
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      </Paper>

    
           {resumo && (
  <Paper sx={{ p: 2, mt: 2 }}>
    <Typography variant="h6">Resumo de Horas</Typography>

    <Typography>
      Horas Corridas: {formatarHoras(resumo.horas_corridas)}
    </Typography>
    <Typography>
      Horas Deslocamento: {formatarHoras(resumo.horas_deslocamento)}
    </Typography>
    <Typography>
      Horas 50%: {formatarHoras(resumo.horas_50)}
    </Typography>

    <Typography>
      Horas 100%: {formatarHoras(resumo.horas_100)}
    </Typography>

    <Typography>
      Adicional Noturno (35%): {formatarHoras(resumo.adicional_noturno)}
    </Typography>

    <Typography>
      Banco +: {formatarHoras(resumo.banco_positivo)}
    </Typography>

    <Typography>
      Banco -: {formatarHoras(resumo.banco_negativo)}
    </Typography>

    <Typography fontWeight="bold">
      Total: {formatarHoras(resumo.total)}
    </Typography>
  </Paper>
)}

        <Paper sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6">Fotos de Evidência</Typography>

  {(status === "rascunho" || status === "reprovado") && (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setArquivoSelecionado(e.target.files?.[0] || null)
        }
      />

      <Button
        variant="contained"
        sx={{ mt: 2, ml: 2 }}
        onClick={enviarFoto}
        disabled={!arquivoSelecionado}
      >
        Enviar Foto
      </Button>
    </>
  )}

  {/* LISTAR FOTOS */}
  <div
  style={{
    marginTop: "20px",
    display: "flex",
    gap: "15px",
    flexWrap: "wrap"
  }}
>
  {fotos.map((foto) => (
    <div
      key={foto.id}
      style={{
        position: "relative",
        width: "150px",
        height: "150px"
      }}
    >
      <img
  src={foto.url}
  alt="evidencia"
  onClick={() =>
    setImagemAberta(foto.url)
  }
  style={{
    width: "150px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ddd",
    cursor: "pointer",
    transition: "0.2s",
  }}
/>

      {(status === "rascunho" || status === "reprovado") && (
        <Button
          size="small"
          color="error"
          variant="contained"
          sx={{
            position: "absolute",
            bottom: 5,
            right: 5,
            minWidth: "auto",
            padding: "4px 8px",
            fontSize: "0.7rem"
          }}
          onClick={() => excluirFoto(foto.id)}
        >
          Excluir
        </Button>
      )}
    </div>
  ))}
</div>

</Paper>
      {/* DESCRIÇÃO GERAL */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Descrição Geral</Typography>
    
        <TextField
          fullWidth
          multiline
          rows={4}
          disabled={!(status === "rascunho" || status === "reprovado")}
          value={descricaoGeral}
          onChange={(e) => setDescricaoGeral(e.target.value)}
        />

        {(status === "rascunho" || status === "reprovado") && (
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={salvarDescricao}
          >
            Salvar Descrição
          </Button>
        )}
      </Paper>

     {(status === "rascunho" || status === "reprovado") && (
        <Button
          variant="contained"
          color="success"
          onClick={finalizarDia}
        >
          Enviar para Aprovação

        </Button>
      )}
    

      {/* STATUS APROVADO */}
{status === "aprovado" && (
  <Paper sx={{ p: 2, mt: 2, backgroundColor: "#e8f5e9" }}>
    <Typography color="success.main" fontWeight="bold">
      ✅ Relatório Aprovado
    </Typography>
  </Paper>
)}
  {/* STATUS ENVIADO */}
{status === "enviado" && (
  <Paper sx={{ p: 2, mt: 2, backgroundColor: "#fff8e1" }}>
    <Typography color="warning.main" fontWeight="bold">
      🟡 Relatório Enviado para Aprovação
    </Typography>
  </Paper>
)}
  {status === "enviado" && (
  <Button
    variant="contained"
    color="warning"
    sx={{ ml: 2 }}
    onClick={cancelarEnvio}
  >
    Cancelar Envio
  </Button>
)}

{/* MOTIVO DE REPROVAÇÃO (mantém até virar aprovado) */}
{motivoReprovacao && status !== "aprovado" && (
  <Paper sx={{ p: 2, mt: 2, backgroundColor: "#fff3f3" }}>
    <Typography color="error" fontWeight="bold">
      ❌ Motivo da Reprovação:
    </Typography>
    <Typography>
      {motivoReprovacao}
    </Typography>
  </Paper>
  
)}

<Dialog
  open={!!imagemAberta}
  onClose={() => setImagemAberta(null)}
  maxWidth="lg"
>
  {imagemAberta && (
    <img
      src={imagemAberta}
      alt="imagem ampliada"
      style={{
        maxWidth: "90vw",
        maxHeight: "90vh",
      }}
    />
  )}
</Dialog>      
{/* MODAL EDITAR BLOCO */}
<Dialog open={modalEditar} onClose={()=>setModalEditar(false)}>

<DialogTitle>Editar Atividade</DialogTitle>

<DialogContent>

<TextField
label="Início"
type="time"
value={
  blocoEditando?.hora_inicio
  ? new Date(blocoEditando.hora_inicio).toISOString().slice(11,16)
  : ""
}
onChange={(e)=>setBlocoEditando({
  ...blocoEditando,
  hora_inicio:e.target.value
})}
/>

<TextField
label="Fim"
type="time"
value={blocoEditando?.hora_fim?.slice(11,16)}
onChange={(e)=>setBlocoEditando({
  ...blocoEditando,
  hora_fim:e.target.value
})}
/>

<TextField
label="Descrição"
value={blocoEditando?.descricao}
onChange={(e)=>setBlocoEditando({
  ...blocoEditando,
  descricao:e.target.value
})}
/>

</DialogContent>

<DialogActions>

<Button onClick={()=>setModalEditar(false)}>
Cancelar
</Button>

<Button variant="contained" onClick={salvarEdicao}>
Salvar
</Button>

</DialogActions>

</Dialog>
</>
);
}
