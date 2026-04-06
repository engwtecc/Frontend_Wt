import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Paper, Typography, Dialog } from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  //Divider
} from "@mui/material";
export default function AdminVerRelatorio() {
  const { id } = useParams();
  const [relatorio, setRelatorio] = useState<any>(null);
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const response = await api.get(`/admin/relatorio/${id}`);
        setRelatorio(response.data);
      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
      }
    }

    carregar();
  }, [id]);

  async function aprovarRelatorio() {
    try {
      await api.put(`/aprovar/${id}`)
      alert("Relatório aprovado com sucesso")
      carregarRelatorio()
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao aprovar")
    }
  }
  
  async function reprovarRelatorio() {
    const motivo = prompt("Informe o motivo da reprovação:")
  
    if (!motivo) return
  
    try {
      await api.put(`/reprovar/${id}`, {
        motivo: motivo
      })
  
      alert("Relatório reprovado")
      carregarRelatorio()
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao reprovar")
    }
  }
  
  function formatarHoras(valor: number) {
    const horas = Math.floor(valor);
    const minutos = Math.round((valor - horas) * 60);

    const h = String(horas).padStart(2, "0");
    const m = String(minutos).padStart(2, "0");

    return `${h}:${m}`;
  }

  if (!relatorio) return <div>Carregando...</div>;

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Relatório do Dia {relatorio.data}
        </Typography>
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          
          {relatorio.status === "enviado" && (
            <Button
              variant="contained"
              color="success"
              onClick={aprovarRelatorio}
            >
              Aprovar
            </Button>
          )}
        
          {(relatorio.status === "enviado" || relatorio.status === "aprovado") && (
            <Button
              variant="contained"
              color="error"
              onClick={reprovarRelatorio}
            >
              Reprovar
            </Button>
          )}
        
        </Box>
        <Typography>Status: {relatorio.status}</Typography>
        {relatorio.feriado && (
          <Typography
            sx={{
              mt: 1,
              color: "orange",
              fontWeight: "bold",
              backgroundColor: "#fff3cd",
              padding: "6px 10px",
              borderRadius: "6px",
              display: "inline-block"
            }}
          >
            ⚠ DIA MARCADO COMO FERIADO
          </Typography>
        )}

        {relatorio.folga && (
          <Typography
            sx={{
              mt: 1,
              color: "red",
              fontWeight: "bold",
              backgroundColor: "#fdecea",
              padding: "6px 10px",
              borderRadius: "6px",
              display: "inline-block"
            }}
          >
            ⛔ DIA MARCADO COMO FOLGA
          </Typography>
        )}
        {relatorio.motivo_reprovacao && (
          <Typography color="error">
            Motivo: {relatorio.motivo_reprovacao}
          </Typography>
        )}

        <Typography sx={{ mt: 2 }}>
          <strong>Descrição Geral:</strong>
        </Typography>

        <Typography>{relatorio.descricao_geral || "-"}</Typography>
      </Paper>

      {/* BLOCO DE ATIVIDADES */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Atividades</Typography>

        <TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Início</strong></TableCell>
        <TableCell><strong>Fim</strong></TableCell>
        <TableCell><strong>Projeto</strong></TableCell>
        <TableCell><strong>Tipo</strong></TableCell>
        <TableCell><strong>Descrição</strong></TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {relatorio.blocos.map((b: any) => (
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
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      </Paper>

      {/* RESUMO */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6">Resumo de Horas</Typography>

        <p>Horas Corridas: {formatarHoras(relatorio.resumo.horas_corridas)}</p>
        <p>Horas Deslocamento: {formatarHoras(relatorio.resumo.horas_deslocamento || 0)}</p>
        <p>Horas 50%: {formatarHoras(relatorio.resumo.horas_50)}</p>
        <p>Horas 100%: {formatarHoras(relatorio.resumo.horas_100)}</p>
        <p>Adicional Noturno (35%): {formatarHoras(relatorio.resumo.adicional_noturno)}</p>
        <p>Banco +: {formatarHoras(relatorio.resumo.banco_positivo)}</p>
        <p>Banco -: {formatarHoras(relatorio.resumo.banco_negativo)}</p>

        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          Total: {formatarHoras(relatorio.resumo.total)}
        </p>
      </Paper>

      {/* FOTOS */}
      {relatorio.fotos.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Fotos</Typography>

          <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
            {relatorio.fotos.map((foto: string, index: number) => (
              <img
                key={index}
                src={foto}
                alt="evidencia"
                onClick={() =>
                  setImagemAberta(foto)
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
            ))}
          </div>
        </Paper>
      )}

      {/* MODAL IMAGEM */}
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
    </>
  );

}
