import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now(); // Início da chegada da requisição (Latência + Processamento)

    // Intercepta quando a resposta termina
    res.on('finish', () => {
        const end = performance.now();
        const totalDuration = end - start; // Tempo de Resposta Total

        // Em um sistema crítico, você logaria isso em um arquivo ou banco de logs
        // Para o seu relatório, vamos apenas imprimir no console com um prefixo fácil de identificar
        console.log(`[METRICAS] Rota: ${req.method} ${req.originalUrl} | TempoResposta: ${totalDuration.toFixed(2)}ms`);
    });

    next();
};