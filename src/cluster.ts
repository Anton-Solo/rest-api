import 'dotenv/config';
import cluster from 'node:cluster';
import os from 'node:os';
import { AddressInfo } from 'node:net';
import { createServer } from './server.js';
import { createLoadBalancer } from './loadBalancer.js';
import { sharedDb } from './db/sharedDatabase.js';

const PORT = Number(process.env.PORT ?? 4000);
const numCPUs = os.availableParallelism();
const numWorkers = numCPUs - 1 || 1;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Available CPUs: ${numCPUs}, Starting ${numWorkers} workers...`);

  sharedDb;

  const workerPorts: number[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const workerPort = PORT + i + 1;
    workerPorts.push(workerPort);
    
    const worker = cluster.fork({ WORKER_PORT: workerPort });
    console.log(`Worker ${worker.process.pid} will listen on port ${workerPort}`);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    const newWorkerPort = PORT + 1;
    const newWorker = cluster.fork({ WORKER_PORT: newWorkerPort });
    console.log(`New worker ${newWorker.process.pid} started on port ${newWorkerPort}`);
  });

  const loadBalancer = createLoadBalancer(PORT, workerPorts);
  
  loadBalancer.listen(PORT, () => {
    const address = loadBalancer.address() as AddressInfo | null;
    const host = address?.address ?? '0.0.0.0';
    const port = address?.port ?? PORT;
    console.log(`\n Load Balancer listening on http://${host}:${port}`);
    console.log(` Distributing requests to ${numWorkers} workers (ports ${workerPorts.join(', ')})`);
    console.log(` Using Round-robin algorithm for load distribution\n`);
  });

} else {
  const workerPort = Number(process.env.WORKER_PORT);
  const server = createServer();

  server.listen(workerPort, () => {
    console.log(`   Worker ${process.pid} listening on port ${workerPort}`);
  });
}

