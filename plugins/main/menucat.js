import * as botmodePlugin from "../group/botmode.js";
import { getCasesByCategory } from "../../case/rimuru.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin";
import config from "../../config.js";
import axios from "axios";
import sharp from "sharp";
import {
  getCommandsByCategory,
  getCategories,
  getPlugin,
} from "../../src/lib/rimuru-plugins.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import { getTimeGreeting } from "../../src/lib/rimuru-formatter.js";
import fs from "fs";

const pluginConfig = {
  name: "menucat",
  alias: ["mc"],
  category: "main",
  description: "Muestra los comandos de una categoría específica",
  usage: ".menucat <categoría>",
  example: ".menucat tools",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  group: "👥",
  download: "📥",
  search: "🔍",
  tools: "🛠️",
  sticker: "🖼️",
  ai: "🤖",
  media: "🎬",
  info: "ℹ️",
  user: "📊",
  ephoto: "🎨",
  random: "🎲",
  canvas: "🎨",
  premium: "💎",
  convert: "🔄",
  economy: "💰"
};

function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
    i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
    q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
    y: "ʏ", z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}

function createBracketBox(emoji, title, lines = []) {
  let text = `« ¿ ${emoji} \`${title}\` ── 𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ? »\n\n`;
  for (const line of lines) {
    text += `      ${emoji}   𓈒 ◌ㅤ──    ${toSmallCaps(line)}\n`;
  }
  text += `\n> ᴡ⍺ɢᴜʀı ⍺𝗌𝗌ı𝗌ƚ⍺ɴƚ • ᴋᴇɴı𝗌⍺ᴡ⍺ᴅᴇᴠ ツ\n\n`;
  return text;
}

function getCommandSymbols(cmdName) {
  const plugin = getPlugin(cmdName);
  if (!plugin || !plugin.config) return "";
  const symbols = [];
  if (plugin.config.isOwner) symbols.push("Ⓞ");
  if (plugin.config.isPremium) symbols.push("ⓟ");
  if (plugin.config.limit && plugin.config.limit > 0) symbols.push("Ⓛ");
  if (plugin.config.isAdmin) symbols.push("Ⓐ");
  if (plugin.config.isGroup) symbols.push("Ⓖ");
  if (plugin.config.isPrivate) symbols.push("Ⓟ");
  return symbols.length > 0 ? " " + symbols.join(" ") : "";
}

async function handler(m, { sock, db }) {
  const prefix = config.command?.prefix || ".";
  const args = m.args || [];
  const categoryArg = args[0]?.toLowerCase();
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();
  const savedVariant = db.setting("menucatVariant");
  const menucatVariant = savedVariant || config.ui?.menucatVariant || 2;
  const greeting = getTimeGreeting();

  if (!categoryArg) {
    const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
    const botModo = groupData.botModo || "md";

    let modeExcludeMap = {
      md: ["panel", "pushkontak", "store"],
      store: ["panel", "pushkontak", "jpm", "ephoto", "cpanel"],
      pushkontak: ["panel", "store", "jpm", "ephoto", "cpanel"],
      cpanel: ["pushkontak", "store", "jpm", "ephoto"],
    };

    try {
      if (botmodePlugin && botmodePlugin.MODES) {
        const modes = botmodePlugin.MODES;
        modeExcludeMap = {};
        for (const [key, val] of Object.entries(modes)) {
          if (val.excludeCategories)
            modeExcludeMap[key] = val.excludeCategories;
        }
      }
    } catch (e) { }

    const excludeCategories = modeExcludeMap[botModo] || modeExcludeMap.md;

    const categoryOrder = [
      "owner", "main", "download", "search", "sticker", 
      "group", "user", "premium", "ephoto", "gacha"
    ];

    const allCats = [
      ...new Set([...categories, ...Object.keys(casesByCategory)]),
    ];

    const sortedCats = allCats.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    const visibleCats = sortedCats.filter((cat) => {
      if (cat === "owner" && !m.isOwner) return false;
      if (excludeCategories.includes(cat.toLowerCase())) return false;
      const total =
        (commandsByCategory[cat] || []).length +
        (casesByCategory[cat] || []).length;
      return total > 0;
    });

    let txt = "";
    txt += createBracketBox("🤖", "LEYENDA", [
      "Ⓞ = solo para owner",
      "ⓟ = solo para premium",
      "Ⓛ = requiere límite",
      "Ⓐ = solo para admins",
      "Ⓖ = solo en grupos",
      "Ⓟ = solo chat privado",
    ]);

    for (const cat of visibleCats) {
      const pluginCmds = commandsByCategory[cat] || [];
      const caseCmds = casesByCategory[cat] || [];
      const allCmds = [...pluginCmds, ...caseCmds];
      if (allCmds.length === 0) continue;
      const emoji = CATEGORY_EMOJIS[cat] || "📋";
      const categoryName = toSmallCaps(cat);
      const commandLines = allCmds.map((cmd) => {
        const symbols = getCommandSymbols(cmd);
        return `${prefix}${cmd}${symbols}`;
      });
      txt += createBracketBox(emoji, categoryName, commandLines);
    }

    try {
      switch (menucatVariant) {
        case 1:
          await m.reply(txt);
          break;
        case 2: {
          const media = await prepareWAMessageMedia(
            {
              image: fs.readFileSync(config.assets["waguri2"]),
            },
            { upload: sock.waUploadToServer },
          );
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
                      imageMessage: media.imageMessage,
                    },
                    body: {
                      text: txt,
                    },
                    footer: {
                      text: "𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇 𝖻𝗈ƚó𝗇 ⍺𝖻⍺j𝗈 𝗉⍺𝗋⍺ ᥎𝗈𝗅᥎ᧉ𝗋 ⍺𝗅 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅",
                    },
                    contextInfo: {
                      isForwarded: true,
                      forwardingScore: 9,
                      participant: "0@s.whatsapp.net",
                      quotedMessage: {
                        conversation: `${config.bot?.name}`,
                      },
                      mentionedJid: [`${m.sender}`],
                    },
                    nativeFlowMessage: {
                      messageParamsJson: JSON.stringify({
                        limited_time_offer: {
                          text: `${greeting}`,
                          url: "Hola",
                          copy_code: "𝖼𝗋ᧉ⍺𝖽𝗈 𝗉𝗈𝗋 " + config.bot?.developer,
                          expiration_time: Date.now() + 1000000,
                        },
                      }),
                      buttons: [
                        {
                          name: "quick_reply",
                          buttonParamsJson: JSON.stringify({
                            display_text: "🌸 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅",
                            id: m.prefix + "menu",
                          }),
                        },
                      ],
                    },
                  },
                },
              },
            },
            {},
          );
          break;
        }
        case 5: {
          const weatherCode = {
            0: "☀️ 𝖽ᧉ𝗌𝗉ᧉj⍺𝖽𝗈", 1: "🌤️ ⍺𝗅𝗀𝗈 𝗇𝗎𝖻𝗅⍺𝖽𝗈", 2: "⛅ 𝗇𝗎𝖻𝗅⍺𝖽𝗈", 3: "☁️ 𝗆𝗎𝗒 𝗇𝗎𝖻𝗅⍺𝖽𝗈", 
            45: "🌫️ 𝗇ıᧉ𝖻𝗅⍺", 48: "🌫️ 𝗇ıᧉ𝖻𝗅⍺ 𝖽ᧉ𝗇𝗌⍺", 51: "🌦️ 𝗅𝗅𝗈᥎ız𝗇⍺", 61: "🌧️ 𝗅𝗅𝗈᥎ı⍺ 𝗅ı𝗀ᧉ𝗋⍺", 
            63: "🌧️ 𝗅𝗅𝗈᥎ı⍺", 65: "⛈️ 𝗅𝗅𝗈᥎ı⍺ ı𝗇ƚᧉ𝗇𝗌⍺", 80: "🌦️ 𝗅𝗅𝗈᥎ı⍺ ⍺ı𝗌𝗅⍺𝖽⍺", 95: "⛈️ ƚ𝗈𝗋𝗆ᧉ𝗇ƚ⍺ ᧉ𝗅é𝖼ƚ𝗋ı𝖼⍺"
          };

          const fetchWeather = async (cityName = "Ciudad de México") => {
            try {
              const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
              const loc = geo.data.results?.[0];
              if (!loc) return "𝖼𝗅ı𝗆⍺ 𝗇𝗈 𝖽ı𝗌𝗉𝗈𝗇ı𝻥𝗅ᧉ";
              const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`);
              const current = res.data.current;
              const kondisi = weatherCode[current.weather_code] || "🌍 𝖽ᧉ𝗌𝖼𝗈𝗇𝗈𝼼ı𝖽𝗈";
              return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`;
            } catch {
              return "𝖼𝗅ı𝗆⍺ 𝗇𝗈 𝖽ı𝗌𝗉𝗈𝗇ı𝖻𝗅ᧉ";
            }
          };

          const weatherText = await fetchWeather();
          const thumbnail = await sharp(fs.readFileSync(config.assets["waguri"])).resize(300, 300).toBuffer();
          const qOrder = {
            key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: m.sender },
            message: { locationMessage: { degreesLatitude: 0, degreesLongitude: 0, name: weatherText, jpegThumbnail: thumbnail } }
          };
          const media4 = await prepareWAMessageMedia({ video: fs.readFileSync(config.assets["waguri-mp4"]), gifPlayback: true }, { upload: sock.waUploadToServer });
          const msg4 = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
              message: {
                messageContextInfo: {},
                interactiveMessage: {
                  header: { title: "", subtitle: "", hasMediaAttachment: true, videoMessage: media4.videoMessage },
                  footer: { text: `𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇 𝖻𝗈ƚó𝗇 ⍺ 𝖼𝗈𝗇ƚı𝗇𝗎⍺𝖼ıó𝗇` },
                  body: { text: txt },
                  contextInfo: {
                    mentionedJid: [m.sender],
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
                      newsletterName: config.saluran?.name || config.bot?.name || "Waguri Assistant",
                      serverMessageId: 127,
                    },
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: { text: `${greeting}`, url: "Hola", expiration_time: Date.now() + 10000 },
                      bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: "𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇⍺ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺", button_title: "🌸 ᥎ᧉ𝗋 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺𝗌" },
                      tap_target_configuration: { title: " Waguri ", description: "𝗐⍺𝗀𝗎ɾı ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ 𝖻𝗈ƚ", canonical_url: "https://stellarwa.xyz", domain: "stellarwa.xyz", button_index: 0 },
                    }),
                    buttons: [
                      { name: "", buttonParamsJson: "" },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ display_text: "🌸 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅", id: m.prefix + "menu" })
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
        default:
          await m.reply(txt);
          break;
      }
    } catch (err) {
      await m.reply(txt);
    }
    return;
  }

  const allCategories = [
    ...new Set([...categories, ...Object.keys(casesByCategory)]),
  ];
  const matchedCat = allCategories.find((c) => c.toLowerCase() === categoryArg);

  if (!matchedCat) {
    return m.reply(
      `❌ *𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ 𝗇𝗈 ᧉ𝗇𝖼𝗈𝗇ƚ𝗋⍺𝖽⍺*\n\n> 𝗅⍺ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ \`${categoryArg}\` 𝗇𝗈 ᧉ𝑑ı𝗌ƚᧉ.\n> ᧉ𝗌𝖼𝗋ı𝖻ᧉ \`${prefix}menucat\` 𝗉⍺𝗋⍺ ᥎ᧉ𝗋 𝗅⍺ 𝗅ı𝗌ƚ⍺ 𝖽ᧉ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺𝗌.`,
    );
  }

  if (matchedCat === "owner" && !m.isOwner) {
    return m.reply(`❌ *⍺𝖼𝖼ᧉ𝗌𝗈 𝖽ᧉ𝗇ᧉ𝗀⍺𝖽𝗈*\n\n> ᧉ𝗌ƚ⍺ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ ᧉ𝗌 𝗌𝗈𝗅𝗈 𝗉⍺𝗋⍺ ᧉ𝗅 𝗈𝗐𝗇ᧉ𝗋.`);
  }

  const pluginCommands = commandsByCategory[matchedCat] || [];
  const caseCommands = casesByCategory[matchedCat] || [];
  const allCommands = [...pluginCommands, ...caseCommands];

  if (allCommands.length === 0) {
    return m.reply(
      `❌ *𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ ᥎⍺𝖼í⍺*\n\n> 𝗅⍺ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺ \`${matchedCat}\` 𝗇𝗈 ƚıᧉ𝗇ᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌.`,
    );
  }

  const emoji = CATEGORY_EMOJIS[matchedCat] || "📁";
  const categoryName = toSmallCaps(matchedCat);
  const commandLines = allCommands.map((cmd) => {
    const symbols = getCommandSymbols(cmd);
    return `${prefix}${cmd}${symbols}`;
  });

  let txt = ``;
  txt += createBracketBox(emoji, categoryName, commandLines);
  txt += `ƚ𝗈ƚ⍺𝗅: \`${allCommands.length}\` 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌`;
  if (caseCommands.length > 0) {
    txt += `\n(${pluginCommands.length} 𝗉𝗅𝗎𝗀ı𝗇 + ${caseCommands.length} 𝖼⍺𝗌ᧉ)`;
  }
  
  try {
    switch (menucatVariant) {
      case 1:
        await m.reply(txt);
        break;
      case 2: {
        const media = await prepareWAMessageMedia(
          {
            image: fs.readFileSync(config.assets["waguri2"]),
          },
          { upload: sock.waUploadToServer },
        );
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
                    imageMessage: media.imageMessage,
                  },
                  body: {
                    text: txt,
                  },
                  footer: {
                    text: "𝗌ᧉ𝗅ᧉ𝖼𝖼ı𝗈𝗇⍺ 𝗎𝗇 𝖻𝗈ƚó𝗇 ⍺𝖻⍺j𝗈 𝗉⍺𝗋⍺ ᥎𝗈𝗅᥎ᧉ𝗋 ⍺𝗅 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅",
                  },
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${config.bot?.name}`,
                    },
                    mentionedJid: [`${m.sender}`],
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hola",
                        copy_code: "𝖼𝗋ᧉ⍺𝖽𝗈 𝗉𝗈𝗋 " + config.bot?.developer,
                        expiration_time: Date.now() + 1000000,
                      },
                    }),
                    buttons: [
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "📂 ᥎𝗈𝗅᥎ᧉ𝗋 ⍺ 𝖼⍺ƚᧉ𝗀𝗈𝗋í⍺𝗌",
                          id: m.prefix + "menucat",
                        }),
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🌸 𝗆ᧉ𝗇ú 𝗉𝗋ı𝗇𝖼ı𝗉⍺𝗅",
                          id: m.prefix + "menu",
                        }),
                      },
                    ],
                  },
                },
              },
            },
          },
          {},
        );
        break;
      }
      default:
        await m.reply(txt);
        break;
    }
  } catch (err) {
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
