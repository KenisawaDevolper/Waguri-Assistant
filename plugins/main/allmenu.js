import * as botmodePlugin from "../group/botmode.js";
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from "ourin";
import _sharp from "sharp";
import config from "../../config.js";
import axios from "axios";
import {
  getTimeGreeting,
} from "../../src/lib/rimuru-formatter.js";
import fs from "fs"
import {
  getCommandsByCategory,
  getCategories,
  getPluginCount,
  getPlugin,
  getPluginsByCategory,
} from "../../src/lib/rimuru-plugins.js";
import { getCasesByCategory, getCaseCount } from "../../case/rimuru.js";
const pluginConfig = {
  name: "allmenu",
  alias: ["fullmenu", "am", "allcommand", "todos", "menucompleto"],
  category: "main",
  description: "𝖬𝗎ᧉ𝗌ƚ𝗋⍺ 𝗅⍺ 𝗅ı𝗌ƚ⍺ 𝖼𝗈𝗆𝗉𝗅ᧉƚ⍺ 𝖽ᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌 𝗉𝗈𝗋 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ ( ᴗ͈ˬᴗ͈ )",
  usage: ".allmenu",
  example: ".allmenu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  fun: "🎮",
  group: "👥",
  download: "📥",
  search: "🔍",
  tools: "🛠️",
  sticker: "🖼️",
  ai: "🤖",
  game: "🎯",
  media: "🎬",
  info: "ℹ️",
  religi: "☪️",
  panel: "🖥️",
  user: "📊",
  linode: "☁️",
  random: "🎲",
  canvas: "🎨",
  vps: "🌊",
  store: "🏪",
  premium: "💎",
  convert: "🔄",
  economy: "💰",
  cek: "📋",
  ephoto: "🎨",
  jpm: "📢",
  pushkontak: "📱",
};

function createBracketBox(emoji, title, lines = []) {
  let text = `╭─〔 ${emoji} 𝖬𝖤𝖭𝖴 ‧ ${title.toUpperCase()} 〕\n`;
  for (const line of lines) {
    text += `│ ✧ ${line}\n`;
  }
  text += `╰───────────────\n\n`;
  return text;
}

function getCommandSymbols(cmdName) {
  const plugin = getPlugin(cmdName);
  if (!plugin || !plugin.config) return "";
  const symbols = [];
  if (plugin.config.isOwner) symbols.push("👑");
  if (plugin.config.isPremium) symbols.push("💎");
  if (plugin.config.limit && plugin.config.limit > 0) symbols.push("⚡");
  if (plugin.config.isAdmin) symbols.push("⚜️");
  if (plugin.config.isGroup) symbols.push("👥");
  if (plugin.config.isPrivate) symbols.push("🔒");
  return symbols.length > 0 ? " " + symbols.join("") : "";
}

function getContextInfo(botConfig, m, thumbBuffer) {
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ";
  const saluranLink = botConfig.saluran?.link || "";
  return {
    mentionedJid: [m.sender],
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
const prefix = botConfig.command?.prefix || ".";
const user = db.getUser(m.sender);
const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
const botMode = groupData.botMode || "md";
const categories = getCategories();
const commandsByCategory = getCommandsByCategory();
const casesByCategory = getCasesByCategory();
let totalCommands = 0;
for (const category of categories) {
  totalCommands += (commandsByCategory[category] || []).length;
}
const totalCases = getCaseCount();
const totalFeatures = totalCommands + totalCases;
let userRole = "𝖴𝗌𝗎⍺𝗋ı𝗈",
  roleEmoji = "👤";
if (m.isOwner) {
  userRole = "𝖢𝗋ᧉ⍺𝖽𝗈𝗋";
  roleEmoji = "👑";
} else if (m.isPremium) {
  userRole = "𝖯𝗋ᧉ𝗆ı𝗎𝗆";
  roleEmoji = "💎";
}
const greeting = getTimeGreeting();
let txt = ``;

const weatherCodeMap = {
  0: "Despejado", 1: "Algo nublado", 2: "Parcialmente nublado", 3: "Nublado", 45: "Neblina", 48: "Niebla densa", 51: "Llovizna", 61: "Lluvia ligera", 63: "Lluvia", 65: "Lluvia fuerte", 80: "Chaparrones", 95: "Tormenta eléctrica"
};

let weatherText = "𝖡𝗎ᧉ𝗇𝗈𝗌 𝖠ı𝗋ᧉ𝗌 𝖯⍺𝗋𝖼ı⍺𝗅𝗆ᧉ𝗇ƚᧉ 𝗇𝗎𝖻𝗅⍺𝖽𝗈 20°𝖢 ⛅";
try {
  const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=Buenos%20Aires&count=1`);
  const loc = geo.data.results?.[0];
  if (loc) {
    const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`);
    const current = res.data.current;
    const kondisi = weatherCodeMap[current.weather_code] || "Parcialmente nublado";
    weatherText = `𝖡𝗎ᧉ𝗇𝗈𝗌 𝖠ı𝗋ᧉ𝗌 ${kondisi} ${Math.round(current.temperature_2m)}°𝖢`;
  }
} catch (e) { }

const userLimit = (m.isPremium || m.isOwner) ? "∞ 𝖨𝗅ı𝗆ıƚ⍺𝖽𝗈" : (user?.limit || 0);
const botName = botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ";
const devName = botConfig.bot?.developer || "Mauro";
const botVersion = botConfig.bot?.version || "1.0.0";
const pushName = m.pushName || "Usuario";
const timeNow = new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' });

txt += `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n`;
txt += `ꕥ *${botName.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ\n`;
txt += `*¡𝖧𝗈𝗅⍺, ${pushName}!* ฅ^·ﻌ·^ฅ\n`;
txt += `> _${greeting}, 𝖻ıᧉ𝗇𥡝ᧉ𝗇ı𝖽𝗈/⍺ ⍺𝗅 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅_ ≽^• ˕ • ྀི≼\n\n`;

txt += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖴𝖲𝖴𝖠𝖱𝖨𝖮* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;
txt += `      👤   𓈒 ◌ㅤ──    *𝗎𝗌𝗎⍺𝗋ı𝗈* : ${pushName}\n`;
txt += `      ${roleEmoji}   𓈒 ◌ㅤ──    *𝗋⍺𝗇𝗀𝗈* : ${userRole}\n`;
txt += `      ⚡   𓈒 ◌ㅤ──    *𝗅í𝗆ıƚᧉ* : ${userLimit}\n\n`;

txt += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤𝖫 𝖡𝖮𝖳* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;
txt += `      🌸   𓈒 ◌ㅤ──    *𝗇𝗈𝗆𝖻𝗋ᧉ* : ${botName}\n`;
txt += `      👑   𓈒 ◌ㅤ──    *𝖼𝗋ᧉ⍺𝖽𝗈𝗋* : ${devName}\n`;
txt += `      ⚙️   𓈒 ◌ㅤ──    *𝖿𝗎𝗇𝖼ı𝗈𝗇ᧉ𝗌* : ${totalFeatures} 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌\n`;
txt += `      🏷️   𓈒 ◌ㅤ──    *᥎ᧉ𝗋𝗌ıó𝗇* : v${botVersion}\n`;
txt += `      🌙   𓈒 ◌ㅤ──    *𝗁𝗈𝗋⍺* : ${timeNow} 𝗁𝗌\n`;
txt += `      🌤️   𓈒 ◌ㅤ──    *𝖼𝗅ı𝗆⍺* : ${weatherText}\n\n`;

txt += `(•ૢ⚈͒⌄⚈͒•ૢ) *𝗏ᧉ𝗇ƚ⍺𝕎⍺𝗌:* 🌸\n`;
txt += `      ⚡   𓈒 ◌ㅤ──    *𝗋á𝗉ı𝖽𝗈*\n`;
txt += `      ✨   𓈒 ◌ㅤ──    *ᧉ𝗌ƚ⍺𝖻𝗅ᧉ*\n`;
txt += `      🕊️   𓈒 ◌ㅤ──    *𝗆𝗎𝗅ƚı𝖿𝗎𝗇𝖼ıó𝗇*\n\n`;

txt += `‧₊ ᵎᵎ *𝖢𝖠𝖳𝖤𝖦𝖮𝖱Í𝖠𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲* ⋅˚##\n\n`;

for (const category of categories) {
  const cmds = commandsByCategory[category] || [];
  if (cmds.length === 0) continue;

  txt += `ꕥ *𝖬𝖤𝖭Ú ${category.toUpperCase()}* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n`;
  for (const cmd of cmds) {
    const symbol = getCommandSymbols(cmd);
    txt += `      ✧   𓈒 ◌ㅤ──    *${prefix}${cmd}*${symbol}\n`;
  }
  txt += `\n`;
}

txt += `✐ 𝗎𝗌⍺ 𝗅𝗈𝗌 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌 𝖼𝗈𝗇 𝗋ᧉ𝗌𝗉𝗈𝗇𝗌⍺𝖻ı𝗅ı𝖽⍺𝖽 ! ୧ ֹ ִ\n`;
txt += `> _${botName} - 𝗌ı𝗆𝗉𝗅ᧉ 𝗐𝗁⍺ƚ𝗌⍺𝗉𝗉 𝖻𝗈ƚ_ ツ`;

  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "info",
    "economy",
    "user",
    "canvas",
    "random",
    "premium"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  try {
    if (botmodePlugin && botmodePlugin.MODES) {
      const modes = botmodePlugin.MODES;
      modeAllowedMap = {};
      modeExcludeMap = {};
      for (const [key, val] of Object.entries(modes)) {
        modeAllowedMap[key] = val.allowedCategories;
        modeExcludeMap[key] = val.excludeCategories;
      }
    }
  } catch (e) { }
  const allowedCategories = modeAllowedMap[botMode];
  const excludeCategories = modeExcludeMap[botMode] || [];
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (
      allowedCategories &&
      !allowedCategories.includes(category.toLowerCase())
    )
      continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase()))
      continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const allCmds = [...pluginCmds, ...caseCmds];
    if (allCmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📋";
    const categoryName = category.toUpperCase();
    const commandLines = allCmds.map((cmd) => {
      const symbols = getCommandSymbols(cmd);
      return `${prefix}${cmd}${symbols}`;
    });
    txt += createBracketBox(emoji, categoryName, commandLines);
  }
  const savedVariant = db.setting("allmenuVariant");
  const allmenuVariant = savedVariant || botConfig.ui?.allmenuVariant || 2;
  try {
    switch (allmenuVariant) {
      case 1:
        await m.reply(txt);
        break;
      case 2:
        const media = await prepareWAMessageMedia({
          image: fs.readFileSync(config.assets["rimuru"])
        }, { upload: sock.waUploadToServer })
        await sock.relayMessage(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {},
                interactiveMessage: {
                  header: {
                    title: "",
                    subtitle: "",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                  },
                  body: {
                    text: `> *¡𝖧𝗈𝗅⍺ ${pushName}!* 👋 𝖲𝗈𝗒 *${botName}*, 𝖼𝗋ᧉ⍺𝖽⍺ 𝗉𝗈𝗋 *${devName}*. 𝖤𝗌ƚ𝗈𝗒 𝗅ı𝗌ƚ⍺ 𝗉⍺𝗋⍺ ⍺𝗒𝗎𝖽⍺𝗋ƚᧉ, 𝖽ᧉ𝗌𝖽ᧉ 𝖽ᧉ𝗌𝖼⍺𝗋𝗀⍺𝗋 𝗏í𝖽ᧉ𝗈𝗌 y 𝗃𝗎ᧉ𝗀𝗈𝗌, 𝗁⍺𝗌ƚ⍺ 𝖼𝗋ᧉ⍺𝗋 𝗌ƚı𝖼𝗄ᧉ𝗋𝗌 y 𝗆á𝗌 ฅ^·ﻌ·^ฅ\n\n`,
                  },
                  footer: {
                    text: txt
                  },
                  contextInfo: {
                    isForwarded: true,
                    fprwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${config.bot?.name}`
                    },
                    mentionedJid: [
                      `${m.sender}`
                    ]
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hola",
                        copy_code: "Desarrollado por " + config.bot?.developer,
                        expiration_time: Date.now() + 1000000,
                      },
                    }),
                    buttons: [
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🌸 𝖵𝗈𝗅𝗏ᧉ𝗋 ⍺𝗅 𝖬ᧉ𝗇ú 𝖯𝗋ı𝗇𝖼ı𝗉⍺𝗅",
                          id: m.prefix + "menu"
                        })
                      }
                    ]
                  }
                }
              }
            }
          },
          {}
        )
        break;
      case 5: {
        function runtime(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);
          return `${d}d ${h}h ${m}m ${s}s`;
        }

        const weatherCode = {
          0: "☀️ Despejado", 1: "🌤️ Algo nublado", 2: "⛅ Parcialmente nublado", 3: "☁️ Nublado", 45: "🌫️ Neblina", 48: "🌫️ Niebla densa", 51: "🌦️ Llovizna", 61: "🌧️ Lluvia ligera", 63: "🌧️ Lluvia", 65: "⛈️ Lluvia fuerte", 80: "🌦️ Chaparrones", 95: "⛈️ Tormenta eléctrica"
        }

        async function weatherMenu(city = "Buenos Aires") {
          try {
            const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"
            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }

        const thumbnail = await _sharp(fs.readFileSync(config.assets["rimuru"])).resize(300, 300).toBuffer()
        const qOrder = {
          key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: m.sender },
          message: { locationMessage: { degreesLatitude: 0, degreesLongitude: 0, name: await weatherMenu(), jpegThumbnail: thumbnail } }
        }
        const media4 = await prepareWAMessageMedia({ video: fs.readFileSync(config.assets["rimuru-mp4"]), gifPlayback: true }, { upload: sock.waUploadToServer });
        const msg4 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: { title: "", subtitle: "", hasMediaAttachment: true, videoMessage: media4.videoMessage },
                footer: { text: `𝖲ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇⍺ 𝗈𝗉𝖼ıó𝗇 ⍺ 𝖼𝗈𝗇ƚı𝗇𝗎⍺𝖼ıó𝗇 ( ᴗ͈ˬᴗ͈ )` },
                body: { text: txt },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
                    newsletterName: config.saluran?.name || config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: { text: `${greeting}`, url: "Hola", expiration_time: Date.now() + 10000 },
                    bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: "𝖲ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇 𝗆ᧉ𝗇ú", button_title: "🌸 𝖵ᧉ𝗋 𝖢⍺ƚᧉ𝗀𝗈𝗋í⍺𝗌" },
                    tap_target_configuration: { title: " X ", description: "waguri", canonical_url: "https://whatsapp.com", domain: "whatsapp.com", button_index: 0 },
                  }),
                  buttons: [
                    { name: "", buttonParamsJson: "" },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "📂 𝖵𝗈𝗅𝗏ᧉ𝗋 ⍺ 𝖢⍺ƚᧉ𝗀𝗈𝗋í⍺𝗌", id: m.prefix + "menucat" })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "🌸 𝖵𝗈𝗅𝗏ᧉ𝗋 ⍺𝗅 𝖬ᧉ𝗇ú 𝖯𝗋ı𝗇𝖼ı𝗉⍺𝗅", id: m.prefix + "menu" })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: qOrder, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, { messageId: msg4.key.id });
        break;
      }
      case 6: {
        const weatherCode = {
          0: "☀️ Despejado", 1: "🌤️ Algo nublado", 2: "⛅ Parcialmente nublado", 3: "☁️ Nublado", 45: "🌫️ Neblina", 48: "🌫️ Niebla densa", 51: "🌦️ Llovizna", 61: "🌧️ Lluvia ligera", 63: "🌧️ Lluvia", 65: "⛈️ Lluvia fuerte", 80: "🌦️ Chaparrones", 95: "⛈️ Tormenta eléctrica"
        }

        async function weatherMenu(city = "Buenos Aires") {
          try {
            const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"
            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }

        const thumbnail = await _sharp(fs.readFileSync(config.assets["rimuru"])).resize(300, 300).toBuffer()

        const msg6 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  hasMediaAttachment: true,
                  locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
                    address: await weatherMenu(),
                    jpegThumbnail: thumbnail
                  }
                },
                body: {
                  text: txt,
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
                    newsletterName: config.saluran?.name || config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  buttons: []
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg6.message, { messageId: msg6.key.id });
        break;
      }
      default:
        break
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["rimuru-mp3"];
      const audioVariant = db.setting("allmenuAudioStyle") || 1;
      try {
        const fs = (await import("fs")).default;
        const path = (await import("path")).default;
        const axios = (await import("axios")).default;

        switch (audioVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "allmenu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "allmenu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: m });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: m });
            }
            break;
          case 2: {
            const qpoll = {
              key: { participant: "0@s.whatsapp.net" },
              message: {
                pollCreationMessage: {
                  name: config.bot.name
                }
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "allmenu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "allmenu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qpoll });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qpoll });
            }
            break;
          }
          case 3: {
            const qtext = {
              key: {
                fromMe: false,
                participant: m.sender,
              },
              message: {
                conversation: "Reproduciendo audio..."
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(config.assets["rimuru-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          default: {
            const ftroliQuoted = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
              },
              message: {
                orderMessage: {
                  orderId: "44444444444444",
                  thumbnail:
                    (thumbBuffer || imageBuffer ? await (await getSharp())(thumbBuffer || imageBuffer)
                      .resize({ width: 300, height: 300 })
                      .toBuffer() : null),
                  itemCount: totalCmds,
                  status: "INQUIRY",
                  surface: "CATALOG",
                  message: `★ ${config.bot.name}`,
                  orderTitle: `📋 ${totalCmds} Comandos`,
                  sellerJid: botConfig.botNumber
                    ? `${botConfig.botNumber}@s.whatsapp.net`
                    : m.sender,
                  token: "waguri-menu-v1",
                  totalAmount1000: 3333333,
                  totalCurrencyCode: "ARS",
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: config.saluran?.id || "120363351980387532@newsletter",
                      newsletterName: config.saluran?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
                      serverMessageId: 127,
                    },
                  },
                },
              },
            };
            try {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["rimuru-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["rimuru-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: m },
              );
            }
            break;
          }
        }
      } catch (error) {
    console.error("[AllMenu] Error:", error.message);
    if (imageBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption: txt,
          contextInfo: getContextInfo(botConfig, m),
        },
        { quoted: m },
      );
    } else {
      await m.reply(txt);
    }
  }
  }
  } catch (outerErr) {
    console.error("[AllMenu] outer Error:", outerErr);
    try { await m.reply(txt); } catch {}
  }
}
export { pluginConfig as config, handler };
