export default async function globalSetup() {
  const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseURL}/api/health/db`);
    const data = await res.json();
    if (data.backend === "upstash-redis" && process.env.ALLOW_PROD_E2E !== "1") {
      throw new Error(
        `The server at ${baseURL} is backed by production Redis (Upstash). ` +
        "Refusing to run suites against it. Start the app without KV env (in-memory store) or set ALLOW_PROD_E2E=1 for a deliberate small check."
      );
    }
  } catch (e) {
    if (e.message?.includes("production Redis")) throw e;
    // server not up yet: the suites themselves will surface that
  }
}
