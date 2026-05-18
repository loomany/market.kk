import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

type JsonRecord = Record<string, unknown>;

type RouteCheck = {
  name: string;
  path: string;
  body: JsonRecord;
  expectedStatus?: number;
  expectedProvider?: string;
  expectedErrorCode?: string;
};

type Scenario = {
  name: string;
  env: Record<string, string>;
  expectedMode: {
    mockMode: boolean;
    paidAiRunsAllowed: boolean;
  };
  checks: RouteCheck[];
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const npmCommand = "npm";

function getFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not allocate a port")));
        return;
      }
      const port = address.port;
      server.close(() => resolve(port));
    });
  });
}

function startDevServer(port: number, env: Record<string, string>) {
  const childEnv = Object.fromEntries(
    Object.entries({
      ...process.env,
      ...env,
      NEXT_TELEMETRY_DISABLED: "1",
      NODE_ENV: process.env.NODE_ENV ?? "development",
    }).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  ) as NodeJS.ProcessEnv;

  const child = spawn(
    `${npmCommand} run dev -- --hostname 127.0.0.1 --port ${port}`,
    [],
    {
      cwd: repoRoot,
      env: childEnv,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  const recentLogs: string[] = [];
  const remember = (chunk: Buffer) => {
    const lines = chunk.toString("utf8").split(/\r?\n/).filter(Boolean);
    recentLogs.push(...lines.slice(-8));
    while (recentLogs.length > 20) recentLogs.shift();
  };
  child.stdout.on("data", remember);
  child.stderr.on("data", remember);

  return { child, recentLogs };
}

function stopDevServer(child: ChildProcess) {
  if (child.killed) return;

  if (process.platform === "win32" && child.pid) {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
      return;
    } catch {
      // Fall through to normal kill.
    }
  }

  child.kill("SIGTERM");
}

async function fetchJson(baseUrl: string, pathName: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${pathName}`, init);
  const json = (await response.json().catch(() => ({}))) as JsonRecord;
  return { response, json };
}

async function waitForAiMode(
  baseUrl: string,
  child: ChildProcess,
  recentLogs: string[]
) {
  const deadline = Date.now() + 90_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Dev server exited early. Last logs:\n${recentLogs.join("\n")}`
      );
    }

    try {
      const { response, json } = await fetchJson(baseUrl, "/api/system/ai-mode");
      if (response.ok && typeof json.mockMode === "boolean") {
        return json;
      }
    } catch {
      // Server is still booting.
    }

    await delay(1_000);
  }

  throw new Error(`Timed out waiting for ${baseUrl}/api/system/ai-mode`);
}

function assertCondition(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function postJson(baseUrl: string, check: RouteCheck) {
  const { response, json } = await fetchJson(baseUrl, check.path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(check.body),
  });

  const expectedStatus = check.expectedStatus ?? 200;
  assertCondition(
    response.status === expectedStatus,
    `${check.name}: expected HTTP ${expectedStatus}, got ${response.status} ${JSON.stringify(json)}`
  );

  if (check.expectedProvider) {
    assertCondition(
      json.provider === check.expectedProvider,
      `${check.name}: expected provider ${check.expectedProvider}, got ${String(json.provider)}`
    );
  }

  if (check.expectedErrorCode) {
    assertCondition(
      json.errorCode === check.expectedErrorCode,
      `${check.name}: expected ${check.expectedErrorCode}, got ${String(json.errorCode)}`
    );
  }

  return json;
}

async function runScenario(scenario: Scenario) {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const { child, recentLogs } = startDevServer(port, scenario.env);

  try {
    const mode = await waitForAiMode(baseUrl, child, recentLogs);
    assertCondition(
      mode.mockMode === scenario.expectedMode.mockMode,
      `${scenario.name}: unexpected mockMode`
    );
    assertCondition(
      mode.paidAiRunsAllowed === scenario.expectedMode.paidAiRunsAllowed,
      `${scenario.name}: unexpected paidAiRunsAllowed`
    );

    for (const check of scenario.checks) {
      await postJson(baseUrl, check);
    }

    console.log(`[smoke] ${scenario.name}: ok`);
  } finally {
    stopDevServer(child);
    await delay(1_500);
  }
}

const commonImageUrl = "https://example.com/demo-product.png";

const scenarios: Scenario[] = [
  {
    name: "forced mock routes",
    env: {
      AI_MOCK_MODE: "1",
      ALLOW_PAID_AI_RUNS: "false",
    },
    expectedMode: { mockMode: true, paidAiRunsAllowed: false },
    checks: [
      {
        name: "generate model mock",
        path: "/api/ai/generate-model",
        expectedProvider: "mock",
        body: {
          gender: "female",
          bodyType: "standard",
          ageGroup: "adult",
          pose: "front",
          crop: "full-body",
          categoryContext: "clothing",
          numImages: 1,
        },
      },
      {
        name: "try-on mock",
        path: "/api/ai/tryon",
        expectedProvider: "mock",
        body: {
          productImageUrl: commonImageUrl,
          modelImageUrl: "https://example.com/demo-model.png",
          category: "auto",
          garmentPhotoType: "model",
          mode: "balanced",
          moderationLevel: "permissive",
          numSamples: 1,
          outputFormat: "png",
        },
      },
      {
        name: "product shot mock",
        path: "/api/ai/product-shot",
        expectedProvider: "mock",
        body: {
          productImageUrl: commonImageUrl,
          scenePreset: "marketplace-clean",
          numResults: 1,
        },
      },
      {
        name: "remove background mock",
        path: "/api/ai/remove-background",
        expectedProvider: "mock",
        body: {
          imageUrl: commonImageUrl,
        },
      },
      {
        name: "video mock",
        path: "/api/ai/video/generate",
        expectedProvider: "mock",
        body: {
          sourceImageUrl: commonImageUrl,
          prompt: "модель плавно поворачивается, товар не меняется",
          modelKey: "kling",
          quality: "balanced",
          durationSeconds: 5,
          aspectRatio: "9:16",
          motionPreset: "product-fidelity",
        },
      },
      {
        name: "scene mock",
        path: "/api/ai/scene/generate",
        expectedProvider: "mock",
        body: {
          sourceImageUrl: commonImageUrl,
          prompt: "светлая студийная витрина",
          mode: "exact-background",
          aspectRatio: "1:1",
          outputFormat: "png",
        },
      },
      {
        name: "prompt enhance mock",
        path: "/api/ai/prompt/enhance",
        expectedProvider: "mock",
        body: {
          context: "video",
          userPrompt: "камера медленно приближается",
          targetPlatform: "reels",
          language: "ru",
        },
      },
      {
        name: "pricing dry estimate",
        path: "/api/ai/pricing",
        body: {
          type: "video",
          modelKey: "kling",
          durationSeconds: 5,
        },
      },
    ],
  },
  {
    name: "real mode disabled guard",
    env: {
      AI_MOCK_MODE: "0",
      ALLOW_PAID_AI_RUNS: "false",
      FAL_KEY: "smoke-not-a-real-key",
      OPENAI_API_KEY: "smoke-not-a-real-key",
      GREEN_API_INSTANCE_ID: "smoke-not-a-real-instance",
      GREEN_API_TOKEN: "smoke-not-a-real-token",
    },
    expectedMode: { mockMode: false, paidAiRunsAllowed: false },
    checks: [
      {
        name: "generate model blocked",
        path: "/api/ai/generate-model",
        expectedStatus: 402,
        expectedErrorCode: "PAID_AI_RUNS_DISABLED",
        body: {
          gender: "female",
          bodyType: "standard",
          ageGroup: "adult",
          pose: "front",
          crop: "full-body",
          categoryContext: "clothing",
          numImages: 1,
        },
      },
      {
        name: "prompt enhance blocked",
        path: "/api/ai/prompt/enhance",
        expectedStatus: 402,
        expectedErrorCode: "PAID_AI_RUNS_DISABLED",
        body: {
          context: "video",
          userPrompt: "камера медленно приближается",
          targetPlatform: "reels",
          language: "ru",
        },
      },
      {
        name: "whatsapp send blocked",
        path: "/api/auth/whatsapp/send-code",
        expectedStatus: 402,
        expectedErrorCode: "PAID_AI_RUNS_DISABLED",
        body: {
          phone: "+77001234567",
        },
      },
      {
        name: "pricing still allowed",
        path: "/api/ai/pricing",
        body: {
          type: "scene",
          mode: "exact-background",
        },
      },
    ],
  },
  {
    name: "budget guard",
    env: {
      AI_MOCK_MODE: "0",
      ALLOW_PAID_AI_RUNS: "true",
      MAX_AI_TEST_SPEND_USD: "0",
      FAL_KEY: "smoke-not-a-real-key",
    },
    expectedMode: { mockMode: false, paidAiRunsAllowed: true },
    checks: [
      {
        name: "generate model budget blocked",
        path: "/api/ai/generate-model",
        expectedStatus: 402,
        expectedErrorCode: "BUDGET_EXCEEDED",
        body: {
          gender: "female",
          bodyType: "standard",
          ageGroup: "adult",
          pose: "front",
          crop: "full-body",
          categoryContext: "clothing",
          numImages: 1,
        },
      },
    ],
  },
];

for (const scenario of scenarios) {
  await runScenario(scenario);
}

console.log("[smoke] AI mock and paid guard checks passed");
