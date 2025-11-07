import http from 'node:http';
import { AddressInfo } from 'node:net';

const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok' }));
});

server.listen(PORT, () => {
  const address = server.address() as AddressInfo | null;
  const host = address?.address ?? '0.0.0.0';
  const port = address?.port ?? PORT;
  console.log(`Server listening on http://${host}:${port}`);
});

