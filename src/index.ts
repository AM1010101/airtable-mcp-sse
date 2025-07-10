import { startHttpServer, startHttpTransport } from './transport.js';

const main = async () => {
  const httpServer = await startHttpServer({ port: 8080 });
  startHttpTransport(httpServer);
};

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
