import { getCaseCount, getCasesByCategory } from "../../case/rimuru.js";
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} from "ourin";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import _sharp from "sharp";
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/rimuru-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/rimuru-plugins.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}
import axios from "axios";
import sharp from "sharp";
const pluginConfig = {
  name: "menu",
  alias: ["help", "ayuda", "comandos", "m"],
  category: "principal",
  description: "Muestra el menú principal del bot",
  usage: ".menu",
  example: ".menu",
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
  tools: "🛠️",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  info: "ℹ️",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  ephoto: "🖌️",
  anime: "🍥",
  clan: "⚔️",
  convert: "🔄",
  rpg: "🗡️",
  nsfw: "🔞",
  stalker: "🕵️",
  tts: "🗣️"
};
function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "ꜰ",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "ǫ",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔",
    B: "𝗕",
    C: "𝗖",
    D: "𝗗",
    E: "𝗘",
    F: "𝗙",
    G: "𝗚",
    H: "𝗛",
    I: "𝗜",
    J: "𝗝",
    K: "𝗞",
    L: "𝗟",
    M: "𝗠",
    N: "𝗡",
    O: "𝗢",
    P: "𝗣",
    Q: "𝗤",
    R: "𝗥",
    S: "𝗦",
    T: "𝗧",
    U: "𝗨",
    V: "𝗩",
    W: "𝗪",
    X: "𝗫",
    Y: "𝗬",
    Z: "𝗭",
  };
  return text
    .toUpperCase()
    .split("")
    .map((c) => chars[c] || c)
    .join("");
};
function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = [
    "main",
    "download",
    "search",
    "sticker",
    "group",
    "user",
    "premium",
    "ephoto"
  ];
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker",  "tools", "panel"],
    store: ["main", "group", "sticker",  "store"],
    pushkontak: ["main", "group", "sticker",  "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}
async function formatTime(date) {
  const timeHelper = await import("../../src/lib/rimuru-time.js");
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await import("../../src/lib/rimuru-time.js");
  return timeHelper.formatFull("dddd, DD MMMM YYYY");
}
async function buildMenuText(
  m,
  botConfig,
  db,
  uptime,
  botMode = "md",
  useBracketBoxStyle = false,
) {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/rimuru-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = getCaseCount();
  const casesByCategory = getCasesByCategory();
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
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  const pushName = m.pushName || "Usuario";
  const botName = botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ";
  const devName = botConfig.bot?.developer || "Mauro";
  const botVersion = botConfig.bot?.version || "1.0.0";

  let txt = `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n`;
  txt += `ꕥ *${botName.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ\n`;
  txt += `*¡${greeting}, ${pushName}!* ฅ^·ﻌ·^ฅ\n`;
  txt += `> _𝖡ıᧉ𝗇𥡝ᧉ𝗇ı𝖽𝗈/⍺ ⍺𝗅 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅, 𝗉𝗎ᧉ𝖽𝗈 ⍺𝗒𝗎𝖽⍺𝗋ƚᧉ ᧉ𝗇 𝗅𝗈 𝗊𝗎ᧉ 𝗇ᧉ𝖼ᧉ𝗌ıƚᧉ𝗌_ ≽^• ˕ • ྀི≼\n\n`;

  txt += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖴𝖲𝖴𝖠𝖱𝖨𝖮* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;
  txt += `        𓈒 ◌ㅤ──    *𝗎𝗌𝗎⍺𝗋ı𝗈* : ${pushName}\n`;
  txt += `      ${roleEmoji}   𓈒 ◌ㅤ──    *𝗋⍺𝗇𝗀𝗈* : ${userRole}\n`;
  txt += `        𓈒 ◌ㅤ──    *𝗆𝗈𝖽𝗈* : ${(botConfig.mode || "público").toUpperCase()}\n`;
  txt += `        𓈒 ◌ㅤ──    *𝗇ú𝗆ᧉ𝗋𝗈* : ${m.sender.split("@")[0]}\n`;
  txt += `        𓈒 ◌ㅤ──    *𝗁𝗈𝗋⍺* : ${timeStr} 𝗁𝗌\n\n`;

  txt += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤𝖫 𝖡𝖮𝖳* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;
  txt += `        𓈒 ◌ㅤ──    *𝗇𝗈𝗆𝖻𝗋ᧉ* : ${botName}\n`;
  txt += `        𓈒 ◌ㅤ──    *𝖼𝗋ᧉ⍺𝖽𝗈𝗋* : ${devName}\n`;
  txt += `        𓈒 ◌ㅤ──    *᥎ᧉ𝗋𝗌ıó𝗇* : v${botVersion}\n`;
  txt += `        𓈒 ◌ㅤ──    *𝖿𝗎𝗇𝖼ı𝗈𝗇ᧉ𝗌* : ${totalFeatures} 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌\n`;
  txt += `        𓈒 ◌ㅤ──    *⍺𝖼ƚıv𝗈* : ${uptimeFormatted}\n\n`;
  
  const categoryOrder = [
    "main",
    "tools",
    "download",
    "search",
    "sticker",
    "group",
    "economy",
    "user",
    "random",
    "premium",
    "ephoto",
    "gacha"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker",  "tools", "panel"],
    store: ["main", "group", "sticker",  "store"],
    pushkontak: ["main", "group", "sticker",  "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  try {
    const botmodePlugin = await import("../group/botmode.js");
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
  const categoryLines = [];
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
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
    categoryLines.push(`${prefix}menucat ${category} ${emoji}`);
  }
  if (categoryLines.length > 0) {
    txt += `‧₊ ᵎᵎ *𝖢𝖠𝖳𝖤𝖦𝖮𝖱Í𝖠𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲* ⋅˚##\n\n`;
    for (const line of categoryLines) {
      txt += `      🌸   𓈒 ◌ㅤ──    *${line}*\n`;
    }
    txt += `\n`;
  }
  return txt;
}

function createBracketBox(title, lines = [], emoji = "🌸") {
  let text = `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n`;
  text += `ꕥ *${title.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ\n\n`;
  text += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖢𝖮𝖭𝖳𝖤𝖭𝖨𝖣𝖮* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;
  for (const line of lines) {
    text += `      ${emoji}   𓈒 ◌ㅤ──    *${line}*\n`;
  }
  text += `\n`;
  return text;
}

function getContextInfo(
  botConfig,
  m,
  thumbBuffer,
  renderLargerThumbnail = false,
) {
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ",
      body: `𝖡𝖮𝖳 𝖶𝖧𝖠𝖳𝖲𝖠𝖯𝖯 𝖬𝖴𝖫𝖳𝖨 𝖣𝖤𝖵𝖨𝖢𝖤`,
      sourceUrl: saluranLink,
      previewType: "VIDEO",
      showAdAttribution: false,
      renderLargerThumbnail,
    },
  };
  if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
  return ctx;
  }
function getVerifiedQuoted(botConfig, m) {
  if (m) {
    return {
      key: {
        participant: `${m.sender}`,
        remoteJid: `status@broadcast`,
      },
      message: {
        contactMessage: {
          displayName: `🌸 𝖸ƚ𝗁. ${m.pushName || "Usuario"}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          sendEphemeral: true,
        },
      },
    };
  }
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `🌸 ${botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ"}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}


async function handler(m, { sock, config: botConfig, db, uptime }) {
  const savedVariant = db.setting("menuVariant");
  const menuVariant = [1, 2].includes(Number(savedVariant))
    ? Number(savedVariant)
    : ([1, 2].includes(Number(botConfig.ui?.menuVariant)) ? Number(botConfig.ui.menuVariant) : 2);
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const text = await buildMenuText(
    m,
    botConfig,
    db,
    uptime,
    botMode,
    menuVariant === 9,
  );

  let imageBuffer = null;
  let thumbBuffer = null;
  let videoBuffer = null;

  try {
    imageBuffer = fs.readFileSync(botConfig.assets["rimuru"])
    thumbBuffer = fs.readFileSync(botConfig.assets["rimuru2"])
  } catch (e) {
    console.error("𝖥⍺𝗅𝗅ó ⍺𝗅 𝖼⍺𝗋𝗀⍺𝗋 ⍺𝗌𝗌ᧉƚ𝗌:", e.message);
  }
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ";
  const saluranLink =
    botConfig.saluran?.link ||
    "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
  const {
    sorted: menuSorted,
    totalCmds,
    commandsByCategory,
  } = getSortedCategories(m, botMode);
  const totalCases = getCaseCount();
  const totalFeatures = totalCmds + totalCases;
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const user = await db.getUser(m.sender) || {}
  try {
    const categories = getSortedCategories(m, botMode);
    const zann_pengin_rehat = categories.sorted.map(({ cat, cmds, emoji }) => {
      const caseCount = (getCasesByCategory()[cat] || []).length;
      const total = cmds.length + caseCount;
      return {
        title: `${emoji} ${toMonoUpperBold(cat)}`,
        description: `𝖤𝗌ƚᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈 𝗍ıᧉ𝗇ᧉ (${total}) 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌`,
        id: `${m.prefix}menucat ${cat}`,
      };
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, {
            image: fs.readFileSync(config.assets["rimuru"]),
            caption: ``,
            footer: `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n*¡${greeting} ${m.pushName || "Usuario"}!* 👋\n\n🌿 𝖡ıᧉ𝗇vᧉ𝗇ı𝖽𝗈/⍺ ⍺𝗅 ⍺𝗌ı𝗌ƚᧉ𝗇ƚᧉ ${config.bot?.name || "𝑊⍺ց𝗎𝗋ı"}\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖡𝖮𝖳* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      🌸   𓈒 ◌ㅤ──    *𝗇𝗈𝗆𝖻𝗋ᧉ* : ${config.bot?.name}\n      🏷️   𓈒 ◌ㅤ──    *᥎ᧉ𝗋𝗌ıó𝗇* : ${config.bot.version}\n      👑   𓈒 ◌ㅤ──    *𝖼𝗋ᧉ⍺𝖽𝗈𝗋* : ${config.bot.developer}\n      ⚙️   𓈒 ◌ㅤ──    *𝗅ı𝖻𝗋ᧉ𝗋í⍺* : \`rimuru-baileys\`\n\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖴𝖲𝖴𝖠𝖱𝖨𝖮* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n      👤   𓈒 ◌ㅤ──    *𝗇𝗈𝗆𝖻𝗋ᧉ* : ${m.pushName}\n      ✨   𓈒 ◌ㅤ──    *𝗋⍺𝗇𝗀𝗈* : ${m?.isOwner ? "𝖢𝗋ᧉ⍺𝖽𝗈𝗋" : m?.isPremium ? "𝖯𝗋ᧉ𝗆ı𝗎𝗆" : "𝖴𝗌𝗎⍺𝗋ı𝗈"}\n      📊   𓈒 ◌ㅤ──    *𝗇ı𝗏ᧉ𝗅* : ${user.level || 0}\n      ⭐   𓈒 ◌ㅤ──    *ᧉ𝗑𝗉* : ${user.exp || 0}\n      ⚡   𓈒 ◌ㅤ──    *ᧉ𝗇ᧉ𝗋𝗀í⍺* : ${user.energi || 0}\n      🪙   𓈒 ◌ㅤ──    *𝗄𝗈ı𝗇* : ${user.koin || 0}\n\n(•ૢ⚈͒⌄⚈͒•ૢ) 𝖯𝗋ᧉ𝗌ı𝗈𝗇⍺ ᧉ𝗅 𝖻𝗈ƚó𝗇 𝗉⍺𝗋⍺ 𝗆á𝗌 ı𝗇𝖿𝗈𝗋𝗆⍺𝖼ıó𝗇 𝗑 ( ᴗ͈ˬᴗ͈ )`,
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🌸 𝖬ᧉ𝗇ú 𝖯𝗋ı𝗇𝖼ı𝗉⍺𝗅",
                  sections: [
                    {
                      title: "𝖲ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇⍺ 𝗈𝗉𝖼ıó𝗇",
                      rows: zann_pengin_rehat
                    }
                  ],
                  icon: "DEFAULT"
                })
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🌸 𝖬á𝗌 𝖮𝗉𝖼ı𝗈𝗇ᧉ𝗌",
                  sections: [
                    {
                      title: "𝖲ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇⍺ 𝗈𝗉𝖼ıó𝗇",
                      rows: [
                        {
                          title: "🍔 𝖵ᧉ𝗋 ƚ𝗈𝖽𝗈𝗌 𝗅𝗈𝗌 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌",
                          description: "𝖳⍺𝗉 𝗉⍺𝗋⍺ ᧉ𝗇𝗏ı⍺𝗋",
                          id: `${m.prefix}allmenu`
                        },
                        {
                          title: "🌾 ¿𝖰𝗎ıé𝗇 ᧉ𝗌 ᧉ𝗅 𝖼𝗋ᧉ⍺𝖽𝗈𝗋?",
                          description: "𝖬𝗎ᧉ𝗌ƚ𝗋⍺ 𝗅⍺ ı𝗇𝖿𝗈 𝖽ᧉ𝗅 𝖽ᧉ𝗌⍺𝗋𝗋𝗈𝗅𝗅⍺𝖽𝗈𝗋",
                          id: `${m.prefix}owner`
                        },
                      ]
                    }
                  ],
                  icon: "REVIEW"
                })
              },
            ]
          }, {
            quoted: getVerifiedQuoted(botConfig, m),
          })
        } else {
          await m.reply(text);
        }
        break;
      case 2: {
        const fixedCategories = [
           "main", "download",
          "search", "sticker", "group",
          "user", "premium", "ephoto",
          "downloader",
          "xp", "nsfw", "gacha"
        ];

        const categoryRows = [];
        const categoryLines = [];
        const commandsMap = getCommandsByCategory();
        const casesMap = getCasesByCategory();
        const allowed = getSortedCategories(m, botMode).sorted;
        const available = new Map(
          allowed.map(item => [item.cat.toLowerCase(), item])
        );

        for (const cat of fixedCategories) {
          const item = available.get(cat);
          if (!item) continue;

          const pluginCount = (commandsMap[item.cat] || []).length;
          const caseCount = (casesMap[item.cat] || []).length;
          const count = pluginCount + caseCount;

          if (!count) continue;

          categoryLines.push(`┣➤ *${prefix}menucat ${cat}*`);

          categoryRows.push({
            title: cat.toUpperCase(),
            description: `${count} 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌`,
            id: `${prefix}menucat ${cat}`,
          });
        }

        const botName = config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ";
        const botVersion = config.bot?.version || "1.0";
        const botModeName = String(config.mode || "público").toUpperCase();
        const userName = m.pushName || "Usuario";
        const featureCount = totalFeatures;

        const bodyLines = [
          `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »`,
          ``,
          `ꕥ *${botName.toUpperCase()}* (*ᴗ͈ˬᴗ͈)ꕤ`,
          ``,
          `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖡𝖮𝖳* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)`,
          ``,
          `        𓈒 ◌ㅤ──    *𝗇𝗈𝗆𝖻𝗋ᧉ* : ${botName}`,
          `        𓈒 ◌ㅤ──    *𝗎𝗌𝗎⍺𝗋ı𝗈* : ${userName}`,
          `        𓈒 ◌ㅤ──    *𝗆𝗈𝖽𝗈* : ${botModeName}`,
          `        𓈒 ◌ㅤ──    *᥎ᧉ𝗋𝗌ıó𝗇* : v${botVersion}`,
          `        𓈒 ◌ㅤ──    *𝖿𝗎𝗇𝼫𝗂𝗈𝗇ᧉ𝗌* : ${featureCount} 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌`,
          ``,
          `(•ૢ⚈͒⌄⚈͒•ૢ) *⍺𝗏ı𝗌𝗈 ı𝗆𝗉𝗈𝗋ƚ⍺𝗇ƚᧉ* `,
          `        𓈒 ◌ㅤ──    _𝗇𝗈 𝗌𝗉⍺𝗆ᧉ⍺𝗌 𝗉𝗈𝗋 𝖿⍺𝗏𝗈𝗋 🐣_`,
          `        𓈒 ◌ㅤ──    _𝗎𝗌⍺ ᧉ𝗅 𝖻𝗈ƚ 𝖼𝗈𝗇 𝗋ᧉ𝗌𝗉𝗈𝗇𝗌⍺𝖻ı𝗅ı𝖽⍺𝖽_`,
          ``,
          `‧₊ ᵎᵎ *𝖲𝖤𝖫𝖤CC𝖨Ó𝖭* ⋅˚##`,
          `>  _𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇⍺ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ 𝖽ᧉ𝗌𝖽ᧉ ᧉ𝗅 𝖻𝗈ƚó𝗇 𝗉⍺𝗋⍺ 𝗏ᧉ𝗋 𝗅𝗈𝗌 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌_`,
          ``,
          `*( ᴗ͈ˬᴗ͈ )* ${botName} • 𝖤𝖷𝖤𝖢𝖴𝖳𝖨𝖵𝖤`,
        ];

        const body = bodyLines.join("\n");

        const selectButton = {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "🌸 𝖤𝗅ı𝗀ᧉ 𝖬ᧉ𝗇ú",
            sections: [{
              title: "𝖫ı𝗌ƚ⍺ 𝖽ᧉ 𝖬ᧉ𝗇ú",
              rows: categoryRows,
            }],
          }),
        };
        

        const testiButton = {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "⭐ 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ - Canal",
            url: "https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33",
            merchant_url: "https://whatsapp.com/channel/0029VbD4qs1B4hdauCwffB33",
          }),
        };

        const imageBuffer = fs.readFileSync("./assets/image/rimuru-v2.jpg");

        await sock.sendMessage(
          m.chat,
          {
            image: imageBuffer,
            caption: body,
            footer: `${botName} • 𝖤𝖷𝖤𝖢𝖴𝖳𝖨𝖵𝖤`,
            interactiveButtons: [
              selectButton,
              testiButton,
            ],
          },
          { quoted: m }
        );

        break;
      }
      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["rimuru-mp3"];
      try {
        switch (menuVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
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
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
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
                audio: fs.readFileSync(config.assets["rimuru-mp3"]),
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
                conversation: "𝗋ᧉ𝗉𝗋𝗈𝖽𝗎𝖼ıᧉ𝗇𝖽𝗈 𝗆ú𝗌ı𝖼⍺..."
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(config.assets["rimuru-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          case 7: {
            const qChannel = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: typeof saluranId !== "undefined" ? saluranId : "120363294025983803@newsletter",
              },
              message: {
                conversation: "🔊 𝖱ᧉ𝗉𝗋𝗈𝖽𝗎𝖼ıᧉ𝗇𝖽𝗈 ⍺𝗎𝖽ı𝗈 𝖽ᧉ𝗅 𝗆ᧉ𝗇ú..."
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", audioUrl, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qChannel });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qChannel });
            }
            break;
          }
          case 4:
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
                  orderTitle: `📋 ${totalCmds} 𝖢𝗈𝗆⍺𝗇𝖽𝗈𝗌`,
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
                      newsletterJid: saluranId,
                      newsletterName: saluranName,
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
                  contextInfo: getContextInfo(botConfig, m, thumbBuffer),
                },
                { quoted: getVerifiedQuoted(botConfig) },
              );
            }
            break;
          }
        }
      } catch (e) {
        console.error("[Menu] Error enviando el audio dinámico:", e.message);
      }
    }
  } catch (error) {
    console.error("[Menu] Error en la ejecución del comando:", error.message);
  }
}

export default {
  config: pluginConfig,
  handler,
};
