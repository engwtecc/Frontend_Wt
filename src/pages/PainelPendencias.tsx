import { useEffect, useState } from "react";
import { api } from "../services/api";

import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

interface Pendencia {
  usuario: string;
  data: string;
  status: string;
}

export default function PainelPendencias() {

  const hoje = new Date();

  const primeiroDia = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1
  );

  const ultimoDia = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    0
  );

  const [dataInicio, setDataInicio] = useState(
    primeiroDia.toISOString().split("T")[0]
  );

  const [dataFim, setDataFim] = useState(
    ultimoDia.toISOString().split("T")[0]
  );

  const [dados, setDados] = useState<Pendencia[]>([]);

  async function carregar() {

    const response = await api.get("/pendencias", {
      params: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });

    setDados(response.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  // ============================
  // LISTA DE DIAS
  // ============================

  const dias = Array.from(
    new Set(dados.map((d) => d.data))
  );

  // ============================
  // LISTA DE USUÁRIOS
  // ============================

  const usuarios = Array.from(
    new Set(dados.map((d) => d.usuario))
  );

  // ============================
  // COR STATUS
  // ============================

  function corStatus(status: string) {

    switch (status) {

      case "aprovado":
        return "success";

      case "enviado":
        return "info";

      case "rascunho":
        return "warning";

      case "reprovado":
        return "error";

      case "ferias":
        return "secondary";

      default:
        return "default";
    }
  }

  function textoStatus(status: string) {

    switch (status) {

      case "aprovado":
        return "OK";

      case "enviado":
        return "ENV";

      case "rascunho":
        return "RAS";

      case "reprovado":
        return "REP";

      case "ferias":
        return "FER";

      default:
        return "PEN";
    }
  }

  return (
    <Box>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Painel de Pendências
      </Typography>

      {/* FILTROS */}

      <Paper sx={{ p: 2, mb: 3 }}>

        <Box
          display="flex"
          gap={2}
          alignItems="center"
          flexWrap="wrap"
        >

          <TextField
            label="Data Início"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <TextField
            label="Data Fim"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />

          <Button
            variant="contained"
            onClick={carregar}
          >
            Filtrar
          </Button>

        </Box>

      </Paper>

      {/* TABELA */}

      <Paper sx={{ p: 2, overflowX: "auto" }}>

        <Table size="small">

          <TableHead>

            <TableRow>

              <TableCell>
                <strong>Funcionário</strong>
              </TableCell>

              {dias.map((d) => (

                <TableCell
                  key={d}
                  align="center"
                >
                  <strong>
                    {new Date(d).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </strong>
                </TableCell>

              ))}

            </TableRow>

          </TableHead>

          <TableBody>

            {usuarios.map((usuario) => (

              <TableRow key={usuario}>

                <TableCell>
                  <strong>{usuario}</strong>
                </TableCell>

                {dias.map((dia) => {

                  const item = dados.find(
                    (x) =>
                      x.usuario === usuario &&
                      x.data === dia
                  );

                  return (
                    <TableCell
                      key={dia}
                      align="center"
                    >

                      <Chip
                        label={textoStatus(item?.status || "pendente")}
                        color={corStatus(item?.status || "pendente") as any}
                        size="small"
                      />

                    </TableCell>
                  );
                })}

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </Paper>

    </Box>
  );
}
