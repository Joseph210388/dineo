const BASE = process.env.LOAD_TEST_URL || "http://localhost:3000";
const USERS = Number(process.env.LOAD_TEST_USERS || 20);
const PATHS = ["/", "/food", "/about", "/contact"];

async function timedFetch(path) {
  const started = Date.now();

  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { Accept: "text/html" },
      redirect: "follow",
    });
    const body = await response.text();

    return {
      path,
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      bytes: body.length,
    };
  } catch (error) {
    return {
      path,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      bytes: 0,
      error: error.message,
    };
  }
}

function percentile(sorted, percent) {
  if (!sorted.length) {
    return 0;
  }

  const index = Math.min(sorted.length - 1, Math.ceil((percent / 100) * sorted.length) - 1);
  return sorted[index];
}

async function visitAsUser(userId) {
  const results = [];

  for (const path of PATHS) {
    results.push({ userId, ...(await timedFetch(path)) });
  }

  return results;
}

async function main() {
  console.log(`Simulando ${USERS} personas a la vez contra ${BASE}`);
  console.log(`Cada visita recorre: ${PATHS.join(" → ")}`);

  const started = Date.now();
  const visits = await Promise.all(Array.from({ length: USERS }, (_, index) => visitAsUser(index + 1)));
  const results = visits.flat();
  const elapsed = Date.now() - started;
  const times = results.map((item) => item.ms).sort((a, b) => a - b);
  const failed = results.filter((item) => !item.ok);

  console.log("\nResultado");
  console.log(`  Peticiones: ${results.length}`);
  console.log(`  Errores:    ${failed.length}`);
  console.log(`  Ensayo:     ${elapsed} ms`);
  console.log(`  Más rápida: ${times[0]} ms`);
  console.log(`  Mediana:    ${percentile(times, 50)} ms`);
  console.log(`  p95:        ${percentile(times, 95)} ms`);
  console.log(`  Más lenta:  ${times[times.length - 1]} ms`);

  for (const path of PATHS) {
    const subset = results.filter((item) => item.path === path);
    const subsetTimes = subset.map((item) => item.ms).sort((a, b) => a - b);
    const subsetFail = subset.filter((item) => !item.ok).length;
    console.log(
      `  ${path.padEnd(10)} mediana ${percentile(subsetTimes, 50)} ms · p95 ${percentile(subsetTimes, 95)} ms · fallos ${subsetFail}`
    );
  }

  if (failed.length) {
    console.log("\nFallos:");
    for (const item of failed.slice(0, 10)) {
      console.log(`  usuario ${item.userId} ${item.path} → ${item.status || item.error}`);
    }
    process.exitCode = 1;
  }
}

main();
