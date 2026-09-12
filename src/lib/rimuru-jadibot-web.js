import http from "http";
import path from "path";
import fs from "fs";
import { WebSocketServer } from "ws";
const logger = {
  info: (...a) => console.log("[WEB]", ...a),
  success: (...a) => console.log("[WEB OK]", ...a),
  warn: (...a) => console.warn("[WEB WARN]", ...a),
  error: (...a) => console.error("[WEB ERR]", ...a),
};

const JADIBOT_AUTH_FOLDER = path.join(process.cwd(), "session", "jadibot");
const WEB_PORT = parseInt(process.env.WEB_PORT || process.env.PORT || process.env.SERVER_PORT || "24596", 10);
const WEB_API_KEY = process.env.WEB_API_KEY || "";

let httpServer = null;
let wss = null;
let mainSockRef = null;
const wsClients = new Set();

const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60_000;
function isRateLimited(key) {
  const last = rateLimitMap.get(key) || 0;
  if (Date.now() - last < RATE_LIMIT_MS) return true;
  rateLimitMap.set(key, Date.now());
  return false;
}
function getJadibotAuthPath(jid) {
  const id = jid.replace(/@.+/g, "");
  return path.join(JADIBOT_AUTH_FOLDER, id);
}
function isSocketAlive(sock) {
  try {
    if (!sock) return false;
    if (sock.ws && sock.ws.readyState === 1) return true;
    if (sock.user?.id) return true;
    return false;
  } catch { return false; }
}
function sanitizePhone(phone) {
  if (!phone) return null;
  let clean = String(phone).replace(/[^0-9]/g, "");
  if (clean.length < 8 || clean.length > 15) return null;
  return clean;
}
let _jadibotSessionsCache = null;
async function loadSessionsCache() {
  if (_jadibotSessionsCache) return _jadibotSessionsCache;
  try {
    const m = await import("./rimuru-jadibot-manager.js");
    _jadibotSessionsCache = m.jadibotSessions;
    return _jadibotSessionsCache;
  } catch { return null; }
}
function getStats() {
  const total = fs.existsSync(JADIBOT_AUTH_FOLDER) ? fs.readdirSync(JADIBOT_AUTH_FOLDER).filter(d => fs.existsSync(path.join(JADIBOT_AUTH_FOLDER, d, "creds.json"))).length : 0;
  let active = 0;
  try {
    if (_jadibotSessionsCache) active = _jadibotSessionsCache.size;
  } catch {}
  return { total, active, inactive: total - active };
}
function sendToClient(ws, event, data) {
  if (ws.readyState !== 1) return;
  try { ws.send(JSON.stringify({ event, data })); } catch {}
}
function broadcast(event, data) {
  for (const c of wsClients) sendToClient(c, event, data);
}

// Adapter para que createJadibotViaWeb pueda emitir igual que con socket.io
function wrapWs(ws) {
  return {
    emit: (event, data) => sendToClient(ws, event, data),
    on: () => {}
  };
}

async function createJadibotViaWeb(phone, ws) {
  const { jadibotSessions } = await import("./rimuru-jadibot-manager.js");
  const { addJadibotOwner } = await import("./rimuru-jadibot-database.js");
  const { delay, useMultiFileAuthState } = await import("ourin");
  const client = wrapWs(ws);
  const id = sanitizePhone(phone);
  if (!id) throw new Error("Número inválido. Usa formato internacional sin + ni espacios (ej: 5491123456789)");
  if (jadibotSessions.has(id)) throw new Error("Este número ya tiene una sesión activa como subbot");

  const userJid = id + "@s.whatsapp.net";
  const authPath = getJadibotAuthPath(userJid);
  try {
    const baseJadibot = path.join(process.cwd(), "session", "jadibot");
    if (!fs.existsSync(baseJadibot)) fs.mkdirSync(baseJadibot, { recursive: true });
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });
    // verifica que se creó
    if (!fs.existsSync(authPath)) throw new Error(`No se pudo crear ${authPath} (permisos)`);
  } catch (e) {
    throw new Error(`Error creando sesión: ${e.message} — ejecuta "mkdir -p session/jadibot" en la consola`);
  }
  let state, saveCreds;
  try {
    const auth = await useMultiFileAuthState(authPath);
    state = auth.state; saveCreds = auth.saveCreds;
  } catch (e) {
    if (e.code === 'ENOENT' || e.message.includes('ENOENT')) {
      // reintenta creando dir y reintentando
      try { fs.mkdirSync(authPath, { recursive: true }); } catch {}
      const auth = await useMultiFileAuthState(authPath);
      state = auth.state; saveCreds = auth.saveCreds;
    } else throw e;
  }
  const { default: makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = await import("ourin");
  const { version } = await fetchLatestBaileysVersion();
  let pinoLogger;
  try {
    const pinoMod = await import("pino");
    pinoLogger = pinoMod.default({ level: "silent" });
  } catch {
    pinoLogger = { level: "silent", child: () => pinoLogger, info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, trace: () => {} };
  }

  const childStore = {
    messages: new Map(),
    chats: new Map(),
    contacts: {},
    bind(ev) {
      ev.on("messages.upsert", ({ messages }) => {
        for (const msg of messages || []) {
          const jid = msg.key?.remoteJid;
          if (!jid) continue;
          if (!this.messages.has(jid)) this.messages.set(jid, new Map());
          const chat = this.messages.get(jid);
          if (msg.key?.id) {
            chat.set(msg.key.id, msg);
            if (chat.size > 200) {
              const keys = [...chat.keys()];
              for (let i = 0; i < keys.length - 150; i++) chat.delete(keys[i]);
            }
          }
        }
      });
    },
    async loadMessage(jid, id) { return this.messages.get(jid)?.get(id) || undefined; },
  };

  const childSock = makeWASocket({
    version,
    logger: pinoLogger,
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pinoLogger) },
    browser: ["Ubuntu", "Chrome", "20.0.044"],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: true,
    getMessage: async (key) => (await childStore.loadMessage(key.remoteJid, key.id))?.message,
    shouldSyncHistoryMessage: () => false,
  });

  childStore.bind(childSock.ev);
  const { extendSocket } = await import("./rimuru-socket.js");
  await extendSocket(childSock);

  let heartbeat = null;
  childSock.ev.on("creds.update", saveCreds);

  childSock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      logger.success("WEB-JADIBOT", `Subbot conectado: ${id}`);
      jadibotSessions.set(id, {
        sock: childSock,
        jid: childSock.user?.id || userJid,
        startedAt: Date.now(),
        ownerJid: userJid,
        status: "connected",
        connectionReady: true,
        source: "web",
      });
      addJadibotOwner(id, userJid);
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = setInterval(() => { if (!isSocketAlive(childSock)) clearInterval(heartbeat); }, 30000);
      const sess = jadibotSessions.get(id);
      if (sess) sess.heartbeatInterval = heartbeat;
      try { await childSock.sendPresenceUpdate("available"); } catch {}

      client.emit("paired", { phone: id, jid: userJid, status: "connected", message: "¡Subbot conectado con éxito! 🌸" });
      broadcast("subbot-connected", { phone: id, jid: userJid });
      broadcast("stats-update", getStats());
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const msg = lastDisconnect?.error?.message || "Desconectado";
      logger.warn("WEB-JADIBOT", `Cierre ${id} code=${code} ${msg}`);
      const sess = jadibotSessions.get(id);
      if (sess?.heartbeatInterval) clearInterval(sess.heartbeatInterval);
      const fatalCodes = [401, 403, 405, 440];
      if (fatalCodes.includes(code)) {
        jadibotSessions.delete(id);
        try { if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true }); } catch {}
        client.emit("error", { message: `Sesión cerrada: ${msg} (code ${code})`, fatal: true });
      } else {
        if (!jadibotSessions.has(id)) {
          client.emit("error", { message: `Conexión cerrada: ${msg}`, code });
        }
      }
      broadcast("stats-update", getStats());
    }
  });

  childSock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" && type !== "append") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key?.remoteJid === "status@broadcast") continue;
      try {
        const { messageHandler } = await import("../handler.js");
        await messageHandler(msg, childSock, { isJadibot: true, jadibotId: id });
      } catch (e) {
        if (e.message?.includes("Connection Closed")) break;
        logger.error("WEB-JADIBOT", `Handler error ${id}: ${e.message}`);
      }
    }
  });

  if (!state.creds.registered) {
    try {
      client.emit("status", { step: "generating", message: "Generando código de vinculación... (HidenCloud puede tardar 5s) 🌸" });
      // Esperar a que el socket hijo esté listo (evita "Se produjo un error" por socket no conectado)
      let readyWait = 0;
      while (readyWait < 4000 && (!childSock.ws || childSock.ws.readyState !== 1)) {
        await delay(500);
        readyWait += 500;
      }
      await delay(800);
      let code = await childSock.requestPairingCode(id);
      code = code.match(/.{1,4}/g)?.join("-") || code;
      logger.success("WEB-JADIBOT", `Pairing code para ${id}: ${code} (válido 60s, ingrésalo rápido 🌸)`);
      client.emit("pairing-code", { code, phone: id, formatted: code, raw: code.replace(/-/g, "") });
      client.emit("status", { step: "waiting", message: "Código generado. Ingresa RÁPIDO en WhatsApp > Dispositivos vinculados > Vincular con número de teléfono (tienes 60s) 🌸", code });
      setTimeout(() => {
        if (!jadibotSessions.has(id)) {
          logger.warn("WEB-JADIBOT", `Timeout pairing ${id} - código expiró, cerrando socket`);
          try { childSock.ws?.close(); } catch {}
          client.emit("error", { message: "Tiempo agotado (60s). Genera un nuevo código y pégalo en <15s." });
        }
      }, 95000);
    } catch (e) {
      let msg = e.message || "Error al generar código";
      if (msg.includes("428") || msg.includes("rate")) msg = "Límite de solicitudes alcanzado. Espera 5-10 minutos.";
      else if (msg.includes("403") || msg.includes("banned")) msg = "Número posiblemente baneado por WhatsApp.";
      else if (msg.includes("401")) msg = "Número no registrado en WhatsApp.";
      logger.error("WEB-JADIBOT", `Pairing fail ${id}: ${e.message}`);
      client.emit("error", { message: msg });
      try { childSock.ws?.close(); } catch {}
      throw new Error(msg);
    }
  } else {
    client.emit("status", { step: "reconnecting", message: "Sesión existente, reconectando..." });
    jadibotSessions.set(id, { sock: childSock, jid: userJid, startedAt: Date.now(), ownerJid: userJid, status: "connecting", source: "web" });
  }
  return { id, jid: userJid, sock: childSock };
}

// --- HTTP Helpers ---
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization");
}
function sendJson(res, status, obj) {
  setCors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}
function getMime(ext) {
  const m = { ".html":"text/html", ".js":"application/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".ico":"image/x-icon" };
  return m[ext] || "application/octet-stream";
}

export function startWebServer(mainSock = null) {
  if (httpServer) {
    logger.warn("WEB", "Servidor web ya está activo");
    return { server: httpServer, wss };
  }
  if (mainSock) mainSockRef = mainSock;

  const publicPath = path.join(process.cwd(), "public");

  const server = http.createServer(async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // API routes
    if (pathname === "/api/health") {
      return sendJson(res, 200, { success: true, bot: mainSockRef?.user?.id || "offline", stats: getStats(), uptime: process.uptime() });
    }
    if (pathname === "/api/stats") {
      return sendJson(res, 200, { success: true, ...getStats() });
    }
    if (pathname === "/api/subbots" && req.method === "GET") {
      const sessions = [];
      if (fs.existsSync(JADIBOT_AUTH_FOLDER)) {
        const dirs = fs.readdirSync(JADIBOT_AUTH_FOLDER);
        for (const dir of dirs) {
          const credsPath = path.join(JADIBOT_AUTH_FOLDER, dir, "creds.json");
          if (fs.existsSync(credsPath)) {
            const isActive = _jadibotSessionsCache ? _jadibotSessionsCache.has(dir) : false;
            let creds = {};
            try { creds = JSON.parse(fs.readFileSync(credsPath, "utf8")); } catch {}
            sessions.push({ id: dir, jid: dir + "@s.whatsapp.net", isActive, registered: !!creds.registered });
          }
        }
      }
      return sendJson(res, 200, { success: true, count: sessions.length, subbots: sessions, stats: getStats() });
    }
    if (pathname === "/api/pairing" && req.method === "POST") {
      if (WEB_API_KEY) {
        const key = req.headers["x-api-key"] || url.searchParams.get("api_key");
        if (key !== WEB_API_KEY) return sendJson(res, 401, { success: false, error: "API key inválida" });
      }
      let body = "";
      req.on("data", c => body += c);
      req.on("end", async () => {
        try {
          const { phone } = JSON.parse(body || "{}");
          const clean = sanitizePhone(phone);
          const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
          if (isRateLimited(ip + "_rest")) return sendJson(res, 429, { success: false, error: "Espera 60s antes de reintentar" });
          if (!clean) return sendJson(res, 400, { success: false, error: "Número inválido" });
          if (isRateLimited(clean)) return sendJson(res, 429, { success: false, error: "Este número debe esperar 60s" });
          const sessCache = _jadibotSessionsCache;
          if (sessCache && sessCache.has(clean)) return sendJson(res, 409, { success: false, error: "Este número ya está activo" });
          // dummy ws to capture — espera directa (createJadibotViaWeb ya hace el delay + request)
          let captured = null;
          let errCap = null;
          const mock = { send: (s) => { try{ const p=JSON.parse(s); if(p.event==="pairing-code") captured=p.data; if(p.event==="error") errCap=p.data;}catch{}} , readyState:1 };
          try {
            await createJadibotViaWeb(clean, mock);
            if (captured) return sendJson(res, 200, { success: true, ...captured });
            else return sendJson(res, 200, { success: true, message: "Código en proceso, revisa el log del bot", phone: clean });
          } catch (e) {
            return sendJson(res, 500, { success: false, error: errCap?.message || e.message });
          }
        } catch (e) { return sendJson(res, 400, { success: false, error: "JSON inválido" }); }
      });
      return;
    }
    if (pathname === "/api/subbots/stop" && req.method === "POST") {
      if (WEB_API_KEY) {
        const key = req.headers["x-api-key"] || url.searchParams.get("api_key");
        if (key !== WEB_API_KEY) return sendJson(res, 401, { success: false, error: "API key inválida" });
      }
      let body = "";
      req.on("data", c => body += c);
      req.on("end", () => {
        try {
          const { phone, jid, deleteSession } = JSON.parse(body || "{}");
          const id = sanitizePhone(phone || jid);
          if (!id) return sendJson(res, 400, { success: false, error: "phone/jid requerido" });
          const cache = _jadibotSessionsCache;
          const sess = cache ? cache.get(id) : null;
          if (sess?.heartbeatInterval) clearInterval(sess.heartbeatInterval);
          if (sess && cache) { try { sess.sock.ws?.close(); } catch {} cache.delete(id); }
          if (deleteSession) {
            const p = getJadibotAuthPath(id + "@s.whatsapp.net");
            if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
          }
          broadcast("subbot-stopped", { phone: id });
          broadcast("stats-update", getStats());
          return sendJson(res, 200, { success: true, message: `Subbot ${id} detenido` + (deleteSession ? " y eliminado" : "") });
        } catch { return sendJson(res, 400, { success: false, error: "JSON inválido" }); }
      });
      return;
    }

    // Static file serving
    let filePath = path.join(publicPath, pathname === "/" ? "index.html" : pathname);
    // prevent directory traversal
    if (!filePath.startsWith(publicPath)) { res.writeHead(403); return res.end("Forbidden"); }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": getMime(ext) });
      return fs.createReadStream(filePath).pipe(res);
    }
    // fallback to index.html for SPA
    const index = path.join(publicPath, "index.html");
    if (fs.existsSync(index)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      return fs.createReadStream(index).pipe(res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Frontend no encontrado. Crea public/index.html" }));
  });

  // WebSocket — perMessageDeflate desactivado para compatibilidad con proxies de HidenCloud/Cloudflare
  wss = new WebSocketServer({ server, path: "/ws", perMessageDeflate: false, maxPayload: 1024 * 1024 });
  // also accept /socket.io path for legacy frontend fallback (optional)
  const wss2 = new WebSocketServer({ server, path: "/socket.io", perMessageDeflate: false });

  function handleWs(ws, req) {
    wsClients.add(ws);
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('error', (e) => { logger.warn("WEB-SOCKET", `WS error: ${e.message}`); });
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.connection?.remoteAddress || "unknown";
    logger.info("WEB-SOCKET", `Cliente conectado: ${ip} total=${wsClients.size}`);
    try {
      sendToClient(ws, "stats-update", getStats());
      sendToClient(ws, "welcome", { message: "Conectado a Waguri Assistant 🌸", bot: mainSockRef?.user?.id || null });
      if (fs.existsSync(JADIBOT_AUTH_FOLDER)) {
        const list = fs.readdirSync(JADIBOT_AUTH_FOLDER).filter(d => fs.existsSync(path.join(JADIBOT_AUTH_FOLDER, d, "creds.json"))).map(d => ({ id: d, isActive: _jadibotSessionsCache ? _jadibotSessionsCache.has(d) : false }));
        sendToClient(ws, "subbots-list", list);
      }
    } catch (e) { logger.warn("WEB-SOCKET", `Error envío inicial: ${e.message}`); }

    ws.on("message", async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      const { event, data } = msg;
      if (event === "request-pairing") {
        const phone = data?.phone;
        const clean = sanitizePhone(phone);
        if (!clean) return sendToClient(ws, "error", { message: "Número inválido. Usa formato internacional (ej: 5491123456789)" });
        if (isRateLimited(ip)) return sendToClient(ws, "error", { message: "Espera 60s antes de reintentar (rate limit IP)" });
        if (isRateLimited(clean)) return sendToClient(ws, "error", { message: "Este número debe esperar 60s" });
        try {
          sendToClient(ws, "status", { step: "init", message: `Iniciando vinculación para +${clean}...` });
          await createJadibotViaWeb(clean, ws);
        } catch {}
      } else if (event === "get-stats") {
        sendToClient(ws, "stats-update", getStats());
      } else if (event === "get-subbots") {
        const list = [];
        if (fs.existsSync(JADIBOT_AUTH_FOLDER)) {
          for (const dir of fs.readdirSync(JADIBOT_AUTH_FOLDER)) {
            if (fs.existsSync(path.join(JADIBOT_AUTH_FOLDER, dir, "creds.json"))) list.push({ id: dir, isActive: _jadibotSessionsCache ? _jadibotSessionsCache.has(dir) : false });
          }
        }
        sendToClient(ws, "subbots-list", list);
      }
    });
    ws.on("close", () => {
      wsClients.delete(ws);
      logger.info("WEB-SOCKET", `Cliente desconectado total=${wsClients.size}`);
    });
  }

  wss.on("connection", handleWs);
  wss2.on("connection", handleWs);

  // Heartbeat para proxies que cierran WS inactivas (HidenCloud/Cloudflare)
  const heartbeatInterval = setInterval(() => {
    for (const c of wsClients) {
      if (c.isAlive === false) { try { c.terminate(); } catch {} wsClients.delete(c); continue; }
      c.isAlive = false;
      try { c.ping(); } catch {}
    }
  }, 25000);
  if (heartbeatInterval.unref) heartbeatInterval.unref();

  httpServer = server;
  server.listen(WEB_PORT, "0.0.0.0", () => {
    logger.success("WEB", `Panel Waguri activo en http://0.0.0.0:${WEB_PORT} 🌸`);
    logger.info("WEB", `API: http://0.0.0.0:${WEB_PORT}/api/health | WebSocket ws://0.0.0.0:${WEB_PORT}/ws listo`);
    // --- URL pública de HidenCloud para probar la web de SubBots ---
    const publicUrl = process.env.PUBLIC_URL || process.env.SERVER_URL || process.env.EXTERNAL_URL || process.env.WEB_PUBLIC_URL || "";
    const serverId = process.env.SERVER_ID || process.env.PTERODACTYL_UUID || process.env.HOSTNAME || "";
    if (publicUrl) {
      logger.success("WEB", `🌐 URL pública HidenCloud: ${publicUrl} 🌸`);
      logger.info("WEB", `🔗 Prueba tu panel SubBots en: ${publicUrl} | WS: ${publicUrl.replace(/^http/, "ws")}/ws`);
    } else {
      // Fallback explicativo para HidenCloud Free Panel
      logger.success("WEB", `🌐 Panel listo — pruébalo en HidenCloud 🌸`);
      logger.info("WEB", `👉 En HidenCloud ve a tu servidor → "Network" / "Ports" → abre el link del puerto ${WEB_PORT}`);
      logger.info("WEB", `👉 O usa: https://freepanel.hidencloud.com/server/${serverId || "TU_ID"} → puerto ${WEB_PORT} → http://0.0.0.0:${WEB_PORT}`);
      logger.info("WEB", `💡 Tip: configura PUBLIC_URL en Variables (ej: https://tu-dominio.hidencloud.com) para ver la URL real aquí`);
    }
    if (WEB_API_KEY) logger.warn("WEB", `API protegida con WEB_API_KEY`);
    if (!fs.existsSync(publicPath)) logger.warn("WEB", `Carpeta public no encontrada en ${publicPath}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") logger.error("WEB", `Puerto ${WEB_PORT} en uso. Cambia con WEB_PORT=3001`);
    else logger.error("WEB", err.message);
  });

  return { server, wss };
}

export function getWebIO() { return { broadcast, sendToClient }; }
export function getWebServer() { return httpServer; }
export function setMainSock(sock) { mainSockRef = sock; }
