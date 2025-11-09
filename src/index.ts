import 'dotenv/config';
import { AddressInfo } from 'node:net';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT ?? 4000);

const server = createServer();

server.listen(PORT, () => {
  const address = server.address() as AddressInfo | null;
  const host = address?.address ?? '0.0.0.0';
  const port = address?.port ?? PORT;
  console.log(`Server listening on http://${host}:${port}`);
});

