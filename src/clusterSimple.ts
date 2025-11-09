import 'dotenv/config';
import cluster from 'node:cluster';
import os from 'node:os';
import { AddressInfo } from 'node:net';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT ?? 4000);
const numCPUs = os.availableParallelism();
const numWorkers = numCPUs - 1 || 1;

if (cluster.isPrimary) {
  console.log(`\n Primary process ${process.pid} is running`);
  console.log(`Available CPUs: ${numCPUs}`);
  console.log(`Starting ${numWorkers} workers...\n`);

  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();
    console.log(`   ✓ Worker ${worker.process.pid} started`);
  }

  console.log(`\n Load Balancer listening on port ${PORT}`);
  console.log(`Using Round-robin algorithm for load distribution\n`);

  cluster.on('exit', (worker, code, signal) => {
    console.log(`\n  Worker ${worker.process.pid} died (${signal || code})`);
    const newWorker = cluster.fork();
    console.log(`   ✓ New worker ${newWorker.process.pid} started\n`);
  });

} else {
  const server = createServer();

  server.listen(PORT, () => {
    const address = server.address() as AddressInfo | null;
    const port = address?.port ?? PORT;
    console.log(`   Worker ${process.pid} listening on port ${port}`);
  });
}

