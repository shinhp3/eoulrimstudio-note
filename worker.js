// Cloudflare Worker - 메모장 API
// KV 네임스페이스 바인딩 이름: NOTES_KV

const TEAM_PASSWORD = "eoulrim2024"; // ← 원하는 비밀번호로 변경

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Password",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function checkAuth(request) {
  return request.headers.get("X-Password") === TEAM_PASSWORD;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (!checkAuth(request)) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // GET /api/notes - 전체 메모 목록
    if (request.method === "GET" && path === "/api/notes") {
      const list = await env.NOTES_KV.list();
      const notes = {};
      await Promise.all(
        list.keys.map(async ({ name }) => {
          const val = await env.NOTES_KV.get(name, "json");
          if (val) notes[name] = val;
        })
      );
      return json(notes);
    }

    // POST /api/notes - 메모 저장 (생성 or 수정)
    if (request.method === "POST" && path === "/api/notes") {
      const body = await request.json();
      const { id, title, content, author } = body;
      if (!id) return json({ error: "id required" }, 400);

      const existing = (await env.NOTES_KV.get(id, "json")) || {};
      const note = {
        ...existing,
        id,
        title: title ?? existing.title ?? "",
        content: content ?? existing.content ?? "",
        author: author ?? existing.author ?? "",
        updatedAt: Date.now(),
        createdAt: existing.createdAt ?? Date.now(),
      };
      await env.NOTES_KV.put(id, JSON.stringify(note));
      return json(note);
    }

    // DELETE /api/notes/:id - 메모 삭제
    const deleteMatch = path.match(/^\/api\/notes\/(.+)$/);
    if (request.method === "DELETE" && deleteMatch) {
      await env.NOTES_KV.delete(deleteMatch[1]);
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  },
};
