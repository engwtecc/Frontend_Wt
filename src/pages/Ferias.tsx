import { useEffect, useState } from "react";

const API = "https://rdo.wtecc.com.br";

interface Usuario {
    id: string;
    nome: string;
}

interface Ferias {
    id: string;
    colaborador_nome: string;
    data_inicio: string;
    data_fim: string;
    observacao?: string;
}

export default function FeriasPage() {

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [ferias, setFerias] = useState<Ferias[]>([]);

    const [colaboradorId, setColaboradorId] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [observacao, setObservacao] = useState("");

    // =========================================
    // CARREGAR USUÁRIOS
    // =========================================

    async function carregarUsuarios() {

        const response = await fetch(
            `${API}/usuarios?perfil=funcionario`
        );

        const data = await response.json();

        setUsuarios(data);
    }

    // =========================================
    // CARREGAR FÉRIAS
    // =========================================

    async function carregarFerias() {

        const response = await fetch(
            `${API}/admin/ferias`
        );

        const data = await response.json();

        setFerias(data);
    }


    // =========================================
    // SALVAR FÉRIAS
    // =========================================

    async function salvarFerias() {

        if (!colaboradorId) {
            alert("Selecione um colaborador");
            return;
        }

        if (!dataInicio || !dataFim) {
            alert("Informe as datas");
            return;
        }

        if (dataFim < dataInicio) {
            alert("Data fim inválida");
            return;
        }

        const response = await fetch(
            `${API}/ferias`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    colaborador_id: colaboradorId,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    observacao: observacao
                })
            }
        );

        if (!response.ok) {

            const erro = await response.json();

            alert(
                erro.detail || "Erro ao salvar férias"
            );

            return;
        }

        alert("Férias cadastradas");

        setColaboradorId("");
        setDataInicio("");
        setDataFim("");
        setObservacao("");

        carregarFerias();
    }

    // =========================================
    // EXCLUIR
    // =========================================

    async function excluirFerias(id: string) {

        if (!confirm("Excluir férias?")) {
            return;
        }

        await fetch(
            `${API}/ferias/${id}`,
            {
                method: "DELETE"
            }
        );

        carregarFerias();
    }

    // =========================================
    // Parse Data
    // =========================================

    function parseDateLocal(data: string) {
        const apenasData = data.slice(0, 10);
        const [ano, mes, dia] = apenasData.split("-").map(Number);
        return new Date(ano, mes - 1, dia);
    }
    // =========================================
    // Hoje sem Horas
    // =========================================
    function hojeSemHora() {
        const hoje = new Date();
    
        return new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate()
        );
    }
    // =========================================
    // STATUS
    // =========================================

    function obterStatus(
        inicio: string,
        fim: string
    ) {

        const hoje = hojeSemHora();
        
        const di = parseDateLocal(inicio);
        const df = parseDateLocal(fim);


        if (hoje >= di && hoje <= df) {
            return {
                texto: "ATIVA",
                cor: "#16a34a"
            };
        }

        if (hoje < di) {
            return {
                texto: "FUTURA",
                cor: "#2563eb"
            };
        }

        return {
            texto: "ENCERRADA",
            cor: "#dc2626"
        };
    }

    // =========================================
    // FORMATAR DATA
    // =========================================
    function formatarData(data: string) {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }
    //function formatarData(data: string) {

    //    return new Date(data)
   //         .toLocaleDateString("pt-BR");
   // }

    // =========================================
    // INIT
    // =========================================

    useEffect(() => {

        carregarUsuarios();
        carregarFerias();

    }, []);

    // =========================================
    // KPIs
    // =========================================

    const emFeriasHoje = ferias.filter(f => {

        const hoje = hojeSemHora();

        return (
            hoje >= parseDateLocal(f.data_inicio) &&
            hoje <= parseDateLocal(f.data_fim)
        );

    }).length;

    const futuras = ferias.filter(f => {

        return parseDateLocal(f.data_inicio) > hojeSemHora();

    }).length;

    return (

        <div
            style={{
                padding: 30,
                background: "#f1f5f9",
                minHeight: "100vh"
            }}
        >

            {/* ========================================= */}
            {/* TÍTULO */}
            {/* ========================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 30
                }}
            >

                <h1>
                    Férias de Colaboradores
                </h1>

            </div>

            {/* ========================================= */}
            {/* KPIs */}
            {/* ========================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 20,
                    marginBottom: 30
                }}
            >

                <CardKPI
                    titulo="Em férias hoje"
                    valor={emFeriasHoje}
                />

                <CardKPI
                    titulo="Férias futuras"
                    valor={futuras}
                />

                <CardKPI
                    titulo="Total de registros"
                    valor={ferias.length}
                />

            </div>

            {/* ========================================= */}
            {/* FORM */}
            {/* ========================================= */}

            <div
                style={{
                    background: "white",
                    padding: 25,
                    borderRadius: 14,
                    marginBottom: 30
                }}
            >

                <h2>
                    Cadastro de Férias
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr",
                        gap: 15,
                        marginBottom: 15
                    }}
                >

                    <select
                        value={colaboradorId}
                        onChange={(e) =>
                            setColaboradorId(e.target.value)
                        }
                    >

                        <option value="">
                            Selecione colaborador
                        </option>

                        {usuarios.map(u => (

                            <option
                                key={u.id}
                                value={u.id}
                            >
                                {u.nome}
                            </option>

                        ))}

                    </select>

                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) =>
                            setDataInicio(e.target.value)
                        }
                    />

                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) =>
                            setDataFim(e.target.value)
                        }
                    />

                </div>

                <textarea
                    placeholder="Observação"
                    value={observacao}
                    onChange={(e) =>
                        setObservacao(e.target.value)
                    }
                    style={{
                        width: "100%",
                        minHeight: 90
                    }}
                />

                <br />
                <br />

                <button
                    onClick={salvarFerias}
                    style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "12px 22px",
                        borderRadius: 10,
                        cursor: "pointer"
                    }}
                >
                    Salvar Férias
                </button>

            </div>

            {/* ========================================= */}
            {/* TABELA */}
            {/* ========================================= */}

            <div
                style={{
                    background: "white",
                    borderRadius: 14,
                    overflow: "hidden"
                }}
            >

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <thead
                        style={{
                            background: "#1e293b",
                            color: "white"
                        }}
                    >

                        <tr>

                            <th style={th}>
                                Colaborador
                            </th>

                            <th style={th}>
                                Início
                            </th>

                            <th style={th}>
                                Fim
                            </th>

                            <th style={th}>
                                Observação
                            </th>

                            <th style={th}>
                                Status
                            </th>

                            <th style={th}>
                                Ações
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {ferias.map(f => {

                            const status = obterStatus(
                                f.data_inicio,
                                f.data_fim
                            );

                            return (

                                <tr
                                    key={f.id}
                                >

                                    <td style={td}>
                                        {f.colaborador_nome}
                                    </td>

                                    <td style={td}>
                                        {formatarData(f.data_inicio)}
                                    </td>

                                    <td style={td}>
                                        {formatarData(f.data_fim)}
                                    </td>

                                    <td style={td}>
                                        {f.observacao}
                                    </td>

                                    <td style={td}>

                                        <span
                                            style={{
                                                background: status.cor,
                                                color: "white",
                                                padding: "6px 12px",
                                                borderRadius: 20,
                                                fontSize: 12,
                                                fontWeight: "bold"
                                            }}
                                        >

                                            {status.texto}

                                        </span>

                                    </td>

                                    <td style={td}>

                                        <button
                                            onClick={() =>
                                                excluirFerias(f.id)
                                            }
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                cursor: "pointer",
                                                fontSize: 18
                                            }}
                                        >
                                            🗑
                                        </button>

                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

            </div>

        </div>

    );
}

// =========================================
// CARD KPI
// =========================================

function CardKPI({
    titulo,
    valor
}: {
    titulo: string;
    valor: number;
}) {

    return (

        <div
            style={{
                background: "white",
                padding: 25,
                borderRadius: 14
            }}
        >

            <div
                style={{
                    color: "#64748b",
                    marginBottom: 10
                }}
            >
                {titulo}
            </div>

            <div
                style={{
                    fontSize: 32,
                    fontWeight: "bold"
                }}
            >
                {valor}
            </div>

        </div>

    );
}

const th = {
    padding: 14,
    textAlign: "left" as const
};

const td = {
    padding: 14,
    borderBottom: "1px solid #e2e8f0"
};
