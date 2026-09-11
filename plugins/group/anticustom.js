import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "anticustom",
  alias: ["antiaddcustom", "customanti"],
  category: "group",
  description: "Crea reglas AntiCustom mediante una sesión interactiva paso a paso con la estética Waguri Assistant",
  usage: ".anticustom <on/off/list/add/del/metode/cancel>",
  example: ".anticustom",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

if (!global.anticustomSessions) global.anticustomSessions = new Map();

const SESSION_TIMEOUT = 10 * 60 * 1000;

function normalizeRules(rules) {
  return Array.isArray(rules)
    ? rules.filter((rule) => rule && rule.pattern)
    : [];
}

function formatRule(rule, index) {
  const type = rule.type === "regex" ? "regex" : "contains";
  const action = rule.action || "remove";
  const title = rule.groupName || rule.name || "-";
  return `      • *[${index + 1}] ${title}*\n        - Patrón :: \`${rule.pattern}\`\n        - Tipo :: ${type}\n        - Acción :: ${action}`;
}

function getSessionKey(m) {
  return `${m.chat}:${m.sender}`;
}

function clearSession(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (session?.timeout) clearTimeout(session.timeout);
  global.anticustomSessions.delete(sessionKey);
}

function refreshSessionTimeout(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return;
  if (session.timeout) clearTimeout(session.timeout);
  session.timeout = setTimeout(() => {
    const current = global.anticustomSessions.get(sessionKey);
    if (current?.startedAt === session.startedAt) {
      global.anticustomSessions.delete(sessionKey);
    }
  }, SESSION_TIMEOUT);
}

function normalizeAction(action, fallback = "remove") {
  const value = String(action || fallback).toLowerCase();
  if (["kick", "remove", "delete", "hapus"].includes(value)) {
    return value === "delete" || value === "hapus" ? "remove" : value;
  }
  return fallback;
}

function formatAction(action) {
  return action === "kick" ? "Expulsar miembro (kick)" : "Eliminar mensaje";
}

function parsePatternAnswer(text) {
  const raw = String(text || "").trim();
  if (!raw) return { error: "La respuesta está vacía." };

  if (/^regex\s*:/i.test(raw)) {
    const pattern = raw.replace(/^regex\s*:/i, "").trim();
    if (!pattern) return { error: "El patrón regex está vacío después de `regex:`." };
    try {
      new RegExp(pattern, "i");
    } catch {
      return { error: "Expresión regular no válida. Revisa la sintaxis." };
    }
    return {
      type: "regex",
      patterns: [pattern],
    };
  }

  const cleaned = raw.replace(/^contains\s*:/i, "").trim();
  const patterns = [
    ...new Set(
      cleaned
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  if (patterns.length === 0) {
    return { error: "No se detectaron palabras válidas." };
  }

  return {
    type: "contains",
    patterns,
  };
}

function buildSummary(session) {
  return (
    `      • Título :: *${session.title}*\n` +
    `      • Tipo de detección :: *${session.type}*\n` +
    `      • Patrones :: ${session.patterns.map((item) => `\`${item}\``).join(", ")}\n` +
    `      • Acción :: *${formatAction(session.action)}*`
  );
}

async function sendPrompt(sock, m, text) {
  const sent = await sock.sendMessage(m.chat, { text }, { quoted: m });
  return sent?.key?.id || null;
}

async function startWizard(m, sock, mode, isFirstSetup = false) {
  const sessionKey = getSessionKey(m);
  const existing = global.anticustomSessions.get(sessionKey);

  if (existing) {
    await m.reply(
      `ꕥ 𝖲𝖤𝖲𝖨𝖮𝖭 𝖠𝖢𝖳𝖨𝖵𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ya tienes una sesión de AntiCustom activa. Responde a la última pregunta o cancélala con \`${m.prefix}anticustom cancel\`. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  const session = {
    chat: m.chat,
    sender: m.sender,
    step: "title",
    title: "",
    type: "contains",
    patterns: [],
    action: normalizeAction(mode, "remove"),
    promptId: null,
    startedAt: Date.now(),
    timeout: null,
  };

  global.anticustomSessions.set(sessionKey, session);
  refreshSessionTimeout(sessionKey);

  const intro = isFirstSetup
    ? `ꕥ 𝖲𝖤𝖳𝖴𝖯 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `¡Bienvenido! Vamos a configurar el sistema AntiCustom paso a paso:\n` +
      `1. Definir título de la regla\n` +
      `2. Ingresar palabras o patrones\n` +
      `3. Elegir acción ante la coincidencia\n` +
      `4. Confirmar detalles\n\n`
    : `ꕥ 𝖭𝖴𝖤𝖵𝖠 𝖱𝖤𝖦𝖫𝖠 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;

  session.promptId = await sendPrompt(
    sock,
    m,
    intro +
      `      𓈒 ◌ㅤ──    *𝖯𝖱𝖤𝖦𝖴𝖭𝖳𝖠 1 / 4*\n` +
      `      • ¿Cuál es el título para esta regla?\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Responde a este mensaje con el título (ej: Anti Groserías). »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

function buildGuideMessage(m, status, mode, rules) {
  return (
    `ꕥ 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 𝖬𝖤𝖭𝖴 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
    `      • Estado :: ${status.toUpperCase()}\n` +
    `      • Modo por defecto :: ${normalizeAction(mode).toUpperCase()}\n` +
    `      • Reglas totales :: ${rules.length}\n\n` +
    `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖤 𝖴𝖲𝖮*\n` +
    `      • Crear regla :: \`${m.prefix}anticustom add\`\n` +
    `      • Activar / Desactivar :: \`${m.prefix}anticustom on\` / \`off\`\n` +
    `      • Ver reglas :: \`${m.prefix}anticustom list\`\n` +
    `      • Borrar regla :: \`${m.prefix}anticustom del <título>\`\n` +
    `      • Cambiar método :: \`${m.prefix}anticustom metode kick\`\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const rules = normalizeRules(groupData.anticustomRules);
  const mode = groupData.anticustomModo || "remove";
  const status = groupData.anticustom || "off";
  const sessionKey = getSessionKey(m);

  if (!sub) {
    if (rules.length === 0) {
      await startWizard(m, sock, mode, true);
      return;
    }

    await m.reply(buildGuideMessage(m, status, mode, rules));
    return;
  }

  if (sub === "add" || sub === "baru" || sub === "new" || sub === "buat") {
    await startWizard(m, sock, mode);
    return;
  }

  if (sub === "cancel" || sub === "batal") {
    if (!global.anticustomSessions.has(sessionKey)) {
      await m.reply(
        `ꕥ 𝖲𝖤𝖲𝖨𝖮𝖭 𝖭𝖮 𝖤𝖷𝖨𝖲𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No hay ninguna sesión de AntiCustom activa en este momento. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return;
    }
    clearSession(sessionKey);
    await m.reply(
      `ꕥ 𝖲𝖤𝖲𝖨𝖮𝖭 𝖢𝖠𝖭𝖢𝖤𝖫𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se ha cancelado la sesión actual de AntiCustom correctamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (sub === "on") {
    db.setGroup(m.chat, { anticustom: "on" });
    await m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiCustom se ha activado en este grupo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (sub === "off") {
    db.setGroup(m.chat, { anticustom: "off" });
    await m.reply(
      `ꕥ 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema AntiCustom se ha desactivado en este grupo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (sub === "metode") {
    const action = normalizeAction(args[1], "");
    if (!action) {
      await m.reply(
        `ꕥ 𝖬𝖤𝖳𝖮𝖣𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa: \`${m.prefix}anticustom metode kick\` o \`${m.prefix}anticustom metode remove\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return;
    }
    db.setGroup(m.chat, { anticustom: "on", anticustomModo: action });
    await m.reply(
      `ꕥ 𝖬𝖤𝖳𝖮𝖣𝖮 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El método por defecto de AntiCustom ahora es *${action.toUpperCase()}*. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (sub === "list") {
    if (rules.length === 0) {
      await m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖱𝖤𝖦𝖫𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aún no hay reglas AntiCustom registradas en este grupo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return;
    }
    await m.reply(
      `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖦𝖫𝖠𝖲 𝖠𝖢𝖳𝖨𝖵𝖠𝖲*\n` +
      `${rules.map(formatRule).join("\n\n")}\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  if (sub === "del" || sub === "delete" || sub === "remove") {
    const name = args.slice(1).join(" ").trim().toLowerCase();
    if (!name) {
      await m.reply(
        `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Especifica el título: \`${m.prefix}anticustom del <título>\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return;
    }

    const nextRules = rules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === name ||
        groupName === name ||
        ruleName.startsWith(`${name} #`)
      );
    });

    if (nextRules.length === rules.length) {
      await m.reply(
        `ꕥ 𝖱𝖤𝖦𝖫𝖠 𝖭𝖮 𝖧𝖠𝖫𝖫𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontró ninguna regla con el título \`${name}\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return;
    }

    db.setGroup(m.chat, { anticustomRules: nextRules });
    await m.reply(
      `ꕥ 𝖱𝖤𝖦𝖫𝖠 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La regla con el título \`${name}\` fue eliminada exitosamente. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return;
  }

  await m.reply(
    `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Subcomandos válidos: on, off, list, add, del, metode, cancel. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;
  if (m.isCommand) return false;

  const sessionKey = getSessionKey(m);
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return false;
  if (session.chat !== m.chat || session.sender !== m.sender) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId || quotedId !== session.promptId) return false;

  const text = String(m.body || "").trim();
  if (!text) return false;

  refreshSessionTimeout(sessionKey);

  if (session.step === "title") {
    if (text.length < 2 || text.length > 40) {
      await m.reply(
        `ꕥ 𝖳𝖨𝖳𝖴𝖫𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El título debe tener entre 2 y 40 caracteres. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return true;
    }

    session.title = text;
    session.step = "patterns";
    session.promptId = await sendPrompt(
      sock,
      m,
      `ꕥ 𝖲𝖤𝖳𝖴𝖯 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖯𝖱𝖤𝖦𝖴𝖭𝖳𝖠 2 / 4*\n` +
        `      • Título seleccionado :: *${session.title}*\n\n` +
        `Indica las palabras o patrones que deseas detectar:\n` +
        `> • *Contains*: separa por comas o saltos de línea (ej: \`malo, grosería\`)\n` +
        `> • *Regex*: antepone \`regex:\` (ej: \`regex: (mala|fea)\`)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Responde a este mensaje con tu selección. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return true;
  }

  if (session.step === "patterns") {
    const parsed = parsePatternAnswer(text);
    if (parsed.error) {
      await m.reply(
        `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖤𝖭 𝖯𝖠𝖳𝖱𝖮𝖭𝖤𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${parsed.error} »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return true;
    }

    session.type = parsed.type;
    session.patterns = parsed.patterns;
    session.step = "action";
    session.promptId = await sendPrompt(
      sock,
      m,
      `ꕥ 𝖲𝖤𝖳𝖴𝖯 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖯𝖱𝖤𝖦𝖴𝖭𝖳𝖠 3 / 4*\n` +
        `      • Tipo :: *${session.type}*\n` +
        `      • Patrones :: ${session.patterns.map((item, index) => `\n        [${index + 1}] \`${item}\``).join("")}\n\n` +
        `¿Qué acción se debe realizar si un miembro coincide?\n` +
        `> Responde con: \`hapus\` (eliminar mensaje) o \`kick\` (expulsar miembro).\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return true;
  }

  if (session.step === "action") {
    const action = normalizeAction(text, "");
    if (!action) {
      await m.reply(
        `ꕥ 𝖠𝖢𝖢𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Responde únicamente con \`hapus\` o \`kick\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return true;
    }

    session.action = action;
    session.step = "confirm";
    session.promptId = await sendPrompt(
      sock,
      m,
      `ꕥ 𝖲𝖤𝖳𝖴𝖯 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖯𝖱𝖤𝖦𝖴𝖭𝖳𝖠 4 / 4 (𝖢𝖮𝖭𝖥𝖨𝖱𝖬𝖠𝖢𝖨𝖮𝖭)*\n` +
        `${buildSummary(session)}\n\n` +
        `¿Deseas guardar esta configuración?\n` +
        `> Responde con \`ya\` para guardar o \`batal\` para cancelar.\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
    return true;
  }

  if (session.step === "confirm") {
    if (/^(batal|cancel|no|nggak|ga|gak|no)$/i.test(text)) {
      clearSession(sessionKey);
      await m.reply(
        `ꕥ 𝖲𝖤𝖲𝖨𝖮𝖭 𝖢𝖠𝖭𝖢𝖤𝖫𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Sesión cancelada. Puedes iniciar otra con \`${m.prefix}anticustom add\`. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return true;
    }

    if (!/^(ya|iya|y|yes|oke|ok|setuju|gas|lanjut|sip|siap)$/i.test(text)) {
      await m.reply(
        `ꕥ 𝖱𝖤𝖲𝖯𝖴𝖲𝖳𝖠 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Responde con \`ya\` para guardar o \`batal\` para cancelar. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
      return true;
    }

    const db = getDatabase();
    const groupData = db.getGroup(m.chat) || {};
    const currentRules = normalizeRules(groupData.anticustomRules);
    const titleKey = session.title.toLowerCase();
    const filteredRules = currentRules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === titleKey ||
        groupName === titleKey ||
        ruleName.startsWith(`${titleKey} #`)
      );
    });

    const createdAt = new Date().toISOString();
    const generatedRules = session.patterns.map((pattern, index) => ({
      name:
        session.patterns.length === 1
          ? session.title
          : `${session.title} #${index + 1}`,
      groupName: session.title,
      pattern,
      type: session.type,
      action: session.action,
      flags: "i",
      createdAt,
    }));

    db.setGroup(m.chat, {
      anticustom: "on",
      anticustomModo: session.action,
      anticustomRules: [...filteredRules, ...generatedRules],
    });

    clearSession(sessionKey);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `ꕥ 𝖠𝖭𝖳𝖨𝖢𝖴𝖲𝖳𝖮𝖬 𝖢𝖱𝖤𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
          `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖴𝖬𝖤𝖭*\n` +
          `${buildSummary(session)}\n` +
          `      • Estado del módulo :: Activado automáticamente (ON)\n` +
          `      • Reglas añadidas :: ${generatedRules.length}\n\n` +
          `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}anticustom\` para ver el menú principal. »\n\n` +
          `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
      },
      { quoted: m },
    );
    return true;
  }

  return false;
}

export { pluginConfig as config, handler, replyHandler };
