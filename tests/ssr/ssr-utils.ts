import { startServer, stopServer, fetchPage } from '@tests/utils/api-helpers';

export async function renderSSR(path: string) {
  await startServer();
  const res = await fetchPage(path);
  await stopServer();
  return {
    html: res.html,
    status: res.status
  };
}

export async function simulateHydration(path: string) {
  // Simulate hydration metrics
  await startServer();
  const res = await fetchPage(path);
  await stopServer();
  return {
    clientJs: res.clientJsSize,
    hydratedIslands: res.hydratedIslands
  };
}

export async function simulateServerError(path: string) {
  await startServer({ throwError: true });
  const res = await fetchPage(path);
  await stopServer();
  return {
    html: res.html,
    status: res.status
  };
}
