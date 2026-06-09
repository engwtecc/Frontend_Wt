import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Paper,
  Chip,
  MenuItem,
  TextField,
  Button
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useAuth } from "../context/AuthContext";

export default function MeusRelatorios() {

  const { usuario } = useAuth();

  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [dataInicio, setDataInicio] = useState<any>(null);
  const [dataFim, setDataFim] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [bancoHoras, setBancoHoras] = useState({
    credito: 0,
    debito: 0,
    banco_total: 0
  });

  async function carregar() {
    if (!usuario) return;

    const response = await api.get("/admin/relatorios", {
      params: {
        colaborador_id: usuario.id,
        data_inicio: dataInicio?.format("YYYY-MM-DD"),
        data_fim: dataFim?.format("YYYY-MM-DD"),
        status: status || undefined,
      },
    });

    setRelatorios(response.data);
  }

  useEffect(() => {
    carregar();
    carregarBanco();
  }, []);

async function carregarBanco() {
  if (!usuario) return;

  const response = await api.get("/admin/banco-total");

  const registro = response.data.find(
    (f: any) => f.id === usuario.id
  );

  setBancoHoras({
    credito: registro?.credito || 0,
    debito: registro?.debito || 0,
    banco_total: registro?.banco_total || 0
  });
}

function statusChip(status: string) {
  const estiloPadrao = {
    width: 100,
    justifyContent: "center",
    fontWeight: "bold",
  };

  switch (status) {
    case "rascunho":
      return <Chip label="Rascunho" sx={estiloPadrao} />;

    case "enviado":
      return <Chip label="Enviado" color="warning" sx={estiloPadrao} />;

    case "aprovado":
      return <Chip label="Aprovado" color="success" sx={estiloPadrao} />;

    case "reprovado":
      return <Chip label="Reprovado" color="error" sx={estiloPadrao} />;

    default:
      return <Chip label={status} sx={estiloPadrao} />;
  }
}

function formatarHoras(valor: number) {
  const negativo = valor < 0;

  const totalMinutos = Math.round(Math.abs(valor) * 60);

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${negativo ? "-" : "+"}${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
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

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ mr: 2, minWidth: 180 }}
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
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: 18,
            //fontWeight: "bold"
          }}
        >
          <div style={{ color: "green" }}>
            Créditos: +{formatarHoras(bancoHoras.credito).replace("+", "")}
          </div>
      
          <div style={{ color: "red" }}>
            Débitos: -{formatarHoras(bancoHoras.debito).replace("+", "")}
          </div>
      
          <div
            style={{
              borderTop: "2px solid #ddd",
              marginTop: 10,
              marginBottom: 10
            }}
          />
                
          <div
            style={{
              color:
                bancoHoras.banco_total >= 0
                  ? "green"
                  : "red",
              fontWeight: "bold",
              fontSize: 20
            }}
          >
            Saldo Atual: {formatarHoras(bancoHoras.banco_total)}
          </div>
        </div>
      </Paper>
      {/* TABELA */}
      <Paper sx={{ p: 3 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid black" }}>
              <th >Data</th>
              <th >Status</th>
              <th>Descrição</th>
            </tr>   
          </thead>

          <tbody>
            {relatorios.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{r.data}</td>
                <td>{statusChip(r.status)}</td>
                <td>{r.descricao_geral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </>
  );
}
