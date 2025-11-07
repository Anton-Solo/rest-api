import 'dotenv/config';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleRequest } from './router.js';

const PORT = Number(process.env.PORT ?? 4000);

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  const address = server.address() as AddressInfo | null;
  const host = address?.address ?? '0.0.0.0';
  const port = address?.port ?? PORT;
  console.log(`Server listening on http://${host}:${port}`);
});

