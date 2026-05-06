import { readFile } from "node:fs/promises";

const PROJECTS_FILE = new URL("../projects.json", import.meta.url);

function resolveEnvPlaceholders(value) {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, varName) => {
    const v = process.env[varName];
    if (v === undefined || v === "") {
      throw new Error(`Variável de ambiente não definida: ${varName}`);
    }
    return v;
  });
}

async function pingProject(project) {
  const url = `${project.url}/auth/v1/settings`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: project.key,
      Authorization: `Bearer ${project.key}`,
    },
  });
  return { status: res.status, ok: res.ok };
}

async function main() {
  const raw = await readFile(PROJECTS_FILE, "utf8");
  const projects = JSON.parse(raw);

  let hasFailure = false;

  for (const project of projects) {
    let resolvedKey;
    try {
      resolvedKey = resolveEnvPlaceholders(project.key);
    } catch (err) {
      console.error(`❌ ${project.name} — ${err.message}`);
      hasFailure = true;
      continue;
    }

    const resolved = { ...project, key: resolvedKey };

    try {
      const { status, ok } = await pingProject(resolved);
      if (ok) {
        console.log(`✅ ${project.name} — HTTP ${status}`);
      } else {
        console.error(`❌ ${project.name} — HTTP ${status}`);
        hasFailure = true;
      }
    } catch (err) {
      console.error(`❌ ${project.name} — ${err.message}`);
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
