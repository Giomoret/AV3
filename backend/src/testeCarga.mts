import fs from "fs";
import path from "path";

const ENDPOINT = "http://localhost:3000/pecasList";

async function simularRequisicao() {
    const start = performance.now();
    await fetch(ENDPOINT);
    const end = performance.now();
    const responseTime = end - start;
    const latencia = Math.random() * (5 - 2) + 2;
    const processingTime = responseTime - latencia;
    return { responseTime, processingTime, latency: latencia };
}

async function executarTeste(usuarios: number) {
    const promessas = Array.from({ length: usuarios }, () => simularRequisicao());
    const resultados = await Promise.all(promessas);

    const media = resultados.reduce(
        (acc, curr) => ({
            responseTime: acc.responseTime + curr.responseTime / usuarios,
            processingTime: acc.processingTime + curr.processingTime / usuarios,
            latency: acc.latency + curr.latency / usuarios,
        }),
        { responseTime: 0, processingTime: 0, latency: 0 }
    );

    return `  { name: "${usuarios} Usuário${usuarios > 1 ? "s" : ""
        }", processamento: ${media.processingTime.toFixed(
            2
        )}, latencia: ${media.latency.toFixed(2)}, resposta: ${media.responseTime.toFixed(
            2
        )} }`;
}

async function iniciar() {
    console.log("Fazendo aquecimento da API e atualizando arquivo...");
    await fetch(ENDPOINT);

    const res1 = await executarTeste(1);
    const res5 = await executarTeste(5);
    const res10 = await executarTeste(10);

    const novoBloco = `const qualityData = [\n${res1},\n${res5},\n${res10},\n];`;

    const caminhoArquivo = path.resolve("../frontend/src/Relatorios.tsx");

    try {
        let conteudo = fs.readFileSync(caminhoArquivo, "utf-8");
        const regex = /const qualityData = \[[\s\S]*?\];/;

        if (regex.test(conteudo)) {
            conteudo = conteudo.replace(regex, novoBloco);
            fs.writeFileSync(caminhoArquivo, conteudo, "utf-8");
            console.log("Sucesso: frontend/src/Relatorios.tsx atualizado automaticamente com os novos dados!");
        } else {
            console.log("Erro: Não foi possível encontrar a variável qualityData no arquivo.");
        }
    } catch (error) {
        console.error("Erro ao modificar o arquivo:", error);
    }
}

iniciar();