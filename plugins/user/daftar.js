import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import { getAssetBuffer } from "../../src/lib/rimuru-asset-manager.js";
import {
  getCachedJid,
  isLid,
  isLidConverted,
  lidToJid,
} from "../../src/lib/rimuru-lid.js";
import config from "../../config.js";

const pluginConfig = {
  name: "register",
  alias: ["regustrar", "reg"],
  category: "user",
  description: "Regístrate como usuario del bot mediante una sesión interactiva",
  usage: ".register",
  example: ".register",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
  skipRegistration: true,
};


if (!global.registrationSessions) global.registrationSessions = {};

const SESSION_TIMEOUT = 300000;
const DEFAULT_REWARDS = { koin: 30000, energi: 300, exp: 300000 };
const REGISTRATION_IMAGE_CANDIDATES = [
  "rimuru-daftar",
  "rimuru",
];

function getRegistrationContextInfo() {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "rimuru-AI";

  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

function getRegistrationRequired(db) {
  return (
    db.setting("registrationRequired") ?? config.registration?.enabled ?? false
  );
}

function getRegistrationRewards() {
  return config.registration?.rewards || DEFAULT_REWARDS;
}

async function getRegistrationImage() {
  const { getCachedThumb } = await import("../../src/lib/rimuru-serialize.js");
  for (const key of REGISTRATION_IMAGE_CANDIDATES) {
    const buf = getAssetBuffer(key);
    if (buf) return buf;
  }

  return null;
}

function normalizeRegistrationName(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSessionText(input) {
  return String(input || "")
    .trim()
    .toLowerCase();
}

function shouldBypassRegistrationAnswer(m) {
  if (!m?.isCommand) return false;
  const command = String(m.command || "").toLowerCase();
  return ["daftar", "register", "reg", "bataldaftar"].includes(command);
}

function getRegistrationSessionKey(jid) {
  let normalized = String(jid || "").trim();
  if (!normalized) return "";
  if (isLid(normalized) || isLidConverted(normalized)) {
    normalized = getCachedJid(normalized) || lidToJid(normalized) || normalized;
  }
  const digits = normalized.replace(/[^0-9]/g, "");
  return digits || normalized.toLowerCase();
}

function getRegistrationSessionEntry(jid) {
  const sessionKey = getRegistrationSessionKey(jid);
  if (sessionKey && global.registrationSessions?.[sessionKey]) {
    return {
      key: sessionKey,
      session: global.registrationSessions[sessionKey],
    };
  }
  const legacyKey = String(jid || "").trim();
  if (legacyKey && global.registrationSessions?.[legacyKey]) {
    return { key: legacyKey, session: global.registrationSessions[legacyKey] };
  }
  return { key: sessionKey, session: null };
}

function clearRegistrationSession(jid) {
  const { key, session } = getRegistrationSessionEntry(jid);
  if (!session) return false;
  if (session.timeout) clearTimeout(session.timeout);
  delete global.registrationSessions[key];
  return true;
}

function createRegistrationSession(jid, chatJid) {
  const sessionKey = getRegistrationSessionKey(jid);
  clearRegistrationSession(sessionKey);

  const session = {
    step: "name",
    name: null,
    age: null,
    gender: null,
    chatJid,
    promptId: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      if (global.registrationSessions[sessionKey]) {
        delete global.registrationSessions[sessionKey];
      }
    }, SESSION_TIMEOUT),
  };

  global.registrationSessions[sessionKey] = session;
  return session;
}

function getQuotedMessageId(m) {
  return m.quoted?.id || m.quoted?.stanzaId || m.quoted?.key?.id || null;
}

function isReplyToSessionPrompt(m, session) {
  const quotedId = getQuotedMessageId(m);
  if (!session || m.chat !== session.chatJid || !m.quoted) return false;
  if (quotedId && session.promptId && quotedId === session.promptId)
    return true;
  if (m.quoted?.key?.fromMe) return true;
  return false;
}

async function sendRegistrationPrompt(sock, m, text, options = {}) {
  const image = options.useImage ? await getRegistrationImage() : null;
  if (image) {
    return await sock.sendMessage(
      m.chat,
      {
        image,
        caption: text,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );
  } else {
    return await m.reply(text);
  }
}

function buildRewardPreview(user) {
  const rewards = getRegistrationRewards();

  if (user?.hasClaimedRegisterReward) {
    return `> Estado de bonificación:\n> Ya has reclamado el bono de registro anteriormente.\n> No se otorgan recompensas adicionales en registros repetidos.`;
  }

  return `> Bono por registro inicial:\n> - Monedas Koin: +${rewards.koin.toLocaleString("es-ES")}\n> - Energía: +${rewards.energi}\n> - Experiencia: +${rewards.exp.toLocaleString("es-ES")} XP`;
}

function buildConfirmationRewardBlock(user) {
  const rewards = getRegistrationRewards();

  if (user?.hasClaimedRegisterReward) {
    return `> [BONIFICACIÓN]\n> El bono de registro ya fue reclamado previamente.\n> No hay recompensas adicionales.`;
  }

  return `> [RECOMPENSAS INICIALES]\n> - Monedas Koin: +${rewards.koin.toLocaleString("es-ES")}\n> - Energía: +${rewards.energi}\n> - Experiencia: +${rewards.exp.toLocaleString("es-ES")} XP`;
}

function buildSuccessRewardBlock(alreadyClaimedReward) {
  const rewards = getRegistrationRewards();

  if (alreadyClaimedReward) {
    return `> [BONIFICACIÓN]\n> El bono de registro ya había sido reclamado antes.\n> No se añadieron recompensas extra.`;
  }

  return `> [RECOMPENSAS APLICADAS]\n> - Monedas: +${rewards.koin.toLocaleString("es-ES")}\n> - Energía: +${rewards.energi}\n> - Experiencia: +${rewards.exp.toLocaleString("es-ES")} XP`;
}

function buildUserDataBlock(name, age, gender) {
  return (
    `> [DATOS DEL PERFIL]\n` +
    `> Nombre: *${name || "-"}*\n` +
    `> Edad: *${age ? `${age} años` : "-"}*\n` +
    `> Género: *${gender || "-"}*`
  );
}

function buildWelcomeMessage(user, registrationRequired, prefix) {
  const benefits = [
    `Los datos de tu cuenta se guardarán de forma segura.`,
    `${buildRewardPreview(user)}`,
  ];

  if (registrationRequired) {
    benefits.splice(
      1,
      0,
      `Al registrarte podrás desbloquear y usar todas las funciones del bot.`,
    );
  }

  return (
    `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
    `> _Asistente de registro interactivo ≽^• ˕ • ྀི≼_\n\n` +
    `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
    `> 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖣𝖤 𝖴𝖲𝖴𝖠𝖱𝖨𝖮\n\n` +
    `> Registrarte te permite proteger tu progreso y disfrutar de la experiencia completa.\n\n` +
    `> Beneficios del registro:\n` +
    `${benefits.map((item) => `> - ${item}`).join("\n")}\n\n` +
    `> Pregunta 1 de 4:\n` +
    `> ¿Cuál es tu nombre?\n\n` +
    `> Aviso: Responde directamente a este mensaje.\n` +
    `> Para cancelar en cualquier momento, escribe \`${prefix}cancelreg\` o responde \`batal\`.\n\n` +
    `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
  );
}

function buildConfirmationPrompt(session, user) {
  return (
    `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
    `> _Confirmación de datos ≽^• ˕ • ྀི≼_\n\n` +
    `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
    `> 𝖢𝖮𝖭𝖥𝖨𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤 𝖣𝖠𝖳𝖮𝖲 (4/4)\n\n` +
    `> ¿Los siguientes datos son correctos?\n\n` +
    `${buildUserDataBlock(session.name, session.age, session.gender)}\n\n` +
    `${buildConfirmationRewardBlock(user)}\n\n` +
    `> Si hay algún error, puedes modificar cada sección.\n\n` +
    `> Responde a este mensaje con:\n` +
    `> - \`ya\` para guardar y finalizar\n` +
    `> - \`revisi nama\` para cambiar el nombre\n` +
    `> - \`revisi umur\` para cambiar la edad\n` +
    `> - \`revisi gender\` para cambiar el género\n` +
    `> - \`batal\` para cancelar\n\n` +
    `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
  );
}


async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (user?.isRegistered) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Consulta de registro ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 𝖸𝖠 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮\n\n` +
      `> ¡Ya te encuentras registrado en el sistema!\n\n` +
      `${buildUserDataBlock(user.regName, user.regAge, user.regGender)}\n\n` +
      `> Para cancelar tu registro utiliza: \`${m.prefix}unreg\`\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
    );
  }

  if (getRegistrationSessionEntry(m.sender).session) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Sesión de registro en curso ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖲𝖤𝖲𝖨Ó𝖭 𝖠𝖢𝖳𝖨𝖵𝖠\n\n` +
      `> Aviso: Ya tienes una sesión de registro activa.\n` +
      `> Responde al último mensaje del bot para continuar o escribe \`${m.prefix}cancelreg\` para cancelar.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
    );
  }

  const session = createRegistrationSession(m.sender, m.chat);
  const sent = await sendRegistrationPrompt(
    sock,
    m,
    buildWelcomeMessage(user, getRegistrationRequired(db), m.prefix),
    { useImage: true },
  );

  session.promptId = sent?.key?.id || null;

  await m.react("📝");
}


async function registrationAnswerHandler(m, sock) {
  if (!m.body) return false;
  if (shouldBypassRegistrationAnswer(m)) return false;

  const { session } = getRegistrationSessionEntry(m.sender);
  if (!session) return false;
  if (m.chat !== session.chatJid) return false;

  const text = m.body.trim();
  const lowText = normalizeSessionText(text);
  const db = getDatabase();

  if (["batal", "cancel", "batalkan", "cancelar"].includes(lowText)) {
    clearRegistrationSession(m.sender);
    await m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Proceso cancelado ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖢𝖠𝖭𝖢𝖤𝖫𝖠𝖣𝖮\n\n` +
      `> Aviso: Has cancelado el proceso de registro.\n` +
      `> Puedes iniciarlo de nuevo escribiendo: \`${m.prefix}register\`\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
    );
    return true;
  }

  if (session.step === "name") {
    const name = normalizeRegistrationName(text);

    if (name.length < 2 || name.length > 30) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de validación ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖭𝖮𝖬𝖡𝖱𝖤 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮\n\n` +
        `> Error: ¡El nombre debe tener entre 2 y 30 caracteres!\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    session.name = name;
    session.step = "age";

    const sent = await sendRegistrationPrompt(
      sock,
      m,
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Paso 2 de registro ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖤𝖣𝖠𝖣 𝖣𝖤𝖫 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 (2/4)\n\n` +
      `> Hola, *${name}*.\n` +
      `> ¿Cuántos años tienes?\n\n` +
      `> Nota: La edad debe estar entre 1 y 100 años.\n` +
      `> Responde con el número (ejemplo: \`17\`).\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "age") {
    const age = Number(text);

    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de validación ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖤𝖣𝖠𝖣 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠\n\n` +
        `> Error: Ingresa un número de edad válido entre 1 y 100.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    session.age = age;
    session.step = "gender";

    const sent = await sendRegistrationPrompt(
      sock,
      m,
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
      `> _Paso 3 de registro ≽^• ˕ • ྀི≼_\n\n` +
      `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
      `> 𝖦É𝖭𝖣𝖤𝖱𝖮 𝖣𝖤𝖫 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 (3/4)\n\n` +
      `> ¿Cuál es tu género?\n\n` +
      `> Opciones válidas:\n` +
      `> - Masculino: Hombre / Masculino / M\n` +
      `> - Femenino: Mujer / Femenino / F\n\n` +
      `> Responde a este mensaje con tu elección.\n\n` +
      `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "gender") {
    let gender = null;

    if (/^(hombre|chico|var[óo]n|masculino|m|male)$/i.test(lowText)) {
      gender = "Masculino";
    } else if (/^(mujer|chica|femenino|f|female)$/i.test(lowText)) {
      gender = "Femenino";
    }

    if (!gender) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de validación ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖦É𝖭𝖣𝖤𝖱𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮\n\n` +
        `> Error: El género ingresado no es válido.\n` +
        `> Responde con: *Hombre* / *Masculino* / *M* o *Mujer* / *Femenino* / *F*.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    session.gender = gender;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_name") {
    const name = normalizeRegistrationName(text);

    if (name.length < 2 || name.length > 30) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de revisión ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖭𝖮𝖬𝖡𝖱𝖤 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮\n\n` +
        `> Error: El nombre debe tener entre 2 y 30 caracteres.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    session.name = name;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_age") {
    const age = Number(text);

    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de revisión ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖤𝖣𝖠𝖣 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠\n\n` +
        `> Error: Introduce una edad válida de 1 a 100 años.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    session.age = age;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_gender") {
    let gender = null;

    if (/^(hombre|chico|var[óo]n|masculino|m|male)$/i.test(lowText)) {
      gender = "Masculino";
    } else if (/^(mujer|chica|femenino|f|female)$/i.test(lowText)) {
      gender = "Femenino";
    }

    if (!gender) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Error de revisión ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖦É𝖭𝖣𝖤𝖱𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮\n\n` +
        `> Error: El género no es válido. Responde con Hombre o Mujer.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    session.gender = gender;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "confirm") {
    if (["cambiar nombre", "editar nombre", "modificar nombre"].includes(lowText)) {
      session.step = "revise_name";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Modificación de nombre ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖱𝖤𝖵𝖨𝖲𝖨Ó𝖭 𝖣𝖤 𝖭𝖮𝖬𝖡𝖱𝖤\n\n` +
        `> Envía el nombre correcto a continuación respondiendo a este mensaje.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["cambiar edad", "editar edad", "modificar edad", "revisar edad"].includes(lowText)
    ) {
      session.step = "revise_age";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Modificación de edad ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖱𝖤𝖵𝖨𝖲𝖨Ó𝖭 𝖣𝖤 𝖤𝖣𝖠𝖣\n\n` +
        `> Envía la edad correcta (entre 1 y 100 años) respondiendo a este mensaje.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["cambiar género", "editar género", "modificar género", "cambiar sexo"].includes(
        lowText,
      )
    ) {
      session.step = "revise_gender";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Modificación de género ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖱𝖤𝖵𝖨𝖲𝖨Ó𝖭 𝖣𝖤 𝖦É𝖭𝖣𝖤𝖱𝖮\n\n` +
        `> Selecciona el género correcto:\n` +
        `> - Masculino: Hombre / Masculino / M\n` +
        `> - Femenino: Mujer / Femenino / F\n\n` +
        `> Responde a este mensaje con tu elección.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisar", "repetir", "reiniciar", "editar", "cambiar", "modificar"].includes(lowText)
    ) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Aviso de revisión ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖱𝖤𝖵𝖨𝖲𝖨Ó𝖭 𝖭𝖮 𝖤𝖲𝖯𝖤𝖢Í𝖥𝖨𝖢𝖠\n\n` +
        `> Por favor especifica qué deseas cambiar respondiendo:\n` +
        `> \`cambiar nombre\`, \`cambiar edad\` o \`cambiar género\`.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    if (!["ya", "y", "iya", "yes", "lanjut", "confirm", "si", "sí", "s"].includes(lowText)) {
      await m.reply(
        `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
        `> _Respuesta inválida ≽^• ˕ • ྀི≼_\n\n` +
        `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
        `> 𝖮𝖯𝖢𝖨Ó𝖭 𝖭𝖮 𝖱𝖤𝖢𝖮𝖭𝖮𝖢𝖨𝖣𝖠\n\n` +
        `> Responde con: \`ya\`, \`cambiar nombre\`, \`cambiar edad\`, \`cambiar género\` o \`batal\`.\n\n` +
        `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`
      );
      return true;
    }

    const currentUser = db.getUser(m.sender) || {};
    const rewards = getRegistrationRewards();
    const alreadyClaimedReward = Boolean(currentUser.hasClaimedRegisterReward);
    const now = new Date().toISOString();
    const registrationCount = Number(currentUser.registrationCount || 0) + 1;
    const finalName = session.name;
    const finalAge = session.age;
    const finalGender = session.gender;

    db.setUser(m.sender, {
      isRegistered: true,
      regName: finalName,
      regAge: finalAge,
      regGender: finalGender,
      registeredAt: currentUser.registeredAt || now,
      lastRegisteredAt: now,
      registrationCount,
      hasClaimedRegisterReward: true,
      unregisteredAt: null,
    });

    if (!alreadyClaimedReward) {
      db.updateKoin(m.sender, rewards.koin);
      db.updateEnergi(m.sender, rewards.energi);
      db.updateExp(m.sender, rewards.exp);
    }

    await db.save();
    clearRegistrationSession(m.sender);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n` +
          `> _Registro completado con éxito ≽^• ˕ • ྀི≼_\n\n` +
          `## ꕥ *W⍺gurı 𝖠ssı𝗌ƚ⍺nƚ* (*ᴗ͈ˬᴗ͈)ꕤ\n` +
          `> 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖤𝚇𝖨𝖳𝖮𝖲𝖮\n\n` +
          `> ¡Bienvenido al sistema, *${finalName}*!\n\n` +
          `${buildUserDataBlock(finalName, finalAge, finalGender)}\n\n` +
          `${buildSuccessRewardBlock(alreadyClaimedReward)}\n\n` +
          `> ¡Ya puedes disfrutar de todas las características del bot!\n\n` +
          `> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("🎉");
    return true;
  }

  return false;
}



export {
  pluginConfig as config,
  handler,
  registrationAnswerHandler,
  clearRegistrationSession,
};
