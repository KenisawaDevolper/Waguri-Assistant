import {
  cacheParticipantLids,
  getCachedJid,
  isLid,
  isLidConverted,
  lidToJid,
} from "../../src/lib/rimuru-lid.js";
import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";
import { createGoodbyeCard } from "../../src/lib/rimuru-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/rimuru-lid.js";
import path from "path";
import fs from "fs";
import te from "../../src/lib/rimuru-error.js";
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
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  return template
    .replace(/{user}/gi, `@${username}`)
    .replace(/{number}/gi, username)
    .replace(/{group}/gi, groupName || "Grupo")
    .replace(/{desc}/gi, groupDesc || "")
    .replace(/{count}/gi, memberCount?.toString() || "0")
    .replace(/{owner}/gi, groupOwner || "Admin")
    .replace(/{date}/gi, now.format("DD/MM/YYYY"))
    .replace(/{time}/gi, now.format("HH:mm"))
    .replace(/{day}/gi, dayId)
    .replace(/{bot}/gi, config.bot?.name || "Waguri")
    .replace(/{prefix}/gi, prefix);
}

const pluginConfig = {
  name: "goodbye",
  alias: ["bye", "leave"],
  category: "group",
  description: "Configura y administra los mensajes automáticos de despedida para los miembros que salen del grupo.",
  usage: ".goodbye <on/off>",
  example: ".goodbye on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function buildGoodbyeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const farewells = [
    `Sayonara`,
    `Hasta luego`,
    `Adiós`,
    `Chao`,
    `See you`,
    `Cuídate`,
    `Oyasumi~`,
  ];
  const quotes = [
    `Espero que tus próximos caminos estén llenos de éxito.`,
    `Gracias por haber formado parte de esta gran comunidad.`,
    `Ojalá nuestros caminos vuelvan a cruzarse en el futuro.`,
    `Las puertas de este lugar siempre estarán abiertas para ti.`,
    `Cuídate mucho, estimado tomodachi.`,
    `Los recuerdos construidos aquí perdurarán siempre.`,
  ];
  const emojis = ["🌙", "👋", "🥀", "💫", "😢", "🤍"];
  const headers = [
    `🌙 Oyasumi~ minna-san...\nHoy un tomodachi se despide de nosotros.\nQue su nuevo viaje esté lleno de dicha.`,
    `🥀 Minna-san...\nUna pequeña despedida tiene lugar hoy.\nGracias por haber caminado junto a nosotros.`,
    `💫 Sayonara~\nNo es un adiós definitivo, solo un hasta luego.\nQue tus días estén llenos de calidez.`,
    `🌌 Minna-san...\nUna estrella se desplaza por el cielo esta noche.\nDeseémosle lo mejor en su camino.`,
  ];
  const farewell = farewells[Math.floor(Math.random() * farewells.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "User";
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");

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

  let msg = `👋🏻 *SAYONARA MIEMBRO* 👋🏻\n\n`;
  msg += `${header}\n`;
  msg += `${emoji} ${farewell}, *@${username}* 🤍\n\n`;
  msg += `📌 *INFO DEL GRUPO*\n`;
  msg += `> 🏠 *Nombre* : ${groupName}\n`;
  msg += `> 👥 *Restantes* : ${memberCount}\n`;
  msg += `> 📅 *Fecha* : ${now.format("DD/MM/YYYY")}\n\n`;
  msg += `💌 *Mensaje*\n> 「 ${quote} 」\n\n🌸 _Hasta la próxima, tomodachi._ 🤍`;

  return msg;
}

async function sendGoodbyeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.goodbye !== true && groupData?.leave !== true) return false;
    
    const goodbyeType = db.setting("goodbyeType") || 1;
    if (groupMeta?.participants) {
      cacheParticipantLids(groupMeta.participants);
    }
    
    let realParticipant = participant;
    const cachedJid = getCachedJid(participant);
    if (cachedJid && !isLidConverted(cachedJid)) {
      realParticipant = cachedJid;
    } else if (isLid(participant)) {
      const lidFormat = participant;
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      } else {
        realParticipant = lidToJid(participant);
      }
    } else if (isLidConverted(participant)) {
      const lidNumber = participant.replace("@s.whatsapp.net", "");
      const lidFormat = lidNumber + "@lid";
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      }
    }

    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "User";
    let ppUrl = "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    
    try {
      ppUrl = (await sock.profilePictureUrl(realParticipant, "image")) || ppUrl;
    } catch {}

    const text = await buildGoodbyeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.goodbyeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );

    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Waguri-Assistant";

    if (goodbyeType === 2) {
      const cardBody = groupData?.goodbyeMsg
        ? resolvePlaceholders(
            groupData.goodbyeMsg,
            userName,
            groupMeta?.subject,
            groupMeta?.desc,
            memberCount,
            groupMeta?.owner?.split("@")[0] || "",
            config.command?.prefix || ".",
          )
        : `Gracias por haber estado en *${groupName}*\nMiembros restantes: ${memberCount}`;

      await sock.sendMessage(groupJid, {
        interactiveMessage: {
          body: {
            text: `👋 *Sayonara* *@${userName}*`,
          },
          footer: { text: config.bot?.name || "Waguri-Assistant" },
          header: { title: "Goodbye", hasMediaAttachment: false },
          carouselMessage: {
            cards: [
              {
                header: {
                  imageMessage: { url: ppUrl },
                },
                body: {
                  text: cardBody,
                },
                footer: { text: config.bot?.name || "Waguri-Assistant" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "👋 Adiós",
                        id: "bye",
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
    } else if (goodbyeType === 3) {
      const textOnly = groupData?.goodbyeMsg
        ? resolvePlaceholders(
            groupData.goodbyeMsg,
            userName,
            groupMeta?.subject,
            groupMeta?.desc,
            memberCount,
            groupMeta?.owner?.split("@")[0] || "",
            config.command?.prefix || ".",
          )
        : `*Sayonara* @${userName} 👋`;

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
    } else if (goodbyeType === 4) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
        },
      });
    } else if (goodbyeType === 5) {
      await sock.sendPreview(
        groupJid,
        {
          caption: "https://goodbye.guys " + text,
          url: "https://goodbye.guys",
          title: `Goodbye de ${groupName}`,
          description: `👋 Sayonara @${userName}!`,
          image: ppUrl,
          previewType: 1,
        },
        {
          contextInfo: {
            mentionedJid: [realParticipant],
          },
        }
      );
    } else if (goodbyeType === 6) {
      await sock.sendMessage(groupJid, {
        video: getAssetBuffer("rimuru-mp4") || { url: "https://files.catbox.moe/k28dhp.mp4" },
        gifPlayback: true,
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
        },
      });
    } else if (goodbyeType === 7) {
      const qFake = {
        key: {
          fromMe: false,
          participant: realParticipant,
          remoteJid: realParticipant,
        },
        message: {
          conversation: `¡Hasta luego a todos! 👋`,
        },
      };

      const media = await prepareWAMessageMedia({
        image: { url: ppUrl },
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
                imageMessage: media.imageMessage,
              },
              body: {
                text: text,
              },
              footer: {
                text: config.bot?.name || "Waguri-Assistant",
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
                      display_text: "👋 Despedida",
                      id: "bye",
                    }),
                  },
                ],
              },
            },
          },
        },
      }, { quoted: qFake, userJid: sock.user.jid });

      await sock.relayMessage(groupJid, msg.message, {
        messageId: msg.key.id,
      });
    } else if (goodbyeType === 8) {
      await sock.sendMessage(groupJid, {
        text: `Goodbye @${userName}, del grupo ${groupName}`,
        mentions: [realParticipant],
      });
    } else {
      let canvasBuffer = null;
      try {
        canvasBuffer = await createGoodbyeCard(
          userName,
          ppUrl,
          groupName,
          memberCount.toLocaleString(),
        );
      } catch (e) {
        console.error("Goodbye Canvas Error:", e.message);
      }

      await sock.sendMessage(groupJid, {
        image: canvasBuffer,
        caption: text,
        mentions: [realParticipant],
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      });
    }
    return true;
  } catch (error) {
    console.error("Goodbye Error:", error);
    return false;
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.goodbye === true;

  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(
        `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este comando global solo puede ser ejecutado por el propietario del bot. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    try { await m.react("🕕"); } catch {}
    
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: true, leave: true });
        count++;
      }
      try { await m.react("✅"); } catch {}
      return m.reply(
        `ꕥ 𝖦𝖮𝖮𝖣𝖡𝖸𝖤 𝖦𝖫𝖮𝖡𝖠𝖫 𝖮𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado :: Activado masivamente\n` +
        `      • Grupos afectados :: *${count}*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de despedidas se ha activado en todos los chats registrados. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    } catch (err) {
      try { await m.react("☢"); } catch {}
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(
        `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este comando global solo puede ser ejecutado por el propietario del bot. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    try { await m.react("🕕"); } catch {}
    
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: false, leave: false });
        count++;
      }
      try { await m.react("✅"); } catch {}
      return m.reply(
        `ꕥ 𝖦𝖮𝖮𝖣𝖡𝖸𝖤 𝖦𝖫𝖮𝖡𝖠𝖫 𝖮𝖥𝖥 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado :: Desactivado masivamente\n` +
        `      • Grupos afectados :: *${count}*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de despedidas se ha desactivado en todos los chats registrados. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    } catch (err) {
      try { await m.react("☢"); } catch {}
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `ꕥ 𝖢𝖮𝖮𝖱𝖣𝖤𝖭𝖠𝖣𝖠𝖲 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado actual :: *✅ ACTIVADO*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de despedidas ya se encuentra habilitado en este grupo.\nUsa \`${m.prefix}goodbye off\` para desactivarlo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    db.setGroup(m.chat, { goodbye: true, leave: true });
    return m.reply(
      `ꕥ 𝖦𝖮𝖮𝖣𝖡𝖸𝖤 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los mensajes de despedida se han activado correctamente en este grupo.\nPersonaliza tu texto con \`${m.prefix}setgoodbye\`. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `ꕥ 𝖢𝖮𝖮𝖱𝖣𝖤𝖭𝖠𝖣𝖠𝖲 𝖸𝖠 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado actual :: *❌ DESACTIVADO*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de despedidas ya se encuentra inactivo en este grupo.\nUsa \`${m.prefix}goodbye on\` para activarlo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    db.setGroup(m.chat, { goodbye: false, leave: false });
    return m.reply(
      `ꕥ 𝖦𝖮𝖮𝖣𝖡𝖸𝖤 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de despedidas se ha desactivado correctamente en este grupo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  return m.reply(
    `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖣𝖤𝖲𝖯𝖤𝖣𝖨𝖣𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Estado en este chat :: *${currentStatus ? "✅ ACTIVADO" : "❌ DESACTIVADO"}*\n\n` +
    `      𓈒 ◌ㅤ──    *𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲*\n` +
    `      • \`${m.prefix}goodbye on\` — Activar despedidas\n` +
    `      • \`${m.prefix}goodbye off\` — Desactivar despedidas\n` +
    `      • \`${m.prefix}goodbye on all\` — Activación global (Owner)\n` +
    `      • \`${m.prefix}goodbye off all\` — Desactivación global (Owner)\n` +
    `      • \`${m.prefix}setgoodbye\` — Configurar mensaje personalizado\n` +
    `      • \`${m.prefix}resetgoodbye\` — Restablecer por defecto\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Utiliza los comandos anteriores para gestionar el flujo de despedidas del grupo. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

export { pluginConfig as config, handler, sendGoodbyeMessage };
