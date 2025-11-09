import http from 'node:http';

export function createLoadBalancer(port: number, workerPorts: number[]): http.Server {
  let currentWorkerIndex = 0;

  const server = http.createServer((req, res) => {
    const targetPort = workerPorts[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % workerPorts.length;

    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`Error forwarding to worker on port ${targetPort}:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    });

    req.pipe(proxyReq);
  });

  return server;
}

