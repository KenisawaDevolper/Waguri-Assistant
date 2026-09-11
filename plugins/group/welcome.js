import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import { createWideDiscordCard } from "../../src/lib/rimuru-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/rimuru-lid.js";
import path from "path";
import fs from "fs";
import axios from "axios";
import te from "../../src/lib/rimuru-error.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";
import { getAssetBuffer } from "../../src/lib/rimuru-asset-manager.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin";

function resolvePlaceholders(
  template,
  username,
  groupName,
  groupDesc,
  memberCount,
  groupOwner,
  prefix,
) {
  const now = moment().tz("America/Argentina/Tucuman");
  const dayNames = {
    Sunday: "𝖣𝗈𝗆ı𝗇𝗀𝗈",
    Monday: "𝖫𝗎𝗇ᧉ𝗌",
    Tuesday: "𝖬⍺𝗋ƚᧉ𝗌",
    Wednesday: "𝖬ıé𝗋𝖼𝗈𝗅ᧉ𝗌",
    Thursday: "𝖩𝗎ᧉ᥎ᧉ𝗌",
    Friday: "𝖵ıᧉ𝗋𝗇ᧉ𝗌",
    Saturday: "𝖲á𝖻⍺𝖽𝗈",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  return template
    .replace(/{user}/gi, `@${username}`)
    .replace(/{number}/gi, username)
    .replace(/{group}/gi, groupName || "𝖦𝗋𝗎𝗉𝗈")
    .replace(/{desc}/gi, groupDesc || "")
    .replace(/{count}/gi, memberCount?.toString() || "0")
    .replace(/{owner}/gi, groupOwner || "𝖠𝖽𝗆ı𝗇")
    .replace(/{date}/gi, now.format("DD/MM/YYYY"))
    .replace(/{time}/gi, now.format("HH:mm"))
    .replace(/{day}/gi, dayId)
    .replace(/{bot}/gi, config.bot?.name || "𝑊⍺ց𝗎𝗋ı")
    .replace(/{prefix}/gi, prefix);
}

const pluginConfig = {
  name: "welcome",
  alias: ["wc"],
  category: "group",
  description: "𝖢𝗈𝗇𝖿ı𝗀𝗎𝗋⍺ ᧉ𝗅 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ 𝖽ᧉ 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ 𝗉⍺𝗋⍺ ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈",
  usage: ".welcome <on/off>",
  example: ".welcome on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

// eslint-disable-next-line require-await
async function buildWelcomeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const greetings = [
    `¡𝖠𝗅 𝖿ı𝗇 𝗅𝗅ᧉ𝗀⍺𝗌ƚᧉ!`,
    `¡𝖡ıᧉ𝗇᥎ᧉ𝗇ı𝖽𝗈/⍺!`,
    `¡𝖧𝗈𝗅⍺!`,
    `¡𝖰𝗎é 𝖻𝗎ᧉ𝗇𝗈 𝗏ᧉ𝗋ƚᧉ!`,
    `¡𝖸𝗈𝗄𝗈𝗌𝗈~!`,
    `¡𝖮𝗁⍺𝗒𝗈𝗎~!`,
  ];
  const quotes = [
    `¡𝖭𝗈 𝗌ᧉ⍺𝗌 𝗎𝗇 𝗅ᧉ𝖼ƚ𝗈𝗋 𝖿⍺𝗇ƚ⍺𝗌𝗆⍺!`,
    `¡𝖯𝗈𝗇ƚᧉ 𝖼ó𝗆𝗈𝖽𝗈/⍺, ᧉ𝗌ƚá𝗌 ᧉ𝗇 𝖼⍺𝗌⍺!`,
    `¡𝖲ı 𝗇𝗈 𝗌⍺𝖻ᧉ𝗌 𝗊𝗎é 𝖽ᧉ𝖼ı𝗋, 𝗌𝗈𝗅𝗈 𝗌⍺𝗅𝗎𝖽⍺!`,
    `¡𝖯𝗋ᧉ𝗉á𝗋⍺ƚᧉ 𝗉⍺𝗋⍺ 𝖽ıvᧉ𝗋ƚı𝗋ƚᧉ!`,
    `¡𝖭𝗈 ƚᧉ𝗇𝗀⍺𝗌 𝗉ᧉ𝗇⍺, ⍺𝗊𝗎í 𝗍𝗈𝖽𝗈𝗌 𝗌𝗈𝗆𝗈𝗌 ⍺𝗆ı𝗀𝗈𝗌!`,
  ];
  const emojis = ["🎐", "🌸", "✨", "💫", "🪸", "🔥", "💖"];
  const headers = [
    `🎐 ¡𝖮𝗁⍺𝗒𝗈𝗎~ 𝗆ı𝗇𝗇⍺-𝗌⍺𝗇!\n𝖧𝗈𝗒 𝗍ᧉ𝗇ᧉ𝗆𝗈𝗌 𝗎𝗇 𝗇𝗎ᧉ𝗏𝗈 𝗍𝗈𝗆𝗈𝖽⍺𝖼𝗁ı 🌱\n¡𝖣é𝗆𝗈𝗌𝗅ᧉ 𝗅⍺ 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ 𝗃𝗎𝗇ƚ𝗈𝗌~!`,
    `🌸 ¡𝖮𝗁⍺𝗒𝗈𝗎 𝗆ı𝗇𝗇⍺-𝗌⍺𝗇!\n𝖴𝗇 𝗇𝗎ᧉ𝗏𝗈 ⍺𝗆ı𝗀𝗈 𝗌ᧉ 𝗁⍺ 𝗎𝗇ı𝖽𝗈 ✨\n¡𝖤𝗌𝗉ᧉ𝗋𝗈 𝗊𝗎ᧉ ƚᧉ 𝗌ıᧉ𝗇ƚ⍺𝗌 𝖼ó𝗆𝗈𝖽𝗈 𝗒 𝗉⍺𝗋ƚı𝖼ı𝗉ᧉ𝗌~!`,
    `✨ ¡𝖮𝗁⍺𝗒𝗈𝗎~!\n𝖴𝗇 𝗇𝗎ᧉ𝗏𝗈 𝗍𝗈𝗆𝗈𝖽⍺𝖼𝗁ı 𝗅𝗅ᧉ𝗀⍺ 𝖼𝗈𝗇 𝗇𝗎ᧉ𝗏⍺𝗌 ᥎ı𝖻𝗋⍺𝗌 💫\n¡𝖸𝗈𝗋𝗈𝗌𝗁ı𝗄𝗎 𝗇ᧉ~ ⍺ 𝖽ı᥎ᧉ𝗋ƚı𝗋𝗌ᧉ!`,
    `🪸 ¡𝖮𝗁⍺𝗒𝗈𝗎 𝗆ı𝗇𝗇⍺-𝗌⍺𝗇!\n𝖤𝗌ƚᧉ 𝗀𝗋𝗎𝗉𝗈 𝗌𝗎𝗆⍺ 𝗎𝗇 𝗇𝗎ᧉ𝗏𝗈 𝗆ıᧉ𝗆𝖻𝗋𝗈 ⍺ 𝗅⍺ 𝖿⍺𝗆ı𝗅ı⍺ 🤍\n¡𝖳⍺𝗇𝗈𝗌𝗁ıı 𝗃ı𝗄⍺𝗇 𝗈 ı𝗌𝗌𝗁𝗈 𝗇ı 𝗌𝗎𝗀𝗈𝗌𝗈 𝗇ᧉ~!`,
  ];
  
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "User";
  const now = moment().tz("America/Argentina/Tucuman");
  
  if (customMsg) {
    return resolvePlaceholders(
      customMsg,
      username,
      groupName,
      groupDesc,
      memberCount,
      groupOwner,
      prefix,
    );
  }
  
  let msg = `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n`;
  msg += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖡𝖨𝖤𝖭𝖵𝖤𝖭𝖨𝖣𝖮/𝖠* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`;
  msg += `> ${header}\n\n`;
  msg += `      ${emoji}   𓈒 ◌ㅤ──    ${greeting}, *@${username}* 💫\n\n`;
  msg += `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖨𝖭𝖥𝖮 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯𝖮* 🌸\n`;
  msg += `      🏠   𓈒 ◌ㅤ──    *𝖭𝗈𝗆𝖻𝗋ᧉ* : ${groupName}\n`;
  msg += `      👥   𓈒 ◌ㅤ──    *𝖬ıᧉ𝗆𝖻𝗋𝗈𝗌* : ${memberCount}\n`;
  msg += `      📅   𓈒 ◌ㅤ──    *𝖥ᧉ𝖼𝗁⍺* : ${now.format("DD/MM/YYYY")}\n`;

  if (groupDesc) {
    msg += `\n      📝   𓈒 ◌ㅤ──    *𝖣ᧉ𝗌𝖼𝗋ı𝗉𝖼ıó𝗇*\n> ❝ ${groupDesc.slice(0, 120)}${groupDesc.length > 120 ? "..." : ""} ❞\n`;
  }

  msg += `\n✨ *𝖳ı𝗉 𝖽ᧉ𝗅 𝖣í⍺*\n> 「 ${quote} 」\n\n🌸 _¡𝖸𝗈𝗋𝗈𝗌𝗁ı𝗄𝗎 𝗇ᧉ~ ᧉ𝗌𝗉ᧉ𝗋𝗈 𝗊𝗎ᧉ ƚᧉ 𝗌ıᧉ𝗇ƚ⍺𝗌 𝖼ó𝗆𝗈𝖽𝗈!_ 🤍`;

  return msg;
}

async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.welcome !== true) return false;
    
    const welcomeType = db.setting("welcomeType") || 1;
    const realParticipant = resolveAnyLidToJid(
      participant,
      groupMeta?.participants || [],
    );
    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "𝖦𝗋𝗎𝗉𝗈";
    let userName = realParticipant?.split("@")[0] || "User";
    let ppUrl =
      "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = await sock.profilePictureUrl(realParticipant, "image");
    } catch { }
    
    const text = await buildWelcomeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.welcomeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );
    
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "𝑊⍺ց𝗎𝗋ı";
    
    if (welcomeType === 2) {
      const cardBody = groupData?.welcomeMsg
        ? resolvePlaceholders(
          groupData.welcomeMsg,
          userName,
          groupMeta?.subject,
          groupMeta?.desc,
          memberCount,
          groupMeta?.owner?.split("@")[0] || "",
          config.command?.prefix || ".",
        )
        : `¡𝖡ıᧉ𝗇᥎ᧉ𝗇ı𝖽𝗈 ⍺𝗅 𝗀𝗋𝗎𝗉𝗈 *${groupName}*! 🎉\n𝖬ıᧉ𝗆𝖻𝗋𝗈 𝗇º ${memberCount}`;
      await sock.sendMessage(groupJid, {
        interactiveMessage: {
          body: {
            text: `👋 ¡𝖧𝗈𝗅⍺ *@${userName}*!`,
          },
          footer: { text: config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ" },
          header: { title: "Welcome", hasMediaAttachment: false },
          carouselMessage: {
            cards: [
              {
                header: {
                  imageMessage: { url: ppUrl },
                },
                body: {
                  text: cardBody,
                },
                footer: { text: config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "👋 ¡𝖧𝗈𝗅⍺ @" + userName + "!",
                        id: "hi",
                      }),
                    },
                  ],
                },
              },
            ],
            messageVersion: 1,
            carouselCardType: 1,
          },
          contextInfo: {
            ...saluranCtx(),
            mentionedJid: [realParticipant],
          },
        },
      });
    } else if (welcomeType === 3) {
      const textOnly = groupData?.welcomeMsg
        ? resolvePlaceholders(
          groupData.welcomeMsg,
          userName,
          groupMeta?.subject,
          groupMeta?.desc,
          memberCount,
          groupMeta?.owner?.split("@")[0] || "",
          config.command?.prefix || ".",
        )
        : `*¡𝖧𝗈𝗅⍺!* @${userName} 👋\n¡𝖡ıᧉ𝗇᥎ᧉ𝗇ı𝖽𝗈/⍺ ⍺𝗅 𝗀𝗋𝗎𝗉𝗈 *${groupName}*! 🌸`;
      await sock.sendMessage(groupJid, {
        text: textOnly,
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterName: config?.saluran?.name,
            newsletterJid: config?.saluran?.id,
          },
        },
      });
    } else if (welcomeType === 4) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
        },
      });
    } else if (welcomeType === 5) {
      await sock.sendPreview(
        groupJid,
        {
          caption: "https://welcome.guys " + text,
          url: "https://welcome.guys",
          title: `Welcome to ${groupName}`,
          description: `👋 ¡𝖧𝗈𝗅⍺ ${userName}!`,
          image: ppUrl,
          previewType: 0,
        },
        {
          contextInfo: {
            mentionedJid: [realParticipant],
          }
        }
      );
    } else if (welcomeType === 6) {
      await sock.sendMessage(groupJid, {
        video: getAssetBuffer("rimuru-mp4") || { url: "https://files.catbox.moe/k28dhp.mp4" },
        gifPlayback: true,
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
        }
      });
    } else if (welcomeType === 7) {
      const qFake = {
        key: {
          fromMe: false,
          participant: realParticipant,
          remoteJid: realParticipant
        },
        message: {
          conversation: `¡𝖧𝗈𝗅⍺ ⍺ 𝗍𝗈𝖽𝗈𝗌! 👋`
        }
      };

      const media = await prepareWAMessageMedia({
        image: { url: ppUrl }
      }, { upload: sock.waUploadToServer });

      const msg = generateWAMessageFromContent(groupJid, {
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
                text: text
              },
              footer: {
                text: config.bot?.name || "𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ"
              },
              contextInfo: {
                mentionedJid: [realParticipant],
                isForwarded: true,
                forwardingScore: 9,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: saluranId,
                  newsletterName: saluranName,
                  serverMessageId: 127,
                },
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "👋 ¡𝖧𝗈𝗅⍺!",
                      id: "hi"
                    })
                  }
                ]
              }
            }
          }
        }
      }, { quoted: qFake, userJid: sock.user.jid });

      await sock.relayMessage(groupJid, msg.message, {
        messageId: msg.key.id,
      });
    } else if (welcomeType === 8) {
      await sock.sendMessage(groupJid, {
        text: `¡𝖧𝗈𝗅⍺ @${userName}, 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽𝗈/⍺ ⍺𝗅 𝗀𝗋𝗎𝗉𝗈 ${groupName}!`,
        mentions: [realParticipant],
      });
    } else {
      await sock.sendMessage(groupJid, {
        text: text,
        mentions: [realParticipant],
      });
    }
    return true;
  } catch (error) {
    console.error("Welcome Error:", error);
    return false;
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.welcome === true;
  
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(config.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `✅ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖦𝖫𝖮𝖡𝖠𝖫 𝖮𝖭*\n\n` +
        `      🌐   𓈒 ◌ㅤ──    _¡𝖡ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ ⍺𝖼ƚı᥎⍺𝖽⍺ ᧉ𝗇 *${count}* 𝗀𝗋𝗎𝗉𝗈𝗌!_\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(config.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `❌ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖦𝖫𝖮𝖡𝖠𝖫 𝖮𝖥𝖥*\n\n` +
        `      🌐   𓈒 ◌ㅤ──    _¡𝖡ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝖽⍺ ᧉ𝗇 *${count}* 𝗀𝗋𝗎𝗉𝗈𝗌!_\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `⚠️ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮*\n\n` +
        `      ✅   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈*: 𝖮𝖭\n` +
        `      💡   𓈒 ◌ㅤ──    _¡𝖫⍺ 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ 𝗒⍺ ᧉ𝗌ƚá ⍺𝖼ƚı᥎⍺ ᧉ𝗇 ᧉ𝗌ƚᧉ 𝗀𝗋𝗎𝗉𝗈!_\n\n` +
        `> 𝖴𝗌⍺ \`${m.prefix}welcome off\` 𝗉⍺𝗋⍺ 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝗋𝗅⍺.\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    }
    db.setGroup(m.chat, { welcome: true });
    return m.reply(
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
      `✅ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮*\n\n` +
      `      ✨   𓈒 ◌ㅤ──    _¡𝖬ᧉ𝗇𝗌⍺𝗃ᧉ 𝖽ᧉ 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ ⍺𝖼ƚı᥎⍺𝖽𝗈 𝖼𝗈𝗇 é𝗑ıƚ𝗈!_\n` +
      `      👥   𓈒 ◌ㅤ──    _𝖫𝗈𝗌 𝗇𝗎ᧉ᥎𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝗌ᧉ𝗋á𝗇 𝗌⍺𝗅𝗎𝖽⍺𝖽𝗈𝗌 ⍺𝗎ƚ𝗈𝗆áƚı𝖼⍺𝗆ᧉ𝗇ƚᧉ._\n\n` +
      `> 𝖴𝗌⍺ \`${m.prefix}setwelcome\` 𝗉⍺𝗋⍺ 𝗎𝗇 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ 𝗉ᧉ𝗋𝗌𝗈𝗇⍺𝗅ı𝗓⍺𝖽𝗈.\n\n` +
      `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
    );
  }
  
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `⚠️ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖸𝖠 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮*\n\n` +
        `      ❌   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈*: 𝖮𝖥𝖥\n` +
        `      💡   𓈒 ◌ㅤ──    _¡𝖫⍺ 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ 𝗒⍺ ᧉ𝗌ƚ⍺𝖻⍺ 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝖽⍺ ⍺𝗊𝗎í!_\n\n` +
        `> 𝖴𝗌⍺ \`${m.prefix}welcome on\` 𝗉⍺𝗋⍺ ⍺𝖼ƚı᥎⍺𝗋𝗅⍺.\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    }
    db.setGroup(m.chat, { welcome: false });
    return m.reply(
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
      `❌ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮*\n\n` +
      `      🔇   𓈒 ◌ㅤ──    _¡𝖬ᧉ𝗇𝗌⍺𝗃ᧉ 𝖽ᧉ 𝖻ıᧉ𝗇᥎ᧉ𝗇ı𝖽⍺ 𝖽ᧉ𝗌⍺𝖼ƚı᥎⍺𝖽𝗈 𝖼𝗈𝗇 é𝗑ıƚ𝗈!_\n` +
      `      👥   𓈒 ◌ㅤ──    _𝖫𝗈𝗌 𝗇𝗎ᧉ᥎𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝗒⍺ 𝗇𝗈 𝗌ᧉ𝗋á𝗇 𝗌⍺𝗅𝗎𝖽⍺𝖽𝗈𝗌._\n\n` +
      `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
    );
  }
  
  m.reply(
    `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖶𝖤𝖫𝖢𝖮𝖬𝖤 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      ✨   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈* : ${currentStatus ? "✅ 𝖮𝖭" : "❌ 𝖮𝖥𝖥"}\n\n` +
    `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲* 🌸\n` +
    `      🔘   𓈒 ◌ㅤ──    \`${m.prefix}welcome on\`\n` +
    `      🔘   𓈒 ◌ㅤ──    \`${m.prefix}welcome off\`\n` +
    `      🌐   𓈒 ◌ㅤ──    \`${m.prefix}welcome on all\` _(𝗈𝗐𝗇ᧉ𝗋)_\n` +
    `      🌐   𓈒 ◌ㅤ──    \`${m.prefix}welcome off all\` _(𝗈𝗐𝗇ᧉ𝗋)_\n` +
    `      📝   𓈒 ◌ㅤ──    \`${m.prefix}setwelcome\`\n` +
    `      🔄   𓈒 ◌ㅤ──    \`${m.prefix}resetwelcome\`\n\n` +
    `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
  );
}

export { pluginConfig as config, handler, sendWelcomeMessage };
