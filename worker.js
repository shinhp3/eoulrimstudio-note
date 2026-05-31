const GITHUB_API = "https://api.github.com";
const DEFAULT_BRANCH = "main";
const NOTES_FILE = "notes.json";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors() },
  });
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToUtf8(b64) {
  const bin = atob(b64.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + token,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "eoulrimstudio-note-worker",
  };
}

async function githubJson(method, url, token, bodyObj) {
  const opts = {
    method,
    headers: {
      ...githubHeaders(token),
      ...(bodyObj !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  };
  if (bodyObj !== undefined) opts.body = JSON.stringify(bodyObj);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  if (!res.ok) {
    const e = new Error((data && data.message) || "HTTP " + res.status);
    e.status = res.status;
    throw e;
  }
  return data;
}

function requireEnv(env) {
  const token = env.GITHUB_TOKEN;
  const username = env.GITHUB_USERNAME;
  const repo = env.GITHUB_REPO;
  if (!token || !username || !repo) {
    const e = new Error("서버 환경변수(GITHUB_TOKEN, GITHUB_USERNAME, GITHUB_REPO)가 설정되지 않았습니다.");
    e.status = 500;
    throw e;
  }
  return { token, username, repo };
}

async function handleGet(env) {
  const { token, username, repo } = requireEnv(env);
  const url = `${GITHUB_API}/repos/${username}/${repo}/contents/${NOTES_FILE}?ref=${DEFAULT_BRANCH}`;
  try {
    const data = await githubJson("GET", url, token);
    const text = base64ToUtf8(data.content);
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8", ...cors() },
    });
  } catch (e) {
    if (e.status === 404) return json({});
    throw e;
  }
}

async function handlePut(request, env) {
  const { token, username, repo } = requireEnv(env);
  const body = await request.text();
  JSON.parse(body); // 유효성 검사

  const url = `${GITHUB_API}/repos/${username}/${repo}/contents/${NOTES_FILE}`;

  let sha;
  try {
    const existing = await githubJson("GET", url + `?ref=${DEFAULT_BRANCH}`, token);
    sha = existing.sha;
  } catch (e) {
    if (e.status !== 404) throw e;
  }

  const putBody = {
    message: "메모 업데이트",
    content: utf8ToBase64(body),
    branch: DEFAULT_BRANCH,
    ...(sha ? { sha } : {}),
  };
  await githubJson("PUT", url, token, putBody);
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }
    const path = new URL(request.url).pathname;
    try {
      if (path === "/api/notes" && request.method === "GET") return handleGet(env);
      if (path === "/api/notes" && request.method === "PUT") return handlePut(request, env);
      return json({ error: "Not found" }, 404);
    } catch (e) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 500;
      return json({ error: e.message || String(e) }, status);
    }
  },
};
