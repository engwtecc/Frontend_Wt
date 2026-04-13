import { useEffect, useState } from "react"
import { api } from "../services/api"
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button
} from "@mui/material"

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer
} from "@mui/material"

import {
  LocalizationProvider,
  DatePicker
} from "@mui/x-date-pickers"

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

export default function BancoExtrato() {

  const [dados, setDados] = useState<any[]>([])
  const [funcionarios, setFuncionarios] = useState<any[]>([])

  const [colaborador, setColaborador] = useState("")
  const [dataInicio, setDataInicio] = useState<any>(null)
  const [dataFim, setDataFim] = useState<any>(null)

  useEffect(() => {
    carregarFuncionarios()
    carregar()
  }, [])

  async function carregarFuncionarios() {
    const res = await api.get("/usuarios")
    setFuncionarios(res.data)
  }

  async function carregar() {
    const res = await api.get("/admin/banco-extrato", {
      params: {
        colaborador_id: colaborador || undefined,
        data_inicio: dataInicio?.format("YYYY-MM-DD"),
        data_fim: dataFim?.format("YYYY-MM-DD"),
      }
    })

    setDados(res.data)
  }

  function formatarHoras(valor: number) {
    const negativo = valor < 0
    const totalMin = Math.round(Math.abs(valor) * 60)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60

    return `${negativo ? "-" : ""}${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`
  }

  return (
    <>
      {/* FILTROS */}
      <Paper sx={{ p: 3, mb: 3 }}>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Data Início"
            value={dataInicio}
            onChange={setDataInicio}
            slotProps={{ textField: { sx: { mr: 2 } } }}
          />

          <DatePicker
            label="Data Fim"
            value={dataFim}
            onChange={setDataFim}
            slotProps={{ textField: { sx: { mr: 2 } } }}
          />
        </LocalizationProvider>

        <TextField
          select
          label="Funcionário"
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

        <Button variant="contained" onClick={carregar}>
          Filtrar
        </Button>
      </Paper>

      {/* TABELA */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Extrato de Banco de Horas
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Banco +</strong></TableCell>
                <TableCell><strong>Banco -</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dados.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{d.data}</TableCell>

                  <TableCell sx={{ color: "green", fontWeight: "bold" }}>
                    {formatarHoras(d.banco_positivo)}
                  </TableCell>

                  <TableCell sx={{ color: "red", fontWeight: "bold" }}>
                    {formatarHoras(d.banco_negativo)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>
    </>
  )
}
