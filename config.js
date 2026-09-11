import { getDatabase } from "./src/lib/rimuru-database.js";
import * as ownerPremiumDb from "./src/lib/rimuru-premium-db.js";

const config = {
  info: {
    website: "https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33",
    grupwa: "https://chat.whatsapp.com/LYTiednOrLB4ObAKYesqLH?s=cl&p=a&ilr=4",
  },

  owner: {
    name: "KenisawaDev", // Nombre del Owner
    number: ["5491164431320"], // Formato sin + ni espacios (Ej: 54911xxxxxxxx)
  },

  session: {
    pairingNumber: "5493865317981", // Número de WhatsApp para vinculación
    usePairingCode: true, // true = Código de vinculación, false = Código QR
  },

  // Sistema de llamadas falsas
  fake_call: {
    active: true, // true = activo, false = inactivo
    usePairing: true,
    dir: "./session_voip",
  },

  bot: {
    name: "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ", // Nombre del Bot
    version: "1.0.0", // Versión del Bot
    developer: "KenisawaDev", // Creador / Desarrollador
  },

  assets: {
    "rimuru-daftar": "./assets/image/rimuru-daftar.png",
    "rimuru-demote": "./assets/image/rimuru-demote.png",
    "rimuru-fishit": "./assets/image/rimuru-fishit.jpg",
    "rimuru-games": "./assets/image/rimuru-games.jpg",
    "rimuru-landscape": "./assets/image/rimuru-landscape.jpg",
    "rimuru-levelup": "./assets/image/rimuru-levelup.jpg",
    "rimuru-minecraft": "./assets/image/rimuru-minecraft.jpg",
    "rimuru-promote": "./assets/image/rimuru-promote.png",
    "rimuru-rpg": "./assets/image/rimuru-rpg.jpg",
    "rimuru-rules": "./assets/image/rimuru-rules.jpg",
    "rimuru-store": "./assets/image/rimuru-store.png",
    "rimuru-v8": "./assets/image/rimuru-v8.jpg",
    "rimuru-winner": "./assets/image/rimuru-winner.jpg",
    "rimuru": "./assets/image/rimuru.png",
    "rimuru2": "./assets/image/rimuru2.jpg",
    "rimuru3": "./assets/image/rimuru3.jpg",
    "pp-kosong": "./assets/image/pp-kosong.jpg",
    "rimuru-mp4": "./assets/video/rimuru-mp4.mp4",
    "rimuru-mp3": "./assets/audio/rimuru-mp3.mp3",
    "rimuru-font": "./assets/rimuru-font.ttf",
    "rimuru-kertas": "./assets/image/rimuru-kertas.jpg",
  },

  mode: "public", // "public" o "self"

  // Prefijo de comandos
  command: {
    prefix: "#",
  },

  vercel: {
    token: "", // Token de Vercel para despliegue automático (opcional)
  },

  payment: {
    qrisUrl: "",
    methods: [
      { name: "Mercado Pago / Alias", number: "tu.alias.aqui", holder: "Mauro" },
      { name: "PayPal", number: "paypal.me/tuusuario", holder: "Mauro" },
    ],
    banks: [],
    customText: "https://files.catbox.moe/megwu0.png",
  },

  donasi: {
    payment: [
      { name: "Mercado Pago", number: "tu.alias.aqui", holder: "Mauro" },
      { name: "PayPal", number: "paypal.me/tuusuario", holder: "Mauro" },
    ],
    benefits: [
      "🌸 Apoyar el desarrollo del bot",
      "⚡ Servidor más estable y rápido",
      "✨ Acceso a funciones exclusivas",
      "👑 Soporte prioritario",
    ],
    qris: "https://files.catbox.moe/megwu0.png",
  },

  energi: {
    enabled: true, // Si es true, activa el sistema de límite/energía
    default: 50,
    premium: 100,
    owner: -1,
  },

  sticker: {
    packname: "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 🌸", // Nombre del paquete de stickers
    author: "KenisawaDev", // Autor del sticker
  },

  saluran: {
    id: "120363409285330747@newsletter",
    name: "Canal Oficial • 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
    link: "https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33",
  },

  groupProtection: {
    antilink: "⚠ *Antienlace* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkKick: "⚠ *Antienlace* — @%user% fue expulsado/a por enviar enlaces.",
    antilinkGc: "⚠ *Antienlace WA* — @%user% envió un enlace de grupo.\nMensaje eliminado.",
    antilinkGcKick: "⚠ *Antienlace WA* — @%user% fue expulsado/a por enviar enlace de grupo.",
    antilinkAll: "⚠ *Antienlace* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkAllKick: "⚠ *Antienlace* — @%user% fue expulsado/a por enviar enlaces.",
    antitagsw: "⚠ *AntiTagEstado* — Mención en estado de @%user% eliminada.",
    antiviewonce: "👁️ *Ver Una Vez* — De @%user%",
    antiremove: "🗑️ *AntiEliminar* — @%user% eliminó un mensaje:",
    antiswgc: "⚠ *AntiEstadoGrupo* — No se permiten estados de grupo de @%user%.",
    antihidetag: "⚠ *AntiHidetag* — Mención oculta de @%user% eliminada.",
    antitoxicWarn: "⚠ @%user% usó lenguaje no permitido.\nAdvertencia %warn% de %max%. La siguiente infracción aplicará %method%.",
    antitoxicAction: "🚫 @%user% fue sancionado/a con %method% por conducta tóxica (%warn%/%max%).",
    antidocument: "⚠ *AntiDocumentos* — Documento de @%user% eliminado.",
    antisticker: "⚠ *AntiSticker* — Sticker de @%user% eliminado.",
    antimedia: "⚠ *AntiMedia* — Archivo multimedia de @%user% eliminado.",
    antibot: "🤖 *AntiBot* — @%user% fue detectado/a como bot y expulsado/a.",
    notAdmin: "⚠ El bot no es administrador, no puede eliminar mensajes.",
  },

  errorTemplate: `☢️ Ocurrió un inconveniente con el comando \`{prefix}{command}\`\nPor favor, inténtalo de nuevo más tarde, {pushName} ✨\n\n_Si el problema persiste, contacta al propietario._`,

  features: {
    antiCall: true, // Rechaza llamadas entrantes
    blockIfCall: false, // Bloquea al usuario si llama al bot
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Si es true, el usuario debe registrarse antes de usar el bot
    rewards: {
      koin: 300,
      energi: 300,
      exp: 3000,
    },
  },

  welcome: { defaultEnabled: true },
  goodbye: { defaultEnabled: true },

  ui: {
    menuVariant: 3,
  },

    messages: {
    wait: "*( ᴗ͈ˬᴗ͈ )* 𝖯𝗋𝗈𝖼ᧉ𝗌⍺𝗇𝖽𝗈... 𝗉𝗈𝗋 𝖿⍺𝗏𝗈𝗋 ᧉ𝗌𝗉ᧉ𝗋⍺ 𝗎𝗇 𝗆𝗈𝗆ᧉ𝗇ƚ𝗈 ฅ^·ﻌ·^ฅ",
    success: "*(๑>ᴗ<๑)* ¡𝖢𝗈𝗆𝗉𝗅ᧉƚ⍺𝖽𝗈 𝖼𝗈𝗇 é𝗑ıƚ𝗈! ✨",
    error: "*( 𝜰 ﹏ 𝜰 )* 𝖮𝖼𝗎𝗋𝗋ıó 𝗎𝗇 ᧉ𝗋𝗋𝗈𝗋 ᧉ𝗇 ᧉ𝗅 𝗌ı𝗌ƚᧉ𝗆⍺, ı𝗇ƚé𝗇ƚ⍺𝗅𝗈 𝗆á𝗌 ƚ⍺𝗋𝖽ᧉ.",

    ownerOnly: "*( 𝜰 ˕ 𝜰 )* 𝖠𝖼𝖼ᧉ𝗌𝗈 𝗋ᧉ𝗌ƚ𝗋ı𝗇𝗀ı𝖽𝗈. 𝖤𝗌ƚᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈 ᧉ𝗌 𝗌𝗈𝗅𝗈 𝗉⍺𝗋⍺ 𝗆ı 𝖢𝗋ᧉ⍺𝖽𝗈𝗋.",
    premiumOnly: "*( ฅ•ω•ฅ )* 𝖥𝗎𝗇𝖼ıó𝗇 𝖯𝗋ᧉ𝗆ı𝗎𝗆. 𝖴𝗌⍺ *.benefitpremium* 𝗉⍺𝗋⍺ 𝗆á𝗌 ı𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇.",

    groupOnly: "*( ≍ ﹏ ≍ )* 𝖤𝗌ƚᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗌ᧉ 𝗉𝗎ᧉ𝖽ᧉ 𝗎𝗌⍺𝗋 ᧉ𝗇 𝗀𝗋𝗎𝗉𝗈𝗌.",
    privateOnly: "*( ≍ ﹏ ≍ )* 𝖤𝗌ƚᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗌ᧉ 𝗉𝗎ᧉ𝖽ᧉ 𝗎𝗌⍺𝗋 ᧉ𝗇 𝖼𝗁⍺ƚ 𝗉𝗋ı𝗏⍺𝖽𝗈.",

    adminOnly: "*( •̀ ᴖ •́ )* 𝖭ᧉ𝖼ᧉ𝗌ıƚ⍺𝗌 𝗌ᧉ𝗋 𝖠𝖽𝗆ı𝗇ı𝗌ƚ𝗋⍺𝖽𝗈𝗋 𝗉⍺𝗋⍺ 𝗎𝗌⍺𝗋 ᧉ𝗌ƚ𝗈.",
    botAdminOnly: "*( ｡•́︿•̀｡ )* 𝖭ᧉ𝖼ᧉ𝗌ıƚ𝗈 𝗌ᧉ𝗋 𝖠𝖽𝗆ı𝗇ı𝗌ƚ𝗋⍺𝖽𝗈𝗋⍺ 𝗉⍺𝗋⍺ 𝗋ᧉ⍺𝗅ı𝗯⍺𝗋 ᧉ𝗌ƚ⍺ ⍺𝖼𝖼ıó𝗇.",

    cooldown: "*( ⏳ )* 𝖤𝗌𝗉ᧉ𝗋⍺ %time% 𝗌ᧉ𝗀𝗎𝗇𝖽𝗈(𝗌) ⍺𝗇ƚᧉ𝗌 𝖽ᧉ 𝗏𝗈𝗅𝗏ᧉ𝗋 ⍺ ı𝗇ƚᧉ𝗇ƚ⍺𝗋 ( ᴗ͈ˬᴗ͈ )",
    energiExceeded: "*( 𝜰 ﹏ 𝜰 )* 𝖳𝗎 ᧉ𝗇ᧉ𝗋𝗀í⍺ 𝗌ᧉ 𝗁⍺ ⍺𝗀𝗈ƚ⍺𝖽𝗈. 𝖵𝗎ᧉ𝗅𝗏ᧉ 𝗆⍺ñ⍺𝗇⍺ 𝗈 ⍺𝖽𝗊𝗎ıᧉ𝗋ᧉ 𝖯𝗋ᧉ𝗆ı𝗎𝗆.",
    limitDeducted: "*( ⚡ )* 𝖲ᧉ 𝗎𝗌⍺𝗋𝗈𝗇 {amount} 𝖽ᧉ 𝗅í𝗆ıƚᧉ. 𝖳ᧉ 𝗊𝗎ᧉ𝖽⍺𝗇: {sisa}",

    banned: "*( 🚫 )* 𝖧⍺𝗌 𝗌ı𝖽𝗈 𝖻⍺𝗇ᧉ⍺𝖽𝗈/⍺. 𝖭𝗈 𝗉𝗎ᧉ𝖽ᧉ𝗌 𝗎𝗌⍺𝗋 ᧉ𝗅 𝖻𝗈ƚ.",

    rejectCall: "*( 𝜰 ˕ 𝜰 )* 𝖯𝗈𝗋 𝖿⍺𝗏𝗈𝗋, 𝗇𝗈 𝗋ᧉ⍺𝗅ı𝖼ᧉ𝗌 𝗅𝗅⍺𝗆⍺𝖽⍺𝗌 ⍺𝗅 𝖻𝗈ƚ.",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true,
    watchSrc: false,
    debugLog: false,
  },

  pterodactyl: {
    server1: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
  },

  digitalocean: {
    token: "",
    region: "sgp1",
    sellers: [],
    ownerPanels: [],
  },

  geminiApiKey: "", // Clave API de Gemini (opcional)

  autoaiPersonas: {
    Bell409: `- Tu nombre es Waguri Assistant.
- Tu comportamiento es amable, educado, refinado y atento.
- Respondes de forma clara, directa y natural.
- Usas emojis delicados y mantienes un tono respetuoso y cálido con todos los usuarios.
- Si detectas comentarios inapropiados, adviertes de forma seria pero educada.`,
  },

  // Claves API
  APIkey: {
    lolhuman: "APIKey-Milik-Bot-OurinMD",
    neoxr: "s40ies",
    fgsi: "fgsiapi-235affd2-6d",
    google: "YOUR_GOOGLE_API_KEY",
    groq: "YOUR_GROQ_API_KEY",
    betabotz: "Btz-67YfP",
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
    onlym: "ONLym-783d29",
    obscura: "obs-byOn9RVGMzvPXZQTsP9W",
    firefly: "ourinNextGen",
    cuki: "cuki-x"
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (config.bot?.number) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = getDatabase();

    if (config.owner?.number) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (db?.data && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch { }

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch { }

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = getDatabase();
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch { }

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getOwnerName(number) {
  if (!number) return config.owner?.name || "Owner";
  const cleanNumber = String(number).replace(/[^0-9]/g, "");
  try {
    const db = getDatabase();
    const nameMap = db.setting("ownerNames") || {};
    if (nameMap[cleanNumber]) return nameMap[cleanNumber];
  } catch { }
  if (config.owner?.number) {
    const isMainOwner = config.owner.number.some((own) => {
      const c = own.replace(/[^0-9]/g, "");
      return (
        c &&
        (cleanNumber === c ||
          cleanNumber.endsWith(c) ||
          c.endsWith(cleanNumber))
      );
    });
    if (isMainOwner) return config.owner?.name || "Owner";
  }
  return "Owner";
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;
config.getOwnerName = getOwnerName;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};
