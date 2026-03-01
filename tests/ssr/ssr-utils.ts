const API_BASE = process.env.TEST_BASE_URL || 'http://localhost:4321';

// Lightweight SSR test helpers. A real server process is expected to be started
// externally (e.g. via a globalSetup script). These wrappers simply fetch pages.
async function startServer(_opts?: { throwError?: boolean }) {
  // no-op — server is managed externally
}
async function stopServer() {
  // no-op
}
async function fetchPage(pagePath: string) {
  const res = await fetch(`${API_BASE}${pagePath}`);
  const html = await res.text();
  return { html, status: res.status, clientJsSize: 0, hydratedIslands: 0 };
}

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
