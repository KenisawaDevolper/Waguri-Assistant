import {
  isToxic,
  handleToxicMessage,
  DEFAULT_TOXIC_WORDS,
} from "./antitoxic.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import te from "../../src/lib/rimuru-error.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";

const pluginConfig = {
  name: "notiftag",
  alias: ["notiflabel", "labeltag"],
  category: "group",
  description: "Configura las notificaciones automáticas y filtros de cambios de etiquetas/labels de los miembros.",
  usage: ".notiftag <on / off / on all / off all>",
  example: ".notiftag on",
  isGroup: true,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.notifLabelChange === true;

  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(
        `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta acción global solo puede ser ejecutada por el owner del bot. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    
    try { await m.react("🕕"); } catch {}

    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: true });
        count++;
      }
      
      try { await m.react("✅"); } catch {}

      return m.reply(
        `ꕥ 𝖭𝖮𝖳𝖨𝖥 𝖫𝖠𝖡𝖤𝖫 𝖦𝖫𝖮𝖡𝖠𝖫 𝖮𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Acción :: *Habilitación masiva*\n` +
        `      • Grupoos afectados :: *${count} chats grupales*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las notificaciones de cambio de etiqueta se han activado globalmente. »\n\n` +
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
        `ꕥ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Esta acción global solo puede ser ejecutada por el owner del bot. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    
    try { await m.react("🕕"); } catch {}

    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: false });
        count++;
      }
      
      try { await m.react("✅"); } catch {}

      return m.reply(
        `ꕥ 𝖭𝖮𝖳𝖨𝖥 𝖫𝖠𝖡𝖤𝖫 𝖦𝖫𝖮𝖡𝖠𝖫 𝖮𝖥𝖥 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Acción :: *Deshabilitación masiva*\n` +
        `      • Grupoos afectados :: *${count} chats grupales*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las notificaciones de cambio de etiqueta se han desactivado globalmente. »\n\n` +
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
        `ꕥ 𝖬𝖮́𝖣𝖴𝖫𝖮 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado actual :: *✅ Activado*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las alertas de etiquetas ya se encuentran encendidas en este grupo.\n• Usa \`${m.prefix}notifgantitag off\` para apagarlas. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    
    db.setGroup(m.chat, { notifLabelChange: true });
    
    try { await m.react("✅"); } catch {}

    return m.reply(
      `ꕥ 𝖭𝖮𝖳𝖨𝖥 𝖫𝖠𝖡𝖤𝖫 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Módulo :: *Avisos de modificación de tag activos*\n` +
      `      • Función :: *El bot reportará cuando un miembro reciba o cambie su etiqueta*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Configuración aplicada con éxito para este chat. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `ꕥ 𝖬𝖮́𝖣𝖴𝖫𝖮 𝖸𝖠 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado actual :: *❌ Desactivado*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las alertas de etiquetas ya se encuentran apagadas en este grupo.\n• Usa \`${m.prefix}notifgantitag on\` para encenderlas. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }
    
    db.setGroup(m.chat, { notifLabelChange: false });
    
    try { await m.react("❌"); } catch {}

    return m.reply(
      `ꕥ 𝖭𝖮𝖳𝖨𝖥 𝖫𝖠𝖡𝖤𝖫 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Módulo :: *Avisos de modificación de tag desactivados*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las notificaciones automáticas de cambios de etiquetas han sido suspendidas. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  return m.reply(
    `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖫𝖠𝖡𝖤𝖫𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      • Estado actual :: *${currentStatus ? "✅ Activado" : "❌ Desactivado"}*\n\n` +
    `      𓈒 ◌ㅤ──    *📋 𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖤 𝖢𝖮𝖭𝖳𝖱𝖮𝖫*\n` +
    `      • \`${m.prefix}notiftag on\` — Activar en este grupo\n` +
    `      • \`${m.prefix}notiftag off\` — Desactivar en este grupo\n` +
    `      • \`${m.prefix}notiftag on all\` — Activar globalmente (Owner)\n` +
    `      • \`${m.prefix}notiftag off all\` — Desactivar globalmente (Owner)\n\n` +
    `      𓈒 ◌ㅤ──    *ℹ️ 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖠𝖵𝖨𝖲𝖮𝖲*\n` +
    `      • Detecta cuando un administrador añade, modifica o remueve la etiqueta de un miembro.\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
  );
}

async function handleLabelChange(msg, sock) {
  try {
    const db = getDatabase();
    const protocolMessage = msg.message?.protocolMessage;
    if (!protocolMessage) return false;
    if (protocolMessage.type !== 30) return false;

    const memberLabel = protocolMessage.memberLabel;
    if (!memberLabel) return false;

    const groupJid = msg.key.remoteJid;
    if (!groupJid?.endsWith("@g.us")) return false;

    const groupData = db.getGroup(groupJid) || {};
    const participant = msg.key.participant || msg.participant || "Unknown";
    const label = memberLabel.label || "";

    if (groupData.antitoxic && label && label.trim()) {
      try {
        const toxicWords = groupData.toxicWords || DEFAULT_TOXIC_WORDS;
        const toxicCheck = isToxic(label, toxicWords);
        if (toxicCheck.toxic) {
          await sock.sendText(
            groupJid,
            `ꕥ 𝖥𝖨𝖫𝖳𝖱𝖮 𝖠𝖭𝖳𝖨𝖳𝖮𝖷𝖨𝖢 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Usuario :: *@${participant.split("@")[0]}*\n` +
            `      • Alerta :: *¡La etiqueta establecida contiene términos prohibidos!*\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            null,
            {
              mentions: [participant],
              contextInfo: {
                ...saluranCtx(),
                mentionedJid: [participant],
              },
            },
          );
          return true;
        }
      } catch {}
    }

    if (groupData.notifLabelChange !== true) return false;

    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch {}

    let notifText = "";
    if (label && label.trim()) {
      notifText = `ꕥ 𝖬𝖮𝖣𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖫𝖠𝖡𝖤𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                  `      • Usuario :: *@${participant.split("@")[0]}*\n` +
                  `      • Nueva etiqueta :: *${label}*\n\n` +
                  `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
    } else {
      notifText = `ꕥ 𝖬𝖮𝖣𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖫𝖠𝖡𝖤𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                  `      • Usuario :: *@${participant.split("@")[0]}*\n` +
                  `      • Estado :: *Etiqueta eliminada*\n\n` +
                  `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
    }

    await sock.sendText(groupJid, notifText, null, {
      mentions: [participant],
      contextInfo: {
        ...saluranCtx(),
        mentionedJid: [participant],
      },
    });

    return true;
  } catch (error) {
    console.error("[NotifLabelChange] Error:", error.message);
    return false;
  }
}

export { pluginConfig as config, handler, handleLabelChange };
