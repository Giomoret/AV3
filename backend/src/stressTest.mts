const numUsers = parseInt(process.argv[2] ?? '1');
const url = 'http://localhost:3000/funcionariosList'; // Ajuste se for outra rota

async function runStressTest() {
    console.log(`--- Iniciando teste com ${numUsers} usuários simultâneos ---`);

    // Cria um array de promessas para disparar todas ao mesmo tempo
    const requests = Array.from({ length: numUsers }).map(() =>
        fetch(url).then(res => res.json()).catch(err => console.error("Erro na requisição"))
    );

    // Dispara todas as requisições em paralelo
    await Promise.all(requests);

    console.log(`--- Teste com ${numUsers} usuários finalizado ---`);
}

runStressTest();