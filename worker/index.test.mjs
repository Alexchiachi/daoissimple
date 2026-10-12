import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.mjs";

const ORIGIN = "https://alexchiachi.github.io";
let ipSeq = 0;

function req(path, body, { origin = ORIGIN, method = "POST" } = {}) {
  return new Request("https://w.example" + path, {
    method,
    headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": `10.0.0.${++ipSeq}` },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function makeKV() {
  const m = new Map();
  return { m, put: async (k, v) => void m.set(k, v) };
}

function mockFetch(handlers) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    for (const [needle, fn] of Object.entries(handlers)) if (String(url).includes(needle)) return fn(url, init);
    throw new Error("unexpected fetch " + url);
  };
  return calls;
}
const ok = (data) => new Response(JSON.stringify(data), { status: 200 });

test("拒絕非允許來源與非 POST", async () => {
  const r1 = await worker.fetch(req("/chat", { prompt: "hi" }, { origin: "https://evil.example" }), {});
  assert.equal(r1.status, 403);
  const r2 = await worker.fetch(new Request("https://w.example/chat", { method: "GET", headers: { Origin: ORIGIN } }), {});
  assert.equal(r2.status, 405);
  const r3 = await worker.fetch(new Request("https://w.example/chat", { method: "OPTIONS", headers: { Origin: ORIGIN } }), {});
  assert.equal(r3.status, 204);
  assert.equal(r3.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("chat：金鑰走 header 不進 URL，歷史與語系組裝正確", async () => {
  const calls = mockFetch({ generativelanguage: () => ok({ candidates: [{ content: { parts: [{ text: " 山中有茶 " }] } }] }) });
  const res = await worker.fetch(
    req("/chat", {
      prompt: "大腦過載怎麼辦",
      lang: "zh-cn",
      articleTitles: ["烤歐包時看金融週期"],
      history: [{ role: "model", text: "開頭是 model 應被丟掉" }, { role: "user", text: "你好" }, { role: "model", text: "客人好" }],
    }),
    { GEMINI_API_KEY: "SECRET-KEY" },
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { reply: "山中有茶" });
  const c = calls[0];
  assert.ok(!c.url.includes("SECRET-KEY"), "金鑰不可出現在 URL");
  assert.equal(c.init.headers["x-goog-api-key"], "SECRET-KEY");
  const sent = JSON.parse(c.init.body);
  assert.equal(sent.contents.length, 3);
  assert.equal(sent.contents[0].role, "user");
  assert.equal(sent.contents.at(-1).parts[0].text, "大腦過載怎麼辦");
  assert.match(sent.system_instruction.parts[0].text, /简体中文/);
  assert.match(sent.system_instruction.parts[0].text, /¥15,000/);
  assert.match(sent.system_instruction.parts[0].text, /烤歐包時看金融週期/);
});

test("chat：上游 429 回 429、未設金鑰回 503、空 prompt 回 400", async () => {
  mockFetch({ generativelanguage: () => new Response("{}", { status: 429 }) });
  assert.equal((await worker.fetch(req("/chat", { prompt: "hi" }), { GEMINI_API_KEY: "k" })).status, 429);
  assert.equal((await worker.fetch(req("/chat", { prompt: "hi" }), {})).status, 503);
  assert.equal((await worker.fetch(req("/chat", { prompt: "  " }), { GEMINI_API_KEY: "k" })).status, 400);
});

test("booking mirror：寫入 KV、寄信、回傳伺服端通關碼，內容有跳脫", async () => {
  const kv = makeKV();
  const calls = mockFetch({ "api.resend.com": () => ok({ id: "1" }) });
  const res = await worker.fetch(
    req("/booking", { type: "mirror", lang: "zh-tw", intent: "生命回憶錄 大傾聽\r\nBcc: x@y", q1: "<script>alert(1)</script>", q2: "失眠", q3: "準備好了" }),
    { BOOKINGS: kv, RESEND_API_KEY: "rk", NOTIFY_EMAIL: "dadaoissimple@gmail.com" },
  );
  assert.equal(res.status, 200);
  const { ok: success, code } = await res.json();
  assert.ok(success);
  assert.match(code, /^DAO-\d{6}$/);
  assert.ok(kv.m.has(code));
  const mail = JSON.parse(calls[0].init.body);
  assert.deepEqual(mail.to, ["dadaoissimple@gmail.com"]);
  assert.ok(!/[\r\n]/.test(mail.subject), "主旨不可含換行");
  assert.ok(mail.subject.includes(code));
  assert.ok(!mail.html.includes("<script>"), "HTML 必須跳脫");
  assert.equal(calls[0].init.headers.Authorization, "Bearer rk");
});

test("booking petal：欄位驗證與寄信", async () => {
  mockFetch({ "api.resend.com": () => ok({}) });
  const env = { RESEND_API_KEY: "rk", NOTIFY_EMAIL: "a@b.c" };
  const bad = await worker.fetch(req("/booking", { type: "petal", petalTitle: "雲南的香氣" }), env);
  assert.equal(bad.status, 400);
  const good = await worker.fetch(req("/booking", { type: "petal", petalTitle: "雲南的香氣", name: "林小姐", contact: "line:abc" }), env);
  assert.equal(good.status, 200);
});

test("booking：問道之鏡缺答案回 400、類型錯誤回 400", async () => {
  const env = { BOOKINGS: makeKV() };
  assert.equal((await worker.fetch(req("/booking", { type: "mirror", q1: "a", q2: "", q3: "c" }), env)).status, 400);
  assert.equal((await worker.fetch(req("/booking", { type: "x" }), env)).status, 400);
});

test("booking：KV 與寄信都失敗時回 502，前端才會走手動備援", async () => {
  mockFetch({ "api.resend.com": () => new Response("{}", { status: 500 }) });
  const res = await worker.fetch(
    req("/booking", { type: "mirror", q1: "a", q2: "b", q3: "c" }),
    { RESEND_API_KEY: "rk", NOTIFY_EMAIL: "a@b.c" },
  );
  assert.equal(res.status, 502);
  assert.equal((await worker.fetch(req("/booking", { type: "mirror", q1: "a", q2: "b", q3: "c" }), {})).status, 502);
});

test("booking：蜜罐命中不儲存不寄信", async () => {
  const kv = makeKV();
  const calls = mockFetch({});
  const res = await worker.fetch(req("/booking", { type: "mirror", website: "http://spam", q1: "a", q2: "b", q3: "c" }), { BOOKINGS: kv });
  assert.equal(res.status, 200);
  assert.equal(kv.m.size, 0);
  assert.equal(calls.length, 0);
});

test("限流：同一 IP 預約超過 5 次回 429", async () => {
  const kv = makeKV();
  const mk = () => new Request("https://w.example/booking", {
    method: "POST",
    headers: { Origin: ORIGIN, "CF-Connecting-IP": "9.9.9.9" },
    body: JSON.stringify({ type: "mirror", q1: "a", q2: "b", q3: "c" }),
  });
  const statuses = [];
  for (let i = 0; i < 7; i++) statuses.push((await worker.fetch(mk(), { BOOKINGS: kv })).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429, 429]);
});
