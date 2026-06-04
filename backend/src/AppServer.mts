import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import jwt from "jsonwebtoken";
import { performance } from 'perf_hooks';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const JWT_SECRET = "sua_chave_secreta_para_o_projeto_muito_importante_aerocode_dev";

app.get("/", (req, res) => {
    res.send("Servidor Express rodando.");
});

app.post("/login", async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { usuario },
            include: { funcionario: true },
        });

        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        if (user.password == password) {
            const token = jwt.sign(
                {
                    userId: user.id,
                    usuario: user.usuario,
                    funcionarioId: user.funcionarioId,
                },
                JWT_SECRET,
                { expiresIn: "8h" }
            );
            return res.json({
                token,
                user: { id: user.id, usuario: user.usuario, funcionario: user.funcionario },
                login: true,
            });
        } else {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

app.post("/aeronave", async (req, res) => {
    try {
        const { modelo, tipo, capacidade, autonomia } = req.body;

        if (!modelo || !tipo) {
            return res.status(400).json({ error: "Campos obrigatórios faltando." });
        }

        const aeronave = await prisma.aeronave.create({
            data: {
                modelo: modelo,
                tipo: tipo,
                capacidade: capacidade,
                autonomia: autonomia,
            },
        });

        return res.status(200).json(aeronave);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao salvar aeronave." });
    }
});

app.post("/aeronaveDelete", async (req, res) => {
    try {
        const { codigo } = req.body;

        const aeronave = await prisma.aeronave.delete({
            where: { codigo },
        });

        return res.status(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao deletar a aeronave" });
    }
});

app.put("/aeronaveEdit", async (req, res) => {
    try {
        const { codigo, modelo, tipo, capacidade, autonomia } = req.body;

        if (!codigo) {
            return res
                .status(400)
                .json({ error: "Código da aeronave é obrigatório." });
        }

        const aeronaveAtualizada = await prisma.aeronave.update({
            where: { codigo: Number(codigo) },
            data: {
                modelo,
                tipo,
                capacidade,
                autonomia,
            },
        });

        return res.status(200).json(aeronaveAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar aeronave:", error);
        return res.status(500).json({ error: "Erro ao atualizar aeronave." });
    }
});

app.get("/aeronavesList", async (req, res) => {
    const aeronaves = await prisma.aeronave.findMany();
    return res.json(aeronaves);
});

app.post("/peca", async (req, res) => {
    try {
        const { id, nome, tipo, fornecedor, status, aeronaveId } = req.body;

        if (!nome || !tipo || !aeronaveId) {
            return res.status(400).json({ error: "Campos obrigatórios faltando." });
        }

        const peca = await prisma.peca.create({
            data: {
                id,
                nome,
                tipo,
                fornecedor,
                status: status,
                aeronaveId,
            },
        });

        return res.status(201).json(peca);
    } catch (error) {
        console.error("Erro ao criar peça:", error);
        return res.status(500).json({ error: "Erro ao criar peça." });
    }
});

app.post("/pecaDelete", async (req, res) => {
    try {
        const { id } = req.body;

        const peça = await prisma.peca.delete({
            where: { id: id },
        });

        return res.status(200).json(peça);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao deletar a aeronave" });
    }
});

app.put("/pecaEdit", async (req, res) => {
    try {
        const { id, nome, fornecedor, status, aeronaveId } = req.body;

        const peçaAtualizada = await prisma.peca.update({
            where: { id: Number(id) },
            data: {
                nome,
                fornecedor,
                status,
                aeronaveId,
            },
        });

        return res.status(200).json(peçaAtualizada);
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
});

app.get("/pecasList", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    try {
        const [peças, totalPeças] = await prisma.$transaction([
            prisma.peca.findMany({
                skip: skip,
                take: pageSize,
                orderBy: { id: 'asc' },
            }),
            prisma.peca.count(),
        ]);

        return res.json({
            data: peças,
            pagination: {
                total: totalPeças,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalPeças / pageSize)
            }
        });
    } catch (error) {
        console.error("Erro ao listar peças com paginação:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

app.post("/funcionario", async (req, res) => {
    try {
        const { nome, cpf, cargo, login, senha, endereco, telefone } = req.body;

        if (!nome || !cpf || !cargo || !login || !senha || !endereco || !telefone) {
            return res.status(400).json({
                error:
                    "Todos os campos (incluindo Endereço e Telefone) são obrigatórios.",
            });
        }

        const [novoEndereco, novoTelefone, novoFuncionario] =
            await prisma.$transaction([
                prisma.endereco.create({
                    data: {
                        rua: endereco.rua,
                        numero: endereco.numero,
                        bairro: endereco.bairro,
                        cidade: endereco.cidade,
                    },
                }),

                prisma.telefone.create({
                    data: {
                        ddd: telefone.ddd,
                        numero: telefone.numero,
                    },
                }),

                prisma.funcionario.create({
                    data: { nome, cpf, cargo, login, senha },
                }),
            ]);

        const newUser = await prisma.user.create({
            data: {
                usuario: login,
                password: senha,
                funcionarioId: novoFuncionario.id,
            },
        });

        const funcionarioCompleto = await prisma.funcionario.update({
            where: { id: novoFuncionario.id },
            data: {
                endereco: { connect: { id: novoEndereco.id } },
                telefone: { connect: { id: novoTelefone.id } },
            },
            include: {
                endereco: true,
                telefone: true,
                user: true,
            },
        });

        return res.status(201).json(funcionarioCompleto);
    } catch (error) {
        console.error(error);

        if (error === 'P2002') {
            return res.status(400).json({ error: "CPF ou Login (Usuário) já cadastrado. Por favor, utilize outro." });
        }

        return res.status(500).json({ error: "Erro ao criar funcionário", detalhe: error });
    }
});

app.put("/funcionarioEdit", async (req, res) => {
    try {
        const { id, nome, cpf, cargo, login, senha } = req.body;

        if (!id) {
            return res.status(400).json({ error: "ID do funcionário é obrigatório." });
        }

        // 1. Prepara os dados do funcionário
        const dataFuncionario: any = {};
        if (nome) dataFuncionario.nome = nome;
        if (cpf) dataFuncionario.cpf = cpf;
        if (cargo) dataFuncionario.cargo = cargo;
        if (login) dataFuncionario.login = login;
        if (senha && senha.trim() !== "") dataFuncionario.senha = senha;

        // 2. Prepara os dados do usuário (Login)
        const dataUser: any = {};
        if (login) dataUser.usuario = login;
        if (senha && senha.trim() !== "") dataUser.password = senha;

        // 3. Atualiza o Funcionário base
        await prisma.funcionario.update({
            where: { id: Number(id) },
            data: dataFuncionario,
        });

        // 4. Atualiza o Usuário associado (se existir)
        const userExistente = await prisma.user.findFirst({
            where: { funcionarioId: Number(id) }
        });

        if (userExistente && Object.keys(dataUser).length > 0) {
            await prisma.user.update({
                where: { id: userExistente.id },
                data: dataUser,
            });
        }

        // 5. O SEGREDO ESTÁ AQUI: Buscar e retornar o funcionário com TODOS os dados (Endereço e Telefone).
        // Isso impede que o frontend quebre ao tentar redesenhar a tabela.
        const funcionarioCompleto = await prisma.funcionario.findUnique({
            where: { id: Number(id) },
            include: {
                endereco: true,
                telefone: true,
                user: true
            }
        });

        return res.status(200).json(funcionarioCompleto);
    } catch (error: any) {
        console.error("Erro na edição do funcionário:", error);
        if (error.code === "P2002") {
            return res.status(400).json({ error: "CPF ou Login (Usuário) já cadastrado em outro funcionário." });
        }
        return res.status(500).json({ error: "Erro ao atualizar funcionário", detalhe: error.message });
    }
});

app.get("/funcionario/:id", async (req, res) => {
    try {
        const funcionario = await prisma.funcionario.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                endereco: true,
                telefone: true,
            },
        });

        if (!funcionario) {
            return res.status(404).json({ error: "Funcionário não encontrado" });
        }

        return res.json(funcionario);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar funcionário" });
    }
});

app.delete("/funcionario/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const [enderecoResult, telefoneResult, funcionarioResult] =
            await prisma.$transaction([
                prisma.endereco.deleteMany({
                    where: { funcionarioId: id },
                }),

                prisma.telefone.deleteMany({
                    where: { funcionarioId: id },
                }),

                prisma.funcionario.delete({
                    where: { id },
                }),
            ]);

        return res.status(200).json({
            message: "Funcionário e dados relacionados excluídos com sucesso.",
            funcionario: funcionarioResult,
            enderecosDeletados: enderecoResult.count,
            telefonesDeletados: telefoneResult.count,
        });
    } catch (error) {
        return res.status(404).json({ error: "Funcionário não encontrado." });
    }
});

app.get("/funcionariosList", async (req, res) => {
    const funcionarios = await prisma.funcionario.findMany();
    return res.json(funcionarios);
});

app.post("/teste", async (req, res) => {
    try {
        const { aeronaveId, tipo, resultado, data } = req.body;
        const aeronaveIdNum = Number(aeronaveId);

        if (!aeronaveIdNum || !tipo || !resultado) {
            return res.status(400).json({ error: "Campos obrigatórios faltando." });
        }

        const testeExistente = await prisma.teste.findFirst({
            where: {
                aeronaveId: aeronaveIdNum,
                tipo: tipo,
            },
            orderBy: {
                data: "desc",
            },
        });

        if (testeExistente) {
            if (testeExistente.resultado === "Aprovado") {
                return res.status(403).json({
                    error: `O teste de ${tipo} para a aeronave ${aeronaveId} já foi APROVADO e não pode ser alterado.`,
                });
            }

            if (testeExistente.resultado === "Reprovado") {
                const testeAtualizado = await prisma.teste.update({
                    where: {
                        id: testeExistente.id,
                    },
                    data: {
                        resultado: resultado,
                        data: new Date(),
                    },
                });

                return res.status(200).json({
                    message: `Resultado de teste ${tipo} atualizado com sucesso.`,
                    teste: testeAtualizado,
                });
            }

        } else {
            const novoTeste = await prisma.teste.create({
                data: {
                    aeronaveId: aeronaveIdNum,
                    tipo: tipo,
                    resultado: resultado,
                    data: data ? new Date(data) : new Date(),
                },
            });

            return res.status(201).json({
                message: `Novo teste ${tipo} registrado com sucesso.`,
                teste: novoTeste,
            });
        }
    } catch (error) {
        console.error("Erro no processamento do teste:", error);

        if (error === "P2003") {
            return res
                .status(404)
                .json({
                    error: "Aeronave não encontrada. Verifique o código da aeronave.",
                });
        }

        return res
            .status(500)
            .json({ error: "Erro interno do servidor.", detalhe: error });
    }
});

app.get("/testes/:aeronaveId", async (req, res) => {
    try {
        const aeronaveId = parseInt(req.params.aeronaveId);

        if (isNaN(aeronaveId)) {
            return res
                .status(400)
                .json({ error: "O ID da aeronave deve ser um número válido." });
        }

        const historicoTestes = await prisma.teste.findMany({
            where: {
                aeronaveId: aeronaveId,
            },
            orderBy: {
                data: "desc",
            },
        });

        return res.status(200).json(historicoTestes);
    } catch (error) {
        console.error("Erro ao buscar histórico de testes:", error);
        return res
            .status(500)
            .json({
                error: "Erro interno do servidor ao buscar histórico de testes.",
            });
    }
});

app.post("/etapa", async (req, res) => {
    try {
        const { nome, dataPrevista, aeronaveId, funcionarioIds } = req.body;

        if (
            !nome ||
            !dataPrevista ||
            !aeronaveId ||
            !Array.isArray(funcionarioIds)
        ) {
            return res
                .status(400)
                .json({
                    error:
                        "Campos obrigatórios faltando (nome, dataPrevista, aeronaveId e lista de IDs de funcionários).",
                });
        }

        const funcionariosConnect = funcionarioIds.map((id) => ({
            funcionarioId: Number(id),
        }));

        const novaEtapa = await prisma.etapa.create({
            data: {
                nome,
                dataPrevista: new Date(dataPrevista),
                status: "Pendente",
                aeronaveId: Number(aeronaveId),
                funcionarios: {
                    create: funcionariosConnect,
                },
            },
            include: {
                funcionarios: true,
            },
        });

        return res.status(201).json(novaEtapa);
    } catch (error) {
        console.error("Erro ao criar etapa:", error);
        return res
            .status(500)
            .json({ error: "Erro ao criar etapa.", detalhe: error });
    }
});

app.get("/etapasList", async (req, res) => {
    try {
        const etapas = await prisma.etapa.findMany({
            include: {
                funcionarios: {
                    include: {
                        funcionario: {
                            select: { nome: true, id: true },
                        },
                    },
                },
            },
            orderBy: { id: "asc" },
        });
        return res.json(etapas);
    } catch (error) {
        console.error("Erro ao listar etapas:", error);
        return res.status(500).json({ error: "Erro ao listar etapas." });
    }
});

app.put("/etapaEdit", async (req, res) => {
    try {
        const { id, nome, dataPrevista, status, aeronaveId, funcionarioIds } =
            req.body;
        const etapaId = Number(id);

        if (!etapaId) {
            return res.status(400).json({ error: "ID da etapa é obrigatório." });
        }

        const etapaExistente = await prisma.etapa.findUnique({
            where: { id: etapaId },
        });

        if (!etapaExistente) {
            return res.status(404).json({ error: "Etapa não encontrada." });
        }

        if (etapaExistente.status === "Concluido" && status !== "Concluido") {
            return res
                .status(403)
                .json({
                    error:
                        "Etapa já concluída não pode ter o status alterado (reaberta).",
                });
        }

        const dataToUpdate = {
            nome: nome,
            dataPrevista: new Date(dataPrevista),
            status: status,
            aeronaveId: Number(aeronaveId),
        };

        const etapaAtualizada = await prisma.$transaction(async (prisma) => {
            if (funcionarioIds && Array.isArray(funcionarioIds)) {
                await prisma.etapaFuncionario.deleteMany({
                    where: { etapaId: etapaId },
                });

                if (funcionarioIds.length > 0) {
                    const connectFuncs = funcionarioIds.map((id) => ({
                        etapaId: etapaId,
                        funcionarioId: Number(id),
                    }));
                    await prisma.etapaFuncionario.createMany({
                        data: connectFuncs,
                    });
                }
            }

            return prisma.etapa.update({
                where: { id: etapaId },
                data: dataToUpdate,
            });
        });

        const etapaCompleta = await prisma.etapa.findUnique({
            where: { id: etapaId },
            include: {
                funcionarios: {
                    include: {
                        funcionario: {
                            select: { nome: true, id: true },
                        },
                    },
                },
            },
        });

        return res.status(200).json(etapaCompleta);
    } catch (error) {
        console.error("Erro ao atualizar etapa:", error);
        return res
            .status(500)
            .json({ error: "Erro ao atualizar etapa.", detalhe: error });
    }
});

app.delete("/etapaDelete/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID da etapa inválido." });
        }

        await prisma.$transaction([
            prisma.etapaFuncionario.deleteMany({
                where: { etapaId: id },
            }),
            prisma.etapa.delete({
                where: { id },
            }),
        ]);

        return res
            .status(200)
            .json({ message: "Etapa e associações excluídas com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar etapa:", error);
        return res.status(404).json({ error: "Etapa não encontrada." });
    }
});

app.get("/funcionariosListAll", async (req, res) => {
    try {
        const funcionarios = await prisma.funcionario.findMany({
            select: {
                id: true,
                nome: true,
                cargo: true,
            },
        });
        return res.json(funcionarios);
    } catch (error) {
        console.error("Erro ao listar funcionários:", error);
        return res.status(500).json({ error: "Erro ao listar funcionários." });
    }
});


app.post("/gerarRelatorio", async (req, res) => {
    const startTime = performance.now();

    try {
        const { aeronaveId, autor } = req.body;
        const aeronaveIdNum = Number(aeronaveId);

        if (!aeronaveIdNum || !autor) {
            return res.status(400).json({ error: "Aeronave e Autor do relatório são obrigatórios." });
        }


        const [etapasValidacao, todosTestes] = await prisma.$transaction([
            prisma.etapa.findMany({
                where: { aeronaveId: aeronaveIdNum },
                select: { status: true, nome: true },
            }),
            prisma.teste.findMany({
                where: { aeronaveId: aeronaveIdNum },
                select: { tipo: true, resultado: true, data: true },
                orderBy: { data: 'desc' },
            })
        ]);

        if (etapasValidacao.length === 0) {
            return res.status(403).json({ error: `Relatório negado: Nenhuma etapa de produção encontrada para a aeronave ${aeronaveId}.` });
        }
        const etapasNaoConcluidas = etapasValidacao.filter(e => e.status !== 'Concluido');
        if (etapasNaoConcluidas.length > 0) {
            const nomesEtapasPendentes = etapasNaoConcluidas.map(e => e.nome).join(', ');
            return res.status(403).json({ error: `Relatório negado: As seguintes etapas ainda não estão concluídas: ${nomesEtapasPendentes}` });
        }

        const ultimoResultadoPorTipo = todosTestes.reduce((acc, teste) => {
            if (!acc.has(teste.tipo)) {
                acc.set(teste.tipo, teste.resultado);
            }
            return acc;
        }, new Map());

        const testesReprovados = Array.from(ultimoResultadoPorTipo.entries())
            .filter(([, resultado]) => resultado !== 'Aprovado');

        if (testesReprovados.length > 0) {
            const tiposReprovados = testesReprovados.map(([tipo]) => tipo).join(', ');
            return res.status(403).json({ error: `Relatório negado: Os seguintes testes não foram aprovados (status final): ${tiposReprovados}` });
        }

        const [aeronaveBasica, pecasDetalhe, etapasDetalhe, testesDetalhe] = await prisma.$transaction([
            prisma.aeronave.findUnique({
                where: { codigo: aeronaveIdNum },
            }),
            prisma.peca.findMany({
                where: { aeronaveId: aeronaveIdNum },
                select: { id: true, nome: true, fornecedor: true, status: true, tipo: true }
            }),
            prisma.etapa.findMany({
                where: { aeronaveId: aeronaveIdNum },
                include: {
                    funcionarios: {
                        include: { funcionario: { select: { nome: true, cargo: true } } }
                    }
                }
            }),
            prisma.teste.findMany({
                where: { aeronaveId: aeronaveIdNum },
                select: { tipo: true, resultado: true, data: true },
                orderBy: { data: 'desc' }
            })
        ]);

        if (!aeronaveBasica) {
            return res.status(404).json({ error: "Aeronave não encontrada." });
        }

        const aeronaveCompleta = {
            ...aeronaveBasica,
            pecas: pecasDetalhe,
            etapas: etapasDetalhe,
            testes: testesDetalhe
        };

        const endTime = performance.now();
        const tpDuration = endTime - startTime;

        console.log(`[REAL TP] TP: ${tpDuration.toFixed(3)} ms`);

        return res.status(200).json({
            aeronave: aeronaveCompleta,
            relatorioInfo: {
                dataGeracao: new Date().toISOString(),
                autor: autor,
                tempoProcessamento: `${tpDuration} ms`
            }
        });

    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        if ((error as any).code === 'P2003') {
            return res.status(404).json({ error: "Aeronave não encontrada. Verifique o código." });
        }
        return res.status(500).json({ error: "Erro interno do servidor ao gerar relatório.", detalhe: error });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

process.on("beforeExit", async () => {
    console.log("Fechando conexão com o Prisma...");
    await prisma.$disconnect();
});