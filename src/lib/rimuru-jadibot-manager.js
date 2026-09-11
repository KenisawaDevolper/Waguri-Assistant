import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { saluranCtx } from "./rimuru-context.js";
import {
  delay,
  DisconnectReason,
  jidNormalizedUser,
  useMultiFileAuthState,
} from "ourin";
import { logger } from "./rimuru-logger.js";
import { addJadibotOwner } from "./rimuru-jadibot-database.js";
import { extendSocket } from "./rimuru-socket.js";
import { getAssetBuffer } from "./rimuru-asset-manager.js";
const JADIBOT_AUTH_FOLDER = path.join(process.cwd(), "session", "jadibot");
const jadibotSessions = new Map();
const reconnectAttempts = new Map();
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 5000;

if (!fs.existsSync(JADIBOT_AUTH_FOLDER)) {
  fs.mkdirSync(JADIBOT_AUTH_FOLDER, { recursive: true });
}

function getJadibotAuthPath(jid) {
  const id = jid.replace(/@.+/g, "");
  return path.join(JADIBOT_AUTH_FOLDER, id);
}

function isJadibotActive(jid) {
  const id = jid.replace(/@.+/g, "");
  return jadibotSessions.has(id);
}

function getActiveJadibots() {
  return Array.from(jadibotSessions.entries()).map(([id, data]) => ({
    id,
    jid: id + "@s.whatsapp.net",
    ...data,
  }));
}

function getAllJadibotSessions() {
  const sessions = [];
  if (!fs.existsSync(JADIBOT_AUTH_FOLDER)) return sessions;

  const dirs = fs.readdirSync(JADIBOT_AUTH_FOLDER);
  for (const dir of dirs) {
    const credsPath = path.join(JADIBOT_AUTH_FOLDER, dir, "creds.json");
    if (fs.existsSync(credsPath)) {
      sessions.push({
        id: dir,
        jid: dir + "@s.whatsapp.net",
        isActive: jadibotSessions.has(dir),
        credsPath,
      });
    }
  }
  return sessions;
}

function createJadibotStore() {
  return {
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
          if (!this.chats.has(jid)) {
            this.chats.set(jid, { id: jid });
          }
          if (msg.pushName && jid.endsWith("@s.whatsapp.net")) {
            this.contacts[jid] = {
              ...this.contacts[jid],
              notify: msg.pushName,
            };
          }
        }
      });
      ev.on("chats.upsert", (chats) => {
        for (const chat of chats || []) {
          if (chat.id) this.chats.set(chat.id, chat);
        }
      });
      ev.on("contacts.upsert", (contacts) => {
        for (const contact of contacts || []) {
          if (contact.id) {
            this.contacts[contact.id] = {
              ...this.contacts[contact.id],
              ...contact,
            };
          }
        }
      });
    },
    async loadMessage(jid, id) {
      return this.messages.get(jid)?.get(id) || undefined;
    },
  };
}

const rateLimit = new Map();

/**
 * Catálogo de códigos de error y estados de conexión para WhatsApp
 * Traducido al español para la gestión de excepciones en Waguri Assistant
 */

export const ERROR_MESSAGES = {
  401: {
    reason: "Número no registrado en WhatsApp",
    action: "Asegúrate de que este número esté activo en WhatsApp",
    fatal: true,
  },
  403: {
    reason: "Acceso denegado / baneado",
    action: "Este número podría estar suspendido por WhatsApp",
    fatal: true,
  },
  405: {
    reason: "Método no permitido",
    action: "Inténtalo de nuevo más tarde",
    fatal: true,
  },
  406: {
    reason: "Número limitado",
    action: "Este número ha sido limitado por WhatsApp, espera unas horas",
    fatal: true,
  },
  408: {
    reason: "Tiempo de espera agotado (Timeout)",
    action: "Conexión lenta, se intentará reconectar",
    fatal: false,
  },
  409: {
    reason: "Conflicto de sesión",
    action: "La sesión se está utilizando en otro dispositivo",
    fatal: true,
  },
  411: {
    reason: "Autenticación fallida",
    action: "Es necesario escanear el QR o reemparejar",
    fatal: true,
  },
  428: {
    reason: "Límite de peticiones excedido (Rate limit)",
    action: "Demasiadas solicitudes, espera unos minutos",
    fatal: true,
  },
  440: {
    reason: "Inicio de sesión requerido",
    action: "La sesión ha expirado, es necesario iniciar sesión de nuevo",
    fatal: true,
  },
  500: {
    reason: "Error en el servidor de WhatsApp",
    action: "El servidor de WhatsApp presenta problemas técnicos",
    fatal: false,
  },
  501: {
    reason: "No implementado",
    action: "Esta función aún no es compatible",
    fatal: true,
  },
  503: {
    reason: "Servicio no disponible",
    action: "WhatsApp se encuentra en mantenimiento",
    fatal: false,
  },
  515: {
    reason: "Error de flujo (Stream error)",
    action: "Se intentará reconectar automáticamente",
    fatal: false,
  },
};

/**
 * Función auxiliar para formatear y obtener los detalles del error en español
 * @param {number} code - Código de error devuelto por Baileys/WhatsApp
 * @returns {object} Objeto con la información detallada del error
 */
export function getErrorInfo(code) {
  const errorInfo = ERROR_MESSAGES[code] || {
    reason: "Error de conexión desconocido",
    action: "Revisa la consola de comandos para más detalles",
    fatal: false,
  };

  return {
    code: code || "UNKNOWN",
    ...errorInfo,
    formattedText: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖢𝖮𝖭𝖤𝖃𝖨𝖀́𝖭 [${code || '??'}] ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `      • Motivo :: *${errorInfo.reason}*\n` +
                   `      • Acción :: *${errorInfo.action}*\n` +
                   `      • Estado crítico :: *${errorInfo.fatal ? 'Sí (Fatal)' : 'No (Reintentando)'}*\n\n` +
                   `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  };
}


/**
 * Catálogo de razones de cierre de conexión para WhatsApp (Baileys)
 * Traducido al español para la gestión de excepciones en Waguri Assistant
 */

export const CONNECTION_CLOSED_REASONS = [
  {
    match: /Connection Closed/i,
    reason: "Conexión cerrada",
    action: "Posible número baneado o problemas de red",
    fatal: true,
  },
  {
    match: /write EOF/i,
    reason: "Conexión interrumpida",
    action: "Problema de red, se intentará reconectar",
    fatal: false,
  },
  {
    match: /ECONNRESET/i,
    reason: "Restablecimiento de conexión",
    action: "Red inestable",
    fatal: false,
  },
  {
    match: /ETIMEDOUT/i,
    reason: "Tiempo de espera agotado (Timeout)",
    action: "Conexión lenta",
    fatal: false,
  },
  {
    match: /logged out/i,
    reason: "Sesión cerrada (Logged out)",
    action: "La cuenta se cerró desde el dispositivo",
    fatal: true,
  },
  {
    match: /replaced/i,
    reason: "Sesión reemplazada",
    action: "Se inició sesión en otro dispositivo",
    fatal: true,
  },
  {
    match: /Multidevice mismatch/i,
    reason: "Sesión multidispositivo no válida",
    action: "Es necesario volver a escanear el QR",
    fatal: true,
  },
  {
    match: /restart required/i,
    reason: "Reinicio requerido",
    action: "Se reiniciará automáticamente",
    fatal: false,
  },
  {
    match: /bad session/i,
    reason: "Sesión dañada o corrupta",
    action: "Es necesario volver a escanear el QR",
    fatal: true,
  },
];

/**
 * Función auxiliar para detectar y formatear la razón de cierre basándose en el mensaje de error
 * @param {string | Error} error - Mensaje u objeto de error de Baileys/Socket
 * @returns {object} Objeto con la información detallada de la desconexión
 */
export function getCloseReasonInfo(error) {
  const errorMsg = typeof error === 'string' ? error : (error?.message || String(error));
  
  const found = CONNECTION_CLOSED_REASONS.find(item => item.match.test(errorMsg));
  
  const reasonInfo = found || {
    reason: "Desconexión desconocida",
    action: "Se intentará restablecer la conexión automáticamente",
    fatal: false,
  };

  return {
    ...reasonInfo,
    originalError: errorMsg,
    formattedText: `ꕥ 𝖢𝖮𝖭𝖤𝖃𝖨𝖀́𝖭 𝖢𝖤𝖱𝖱𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `      • Motivo :: *${reasonInfo.reason}*\n` +
                   `      • Acción :: *${reasonInfo.action}*\n` +
                   `      • Estado crítico :: *${reasonInfo.fatal ? 'Sí (Fatal)' : 'No (Reintentando)'}*\n\n` +
                   `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  };
}


/**
 * Analiza y parsea los errores de desconexión de Baileys / WhatsApp
 * Traducido al español y optimizado para Waguri Assistant
 * @param {object} lastDisconnect - Objeto lastDisconnect proporcionado por el evento de conexión
 * @returns {object} Objeto detallado con el código, motivo, acción recomendada, estado fatal y mensaje
 */
function parseDisconnectError(lastDisconnect) {
  const statusCode = lastDisconnect?.error?.output?.statusCode;
  const errorMessage = lastDisconnect?.error?.message || "Error desconocido";

  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return {
      ...ERROR_MESSAGES[statusCode],
      code: statusCode,
      message: errorMessage,
    };
  }

  for (const pattern of CONNECTION_CLOSED_REASONS) {
    if (pattern.match.test(errorMessage)) {
      return {
        code: statusCode || "N/A",
        reason: pattern.reason,
        action: pattern.action,
        fatal: pattern.fatal,
        message: errorMessage,
      };
    }
  }

  return {
    code: statusCode || "N/A",
    reason: "Error desconocido",
    action: "Contacta al administrador si el problema persiste",
    fatal: false,
    message: errorMessage,
  };
}


function isSocketAlive(sock) {
  try {
    if (!sock) return false;
    if (sock.ws && sock.ws.readyState === 1) return true;
    if (sock.user?.id) return true;
    return false;
  } catch {
    return false;
  }
}

async function safeSend(sock, jid, content, options = {}) {
  try {
    if (!jid) return null;
    if (!isSocketAlive(sock)) return null;
    return await sock.sendMessage(jid, content, options);
  } catch {
    return null;
  }
}

async function startJadibot(sock, m, userJid, usePairing = true) {
  if (
    !userJid ||
    typeof userJid !== "string" ||
    !userJid.includes("@s.whatsapp.net")
  ) {
    throw new Error("JID de usuario no válido");
  }

  const id = userJid.replace(/@.+/g, "");

  if (usePairing) {
    const lastAttempt = rateLimit.get(id) || 0;
    if (Date.now() - lastAttempt < 60000) {
      throw new Error("Espera 1 minuto antes de volver a intentarlo.");
    }
    rateLimit.set(id, Date.now());
  }

  const authPath = getJadibotAuthPath(userJid);

  if (jadibotSessions.has(id)) {
    throw new Error("¡La sesión Jadibot ya está activa para este número!");
  }

  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
  } = await import("ourin");
  const { version } = await fetchLatestBaileysVersion();
  const pinoModule = await import("pino");
  const pinoLogger = pinoModule.default({ level: "silent" });
  const childStore = createJadibotStore();
  const groupMetadataCache = new Map();

  const childSock = makeWASocket({
    version,
    logger: pinoLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
    },
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: true,
    defaultQueryTimeoutMs: 20000,
    connectTimeoutMs: 20000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 150,
    getMessage: async (key) => {
      return (await childStore.loadMessage(key.remoteJid, key.id))?.message;
    },
    cachedGroupMetadata: async (jid) => {
      const cached = groupMetadataCache.get(jid);
      if (cached) return cached;
      try {
        const fresh = await childSock.groupMetadata(jid);
        groupMetadataCache.set(jid, fresh);
        return fresh;
      } catch {
        return undefined;
      }
    },
    fireInitQueries: true,
    emitOwnEvents: true,
    shouldSyncHistoryMessage: () => false,
    transactionOpts: { maxCommitRetries: 5, delayBetweenTriesMs: 500 },
  });

  childStore.bind(childSock.ev);
  childSock.store = childStore;
  await extendSocket(childSock);

  let qrCount = 0;
  let lastQRMsg = null;
  let pairingCode = null;
  let heartbeatInterval = null;

  childSock.ev.on("creds.update", saveCreds);

  childSock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairing) {
      qrCount++;
      if (qrCount > 3) {
        await safeSend(sock, m?.chat, {
          text: `ꕥ 𝖢𝖮́𝖣𝖨𝖦𝖮 𝖰𝖱 𝖤𝖷𝖯𝖨𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El tiempo para escanear el código ha finalizado. Por favor, solicítalo de nuevo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        });
        if (lastQRMsg?.key) {
          await safeSend(sock, m?.chat, { delete: lastQRMsg.key });
        }
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);
        try {
          childSock.ws.close();
        } catch { }
        return;
      }

      try {
        const qrBuffer = await QRCode.toBuffer(qr, {
          scale: 8,
          margin: 4,
          width: 256,
          color: { dark: "#000000ff", light: "#ffffffff" },
        });

        if (lastQRMsg?.key) {
          await safeSend(sock, m?.chat, { delete: lastQRMsg.key });
        }

        if (!m?.chat) return;
        lastQRMsg = await sock.sendMessage(
          m.chat,
          {
            image: qrBuffer,
            caption:
              `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 • 𝖢𝖮́𝖣𝖨𝖦𝖮 𝖰𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      • Escanea este código para vincularte como Sub-Bot.\n` +
              `      • Expiración :: *20 segundos*\n` +
              `      • Intentos :: *${qrCount}/3*\n\n` +
              `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ve a WhatsApp > Dispositivos Vinculados > Vincular Dispositivo. »\n\n` +
              `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
          },
          { quoted: m },
        );
      } catch (e) {
        logger.error("Jadibot", "Failed to send QR: " + e.message);
      }
    }

    if (connection === "open") {
      logger.info("Jadibot", `Connected: ${id}`);

      reconnectAttempts.delete(id);

      jadibotSessions.set(id, {
        sock: childSock,
        jid: childSock.user?.jid || userJid,
        startedAt: Date.now(),
        ownerJid: m?.sender || userJid,
        status: "connected",
        connectionReady: true,
        pendingMessages: [],
      });

      heartbeatInterval = setInterval(() => {
        try {
          if (!isSocketAlive(childSock)) {
            clearInterval(heartbeatInterval);
          }
        } catch { }
      }, 30000);

      const session = jadibotSessions.get(id);
      if (session) {
        session.heartbeatInterval = heartbeatInterval;
      }

      childSock.sendPresenceUpdate("available").catch(() => { });

      addJadibotOwner(id, m?.sender || userJid);

      if (m?.chat) {
        sock
          .sendMessage(m.chat, {
            text:
              `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 𝖢𝖮𝖭𝖤𝖢𝖳𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      • Número :: *@${id}*\n` +
              `      • Estado :: *En línea (Activo)*\n` +
              `      • Inicio :: *${new Date().toLocaleTimeString("es-ES")}*\n\n` +
              `      𓈒 ◌ㅤ──    *ℹ️ 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮́𝖭*\n` +
              `      • ¡Tu Sub-Bot está activo y listo para procesar comandos!\n` +
              `      • Usa \`${m.prefix || "."}stopjadibot\` para detenerlo.\n\n` +
              `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            mentions: [userJid],
          })
          .catch((e) => {
            logger.error(
              "Jadibot",
              `Failed to send connected notification: ${e.message}`,
            );
          });
      }

      if (lastQRMsg?.key && m?.chat) {
        safeSend(sock, m.chat, { delete: lastQRMsg.key }).catch(() => { });
      }
    }

    if (connection === "close") {
      const errorInfo = parseDisconnectError(lastDisconnect);

      logger.info(
        "Jadibot",
        `Disconnected: ${id}, code: ${errorInfo.code}, reason: ${errorInfo.reason}`,
      );

      const session = jadibotSessions.get(id);
      if (session?.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }

      const attempts = reconnectAttempts.get(id) || 0;

      if (errorInfo.fatal || attempts >= MAX_RECONNECT_ATTEMPTS) {
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);

        if (errorInfo.fatal) {
          try {
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
            }
          } catch { }
        }

        let statusEmoji = "❌";
        if (errorInfo.code === 403 || errorInfo.reason?.toLowerCase().includes("baneado")) {
          statusEmoji = "🚫";
        } else if (
          errorInfo.code === 406 ||
          errorInfo.reason?.toLowerCase().includes("limitado")
        ) {
          statusEmoji = "⚠️";
        }

        await safeSend(sock, m?.chat, {
          text:
            `ꕥ 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 𝖣𝖤𝖲𝖢𝖮𝖭𝖤𝖢𝖳𝖠𝖣𝖮 ${statusEmoji} ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Número :: *@${id}*\n` +
            `      • Código :: \`${errorInfo.code}\`\n` +
            `      • Motivo :: *${errorInfo.reason}*\n` +
            `      • Acción :: _${errorInfo.action}_\n\n` +
            (errorInfo.fatal
              ? `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Sesión eliminada de la base de datos. Usa \`.jadibot\` para vincular de nuevo. »\n\n`
              : `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Conexión terminada temporalmente. »\n\n`) +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
          mentions: [userJid],
        });
      } else {
        reconnectAttempts.set(id, attempts + 1);

        await safeSend(sock, m?.chat, {
          text:
            `ꕥ 𝖱𝖤𝖢𝖮𝖭𝖤𝖢𝖳𝖠𝖭𝖣𝖮 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Número :: *@${id}*\n` +
            `      • Motivo :: *${errorInfo.reason}*\n` +
            `      • Intentos :: *${attempts + 1}/${MAX_RECONNECT_ATTEMPTS}*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Reconectando servidor en ${RECONNECT_INTERVAL / 1000} segundos... »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
          mentions: [userJid],
        });

        setTimeout(() => {
          startJadibot(sock, m, userJid, false).catch((e) => {
            logger.error("Jadibot", `Reconnect failed for ${id}: ${e.message}`);
            jadibotSessions.delete(id);
            reconnectAttempts.delete(id);
          });
        }, RECONNECT_INTERVAL);
      }
    }
  });

  const processedMessages = new Map();

  childSock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!childSock.user || !childSock.user.id) {
      childSock.user = {
        id: jidNormalizedUser(id),
        name: "Jadibot",
      };
    }

    if (type !== "notify" && type !== "append") return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const msgId = msg.key?.id;
      if (msgId && processedMessages.has(msgId)) continue;
      if (msgId) processedMessages.set(msgId, Date.now());

      if (msg.key && msg.key.remoteJid === "status@broadcast") continue;

      const msgTimestamp = msg.messageTimestamp
        ? Number(msg.messageTimestamp) * 1000
        : Date.now();
      const msgAge = Date.now() - msgTimestamp;
      if (msgAge > 60 * 60 * 1000) continue;

      const metadataKeys = [
        "senderKeyDistributionMessage",
        "messageContextInfo",
      ];
      const msgType =
        Object.keys(msg.message).find((k) => !metadataKeys.includes(k)) ||
        Object.keys(msg.message)[0];
      const ignoredTypes = [
        "protocolMessage",
        "senderKeyDistributionMessage",
        "reactionMessage",
        "stickerSyncRmrMessage",
        "encReactionMessage",
        "pollUpdateMessage",
        "pollCreationMessage",
        "pollCreationMessageV2",
        "pollCreationMessageV3",
        "keepInChatMessage",
        "deviceSentMessage",
        "call",
        "peerDataOperationRequestMessage",
      ];
      if (ignoredTypes.includes(msgType)) continue;

      if (!isSocketAlive(childSock)) continue;

      const session = jadibotSessions.get(id);
      if (session && !session.connectionReady) {
        session.pendingMessages = session.pendingMessages || [];
        session.pendingMessages.push(msg);
        continue;
      }

      try {
        const { messageHandler } = await import("../handler.js");
        await messageHandler(msg, childSock, {
          isJadibot: true,
          jadibotId: id,
        });
      } catch (e) {
        if (
          e.message?.includes("Connection Closed") ||
          e.message?.includes("428")
        ) {
          logger.info(
            "Jadibot",
            `${id} connection closed during handler, skipping`,
          );
          break;
        }
        logger.error("Jadibot", `Handler error for ${id}: ${e.message}`);
      }
    }

    const fiveMinAgo = Date.now() - 300000;
    for (const [key, time] of processedMessages) {
      if (time < fiveMinAgo) processedMessages.delete(key);
    }
  });

  if (usePairing && !state.creds?.registered) {
    try {
      await delay(3000);
      pairingCode = await childSock.requestPairingCode(id);
      pairingCode = pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode;

      if (m && m.chat) {
        let thumbnail = null;
        try {
          if (!!getAssetBuffer("rimuru2")) {
            thumbnail = getAssetBuffer("rimuru2");
          }
        } catch { }

        await sock.sendMessage(
          m.chat,
          {
            text:
              `ꕥ 𝖢𝖮́𝖣𝖨𝖦𝖮 𝖣𝖤 𝖵𝖨𝖭𝖢𝖴𝖫𝖠𝖢𝖨𝖮́𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      • Ve a WhatsApp > Dispositivos Vinculados > Vincular Dispositivo.\n` +
              `      • Selecciona "Vincular con el número de teléfono".\n\n` +
              `      \`\`\`${pairingCode}\`\`\`\n\n` +
              `      𓈒 ◌ㅤ──    *⚠️ 𝖠𝖣𝖵𝖤𝖱𝖳𝖤𝖭𝖢𝖨𝖠*\n` +
              `      • El código es válido por unos pocos minutos.\n` +
              `      • NO compartas este código con nadie.\n\n` +
              `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            contextInfo: saluranCtx(),
            interactiveButtons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "📋 Copiar Código de Emparejamiento",
                  copy_code: pairingCode.replace(/-/g, ""),
                }),
              },
            ],
          },
          { quoted: m },
        );
      } else {
        logger.info("Jadibot", `Pairing Code for ${id}: ${pairingCode}`);
      }
    } catch (e) {
      logger.error("Jadibot", "Failed to get pairing code: " + e.message);

      let errorMsg = "Error al intentar generar el código de emparejamiento";
      if (
        e.message?.includes("rate") ||
        e.message?.includes("limit") ||
        e.message?.includes("428")
      ) {
        errorMsg = "¡Límite de solicitudes alcanzado! Espera 5-10 minutos.";
      } else if (
        e.message?.includes("banned") ||
        e.message?.includes("blocked")
      ) {
        errorMsg = "El número podría estar baneado por WhatsApp.";
      } else if (
        e.message?.includes("Connection Closed") ||
        e.message?.includes("closed")
      ) {
        errorMsg = "La conexión se ha interrumpido. Inténtalo de nuevo.";
      }

      await safeSend(sock, m?.chat, {
        text: `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖩𝖠𝖣𝖨𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      • Motivo :: _${errorMsg}_\n\n` +
              `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
      });

      try {
        childSock.end?.();
      } catch { }
      jadibotSessions.delete(id);
      reconnectAttempts.delete(id);
      throw new Error(errorMsg);
    }
  }

  return { sock: childSock, pairingCode };
}


async function stopJadibot(jid, deleteSession = false) {
  const id = jid.replace(/@.+/g, "");
  const session = jadibotSessions.get(id);

  if (session) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws.close();
    } catch { }
    jadibotSessions.delete(id);
  }

  reconnectAttempts.delete(id);

  if (deleteSession) {
    const authPath = getJadibotAuthPath(jid);
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
    }
  }

  return true;
}

async function stopAllJadibots() {
  const stopped = [];
  for (const [id, session] of jadibotSessions) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws.close();
    } catch { }
    stopped.push(id);
  }
  jadibotSessions.clear();
  reconnectAttempts.clear();
  return stopped;
}

async function restartJadibotSession(sock, sessionId) {
  const userJid = sessionId + "@s.whatsapp.net";
  try {
    logger.info("Jadibot", `Restoring session: ${sessionId}`);

    const dbPath = path.join(JADIBOT_AUTH_FOLDER, sessionId, "data.json");
    let ownerJid = userJid;
    try {
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (data.owners?.[0]) ownerJid = data.owners[0] + "@s.whatsapp.net";
      }
    } catch { }

    const mockM = {
      chat: ownerJid,
      sender: ownerJid,
      prefix: ".",
      key: {
        remoteJid: ownerJid,
        fromMe: false,
        id: "restart-" + Date.now(),
      },
      reply: async (text) => {
        await safeSend(sock, ownerJid, { text });
      },
      react: async () => { },
    };
    await startJadibot(sock, mockM, userJid, false);
  } catch (e) {
    logger.error("Jadibot", `Failed to restore ${sessionId}: ${e.message}`);
  }
}

function getJadibotStatus(jid) {
  const id = jid.replace(/@.+/g, "");
  const session = jadibotSessions.get(id);
  if (!session) return null;

  return {
    id,
    jid: session.jid,
    status: session.status || "unknown",
    startedAt: session.startedAt,
    ownerJid: session.ownerJid,
    uptime: Date.now() - session.startedAt,
  };
}

export {
  JADIBOT_AUTH_FOLDER,
  jadibotSessions,
  getJadibotAuthPath,
  isJadibotActive,
  getActiveJadibots,
  getAllJadibotSessions,
  startJadibot,
  stopJadibot,
  stopAllJadibots,
  restartJadibotSession,
  getJadibotStatus,
  isSocketAlive,
  safeSend,
};
