import { createCloudAgentsClient } from "./cloud-agents.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface AnalysisResult {
  summary: string;
  risk: "green" | "yellow" | "red";
  risk_reason: string;
  steps: { text: string; box: [number, number, number, number] | null; lineIndex?: number | null }[];
}

interface OcrLine {
  index: number;
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  confidence: number;
}

const SYSTEM_PROMPT = `你是一个帮助老年人看懂手机屏幕的AI助手，名叫"看懂啦"。

你的任务是分析用户发来的手机截图文字内容（通过OCR识别），理解内容，并根据用户的问题给出清晰、简单、温暖的回答。

用户会提供从截图中识别出的文字，每行有编号。你需要根据这些文字内容进行分析。

你必须严格按照以下JSON格式返回结果，不要返回任何其他内容：
{
  "summary": "一句话结论，用最简单的话告诉用户这是什么",
  "risk": "green/yellow/red 三选一",
  "risk_reason": "为什么是这个风险等级的详细解释",
  "steps": [
    {
      "text": "这一步要做什么，用大白话描述",
      "lineIndex": 0
    }
  ]
}

关于 lineIndex：
- 每个 step 中的 lineIndex 表示这一步对应的是OCR识别出的第几行文字（从0开始编号）
- 如果这一步明确对应某一行文字，请填入该行的编号
- 如果无法确定对应哪一行，或者这一步是总结性建议，lineIndex 填 null
- lineIndex 用于在截图上画红圈标注位置

风险等级判断规则：
- green（安全）：正常的系统通知、官方APP页面、常见操作界面
- yellow（小心）：涉及钱的操作但不确定是否安全、需要确认的操作
- red（危险）：诈骗特征明显，包括但不限于：
  - 转账汇款给陌生人
  - 中奖领奖
  - "客服"说退款理赔
  - 要求共享屏幕或下载会议软件
  - 索要验证码
  - 贷款刷流水
  - 冒充公检法
  - 提到"安全账户"
  - 可疑链接
  - 制造紧迫感逼迫操作

注意事项：
- 用词要简单，避免专业术语
- 每步指导要具体
- 如果是诈骗，summary要直接明确地告诉用户"这是诈骗"
- red风险时，steps最后一步要告诉用户拨打96110`;

const CLOUD_ORIGIN = "https://api.qoder.com.cn";

let cachedAgentId: string | null = null;
let cachedEnvironmentId: string | null = null;
let cachedModelId: string | null = null;

async function hashConfig(value: unknown): Promise<string> {
  const json = JSON.stringify(value, Object.keys(value as object).sort());
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(json));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function isConflictError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  return e.status === 409 || e.code === "ai_conflict";
}

async function getModelId(client: ReturnType<typeof createCloudAgentsClient>): Promise<string> {
  if (cachedModelId) return cachedModelId;

  const result = await client.request("/api/v1/cloud/models", { method: "GET" }) as unknown as {
    data?: Array<{ id: string; enabled?: boolean }>;
  };

  const models = result.data || [];
  const enabled = models.find(m => m.enabled !== false);
  if (!enabled) throw new Error("No enabled models");

  cachedModelId = enabled.id;
  return cachedModelId;
}

async function getOrCreateAgent(client: ReturnType<typeof createCloudAgentsClient>, modelId: string): Promise<string> {
  if (cachedAgentId) return cachedAgentId;

  const agentDef = {
    name: "看懂啦截图分析助手",
    model: modelId,
    system: SYSTEM_PROMPT,
    tools: [],
    metadata: { app: "kandongla", purpose: "screenshot-analysis" },
  };

  try {
    const existing = await client.findResources("agents", { app: "kandongla", purpose: "screenshot-analysis" }, 3) as unknown as Array<{ id: string }>;
    if (Array.isArray(existing) && existing.length > 0) {
      cachedAgentId = existing[0].id;
      return cachedAgentId;
    }
  } catch { /* not found or search failed, try creating */ }

  const configHash = await hashConfig(agentDef);
  try {
    const result = await client.request("/api/v1/cloud/agents", {
      method: "POST",
      body: agentDef,
      idempotencyKey: `kandongla-agent-${configHash}`,
    }) as unknown as { id: string };

    cachedAgentId = result.id;
    return cachedAgentId;
  } catch (err) {
    if (isConflictError(err)) {
      try {
        const found = await client.findResources("agents", { app: "kandongla", purpose: "screenshot-analysis" }, 3) as unknown as Array<{ id: string }>;
        if (Array.isArray(found) && found.length > 0) {
          cachedAgentId = found[0].id;
          return cachedAgentId;
        }
      } catch { /* fall through */ }

      try {
        const broad = await client.findResources("agents", { app: "kandongla" }, 3) as unknown as Array<{ id: string }>;
        if (Array.isArray(broad) && broad.length > 0) {
          cachedAgentId = broad[0].id;
          return cachedAgentId;
        }
      } catch { /* fall through */ }
    }
    throw err;
  }
}

async function getOrCreateEnvironment(client: ReturnType<typeof createCloudAgentsClient>): Promise<string> {
  if (cachedEnvironmentId) return cachedEnvironmentId;

  const envDef = {
    name: "看懂啦分析环境",
    config: { type: "cloud" },
    metadata: { app: "kandongla" },
  };

  try {
    const existing = await client.findResources("environments", { app: "kandongla" }, 3) as unknown as Array<{ id: string }>;
    if (Array.isArray(existing) && existing.length > 0) {
      cachedEnvironmentId = existing[0].id;
      return cachedEnvironmentId;
    }
  } catch { /* search failed, try creating */ }

  const configHash = await hashConfig(envDef);
  try {
    const result = await client.request("/api/v1/cloud/environments", {
      method: "POST",
      body: envDef,
      idempotencyKey: `kandongla-env-${configHash}`,
    }) as unknown as { id: string };

    cachedEnvironmentId = result.id;
    return cachedEnvironmentId;
  } catch (err) {
    if (isConflictError(err)) {
      try {
        const found = await client.findResources("environments", { app: "kandongla" }, 3) as unknown as Array<{ id: string }>;
        if (Array.isArray(found) && found.length > 0) {
          cachedEnvironmentId = found[0].id;
          return cachedEnvironmentId;
        }
      } catch { /* fall through */ }
    }
    throw err;
  }
}

async function createSession(
  client: ReturnType<typeof createCloudAgentsClient>,
  agentId: string,
  environmentId: string,
  title: string
): Promise<string> {
  const result = await client.request("/api/v1/cloud/sessions", {
    method: "POST",
    body: {
      agent: agentId,
      environment_id: environmentId,
      title,
      metadata: { app: "kandongla" },
    },
  }) as unknown as { id: string };

  return result.id;
}

async function sendMessage(
  client: ReturnType<typeof createCloudAgentsClient>,
  sessionId: string,
  text: string
): Promise<void> {
  await client.request(`/api/v1/cloud/sessions/${sessionId}/events`, {
    method: "POST",
    body: {
      events: [
        {
          type: "user.message",
          content: [{ type: "text", text }],
        },
      ],
    },
  });
}

async function pollForResult(
  client: ReturnType<typeof createCloudAgentsClient>,
  sessionId: string,
  maxAttempts: number = 20
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 1500));

    try {
      const result = await client.request(
        `/api/v1/cloud/sessions/${sessionId}/events?order=desc&limit=10`,
        { method: "GET" }
      ) as unknown as { data?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }> };

      const events = result.data || [];

      for (const evt of events) {
        if (evt.type === "agent.message" && evt.content) {
          for (const block of evt.content) {
            if (block.type === "text" && block.text) {
              return block.text;
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  throw new Error("Agent did not respond in time");
}

function extractJSON(text: string): string | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) return codeBlockMatch[1];

  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  const braceMatch = text.match(/\{[\s\S]*\}/);
  return braceMatch ? braceMatch[0] : null;
}

function parseAnalysisResult(text: string): AnalysisResult {
  const jsonStr = extractJSON(text);
  if (!jsonStr) throw new Error("No JSON found in response");

  const parsed = JSON.parse(jsonStr) as AnalysisResult;

  if (!["green", "yellow", "red"].includes(parsed.risk)) {
    parsed.risk = "yellow";
  }
  if (!parsed.summary) {
    parsed.summary = "无法识别内容，建议让家人帮忙看看。";
  }
  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    parsed.steps = [{ text: "请让家人帮您看看。", box: null, lineIndex: null }];
  }

  return parsed;
}

async function analyzeWithAgent(question: string, imageDescription: string, ocrText?: string, ocrLines?: OcrLine[]): Promise<AnalysisResult> {
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });

  const modelId = await getModelId(client);
  const agentId = await getOrCreateAgent(client, modelId);
  const environmentId = await getOrCreateEnvironment(client);

  const title = `分析: ${question.slice(0, 20)}`;
  const sessionId = await createSession(client, agentId, environmentId, title);

  let fullText = `用户的问题：${question}`;
  if (imageDescription) {
    fullText += `\n\n截图内容描述：${imageDescription}`;
  }

  if (ocrText && ocrLines && ocrLines.length > 0) {
    fullText += `\n\n以下是从截图中通过OCR识别出的文字，每行有编号：\n`;
    for (const line of ocrLines) {
      fullText += `第${line.index}行：${line.text}\n`;
    }
    fullText += `\n请根据以上OCR识别出的文字内容进行分析。在每个step中，用lineIndex字段标明这一步对应的是第几行文字（从0开始编号）。如果无法确定对应行号，lineIndex填null。`;
  }

  fullText += `\n\n请分析并按照要求的JSON格式返回结果。`;

  await sendMessage(client, sessionId, fullText);
  const resultText = await pollForResult(client, sessionId);

  let parsed: AnalysisResult;
  try {
    parsed = parseAnalysisResult(resultText);
  } catch (firstErr) {
    console.warn("First JSON parse failed, retrying:", firstErr);
    const retrySessionId = await createSession(client, agentId, environmentId, title + " (重试)");
    await sendMessage(client, retrySessionId, fullText + "\n\n重要：请只返回纯JSON，不要包含其他文字。");
    const retryText = await pollForResult(client, retrySessionId);
    parsed = parseAnalysisResult(retryText);
  }

  if (ocrLines && ocrLines.length > 0) {
    for (const step of parsed.steps) {
      if (step.lineIndex != null && step.lineIndex >= 0 && step.lineIndex < ocrLines.length) {
        const line = ocrLines[step.lineIndex];
        step.box = [line.x0, line.y0, line.x1 - line.x0, line.y1 - line.y0];
      } else {
        step.box = step.box || null;
      }
    }
  }

  return parsed;
}

function applyFraudRules(result: AnalysisResult, question: string): AnalysisResult {
  const FRAUD_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
    { pattern: /(转账|汇款|打款).*(陌生|不认识|未知|安全账户)|(陌生|不认识|未知).*(转账|汇款|打款)/, reason: "涉及转账给陌生人" },
    { pattern: /中奖|领奖|恭喜.*获得/, reason: "中奖领奖类诈骗" },
    { pattern: /客服.*退款|退款.*客服|理赔/, reason: "冒充客服退款诈骗" },
    { pattern: /共享屏幕|屏幕共享|远程.*控制/, reason: "要求共享屏幕" },
    { pattern: /验证码|校验码|动态密码/, reason: "索要验证码" },
    { pattern: /贷款|刷流水|刷单/, reason: "贷款刷流水诈骗" },
    { pattern: /公安|检察院|法院.*电话/, reason: "冒充公检法" },
    { pattern: /安全账户|保证金/, reason: "安全账户诈骗" },
    { pattern: /http[s]?:\/\/[^\s]*\.(cn|top|xyz|cc|tk)/, reason: "可疑链接" },
    { pattern: /24小时.*扣款|24小时.*失效/, reason: "制造紧迫感" },
  ];

  // 只检查用户输入（问题 + 截图文字），不检查 AI 自己的解释，避免“没有要验证码”这类否定句误判
  const textToCheck = question.toLowerCase();

  for (const rule of FRAUD_PATTERNS) {
    if (rule.pattern.test(textToCheck) && result.risk !== "red") {
      result.risk = "red";
      result.risk_reason = (result.risk_reason || "") + "\n\n⚠️ 反诈规则检测：" + rule.reason;
      break;
    }
  }

  return result;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", service: "看懂啦 AI 分析服务" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { action, question, imageDescription, ocrText, ocrLines } = body as {
      action?: string;
      question?: string;
      imageDescription?: string;
      ocrText?: string;
      ocrLines?: OcrLine[];
    };

    if (action !== "analyze") {
      return new Response(JSON.stringify({ error: "unknown_action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "question_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await analyzeWithAgent(question, imageDescription || "", ocrText, ocrLines);

    const textToCheck = ocrText || "";
    const safeResult = applyFraudRules(result, question + " " + textToCheck);

    return new Response(JSON.stringify({ result: safeResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    const stack = err instanceof Error ? err.stack : "";

    console.error("Analysis error:", message, stack);

    return new Response(
      JSON.stringify({
        error: "analysis_failed",
        message: "AI分析暂时不可用，请稍后再试或让家人帮忙看看。",
        detail: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

Deno.serve(handler);