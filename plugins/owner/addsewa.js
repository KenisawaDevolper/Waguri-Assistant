import config from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import * as timeHelper from "../../src/lib/rimuru-time.js";
import fs from "fs";
import te from "../../src/lib/rimuru-error.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";
const pluginConfig = {
  name: "addsewa",
  alias: ["sewaadd", "tambahsewa"],
  category: "owner",
  description: "Añadir grupo a la lista de alquiler + auto-join",
  usage: ".addsewa <link/id del grupo> <duración>",
  example: ".addsewa https://chat.whatsapp.com/xxx 30d",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseDuration(str) {
  if (
    ["lifetime", "permanent", "forever", "unlimited"].includes(
      str.toLowerCase(),
    )
  )
    return Infinity;
  const match = str.match(/^(\d+)([iIdDmMyYhH])$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = {
    i: 60000,
    h: 3600000,
    d: 86400000,
    m: 2592000000,
    y: 31536000000,
  };
  return multiplier[unit] ? Date.now() + value * multiplier[unit] : null;
}

function formatDuration(str) {
  if (
    ["lifetime", "permanent", "forever", "unlimited"].includes(
      str.toLowerCase(),
    )
  )
    return "Permanente";
  const match = str.match(/^(\d+)([iIdDmMyYhH])$/);
  if (!match) return str;
  const units = { i: "minutos", h: "horas", d: "días", m: "meses", y: "años" };
  return `${match[1]} ${units[match[2].toLowerCase()] || match[2]}`;
}

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = input.split("chat.whatsapp.com/")[1]?.split(/[\s?]/)[0];
    if (!inviteCode) return null;
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      console.log(metadata);
      if (!metadata?.id) return null;
      return {
        id: metadata.id,
        name: metadata.subject || "Unknown",
        inviteCode,
      };
    } catch {
      return null;
    }
  }
  const groupId = input.includes("@g.us") ? input : input + "@g.us";
  try {
    const metadata = await sock.groupMetadata(groupId);
    return {
      id: groupId,
      name: metadata?.subject || "Unknown",
      inviteCode: null,
    };
  } catch {
    return { id: groupId, name: "Unknown", inviteCode: null };
  }
}

async function tryJoinGroup(sock, inviteCode, groupId) {
  if (!inviteCode)
    return {
      joined: false,
      reason: "No hay código de invitación, añade el bot manualmente",
    };
  try {
    const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
    const metadata = await sock.groupMetadata(groupId).catch(() => null);
    if (metadata) {
      const isMember = metadata.participants?.some((p) => {
        const pJid = p.id?.split(":")[0] + "@s.whatsapp.net";
        return pJid === botJid || p.id === botJid;
      });
      if (isMember) return { joined: true, reason: "El bot ya está en el grupo" };
    }
    await sock.groupAcceptInvite(inviteCode);
    return { joined: true, reason: "El bot se unió al grupo con éxito" };
  } catch (e) {
    return { joined: false, reason: e.message || "Error al unirse al grupo" };
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  const args = m.args;
  if (args.length < 2) {
    return m.reply(
      `📝 *ᴀñᴀᴅɪʀ ᴀʟǫᴜɪʟᴇʀ* 𓈒 ◌\n\n` +
        `ꕥ Formato: *${m.prefix}addsewa <link/id> <duración>*\n\n` +
        `*ꕥ ғᴏʀᴍᴀᴛᴏ ᴅᴇ ᴅᴜʀᴀᴄɪóɴ:*\n` +
        `• 30i = 30 minutos\n` +
        `• 12h = 12 horas\n` +
        `• 7d = 7 días\n` +
        `• 1m = 1 mes (30 días)\n` +
        `• 1y = 1 año\n` +
        `• lifetime = Permanente\n\n` +
        `*ꕥ ɪɴᴘᴜᴛ ᴅᴇ ɢʀᴜᴘᴏ:*\n` +
        `• Link: https://chat.whatsapp.com/xxx\n` +
        `• ID: 120363xxx@g.us\n\n` +
        `*ꕥ ᴇᴊᴇᴍᴘʟᴏs:*\n` +
        `• ${m.prefix}addsewa https://chat.whatsapp.com/xxx 30d\n` +
        `• ${m.prefix}addsewa 120363xxx 1m\n\n` +
        `💡 ¡Si usas un link, el bot se unirá automáticamente al grupo! ( ᴗ͈ˬᴗ͈ )`,
    );
  }

  const input = args[0];
  const durationStr = args[1];
  const expiredAt = parseDuration(durationStr);

  if (!expiredAt)
    return m.reply(
      `❌ ꕥ Formato de duración no válido\n\n𓈒 ◌ Ejemplo: 7d, 1m, 1y, lifetime ( ᴗ͈ˬᴗ͈ )`,
    );

  await m.react("🕕");

  try {
    const result = await resolveGroupId(sock, input);
    if (!result) {
      await m.react("❌");
      return m.reply(`❌ ꕥ Grupo no encontrado o enlace no válido`);
    }

    const { id: groupId, name: groupName, inviteCode } = result;
    const isLifetime = expiredAt === Infinity;

    db.db.data.sewa.groups[groupId] = {
      name: groupName,
      addedAt: Date.now(),
      expiredAt: isLifetime ? 0 : expiredAt,
      isLifetime,
      addedBy: m.sender,
    };
    db.db.write();

    const expiredStr = isLifetime
      ? "Permanente"
      : timeHelper.fromTimestamp(expiredAt, "D MMMM YYYY HH:mm");

    let text = `✅ *ᴀʟǫᴜɪʟᴇʀ ᴀñᴀᴅɪᴅᴏ ᴄᴏɴ éxɪᴛᴏ* 𓈒 ◌\n\n`;
    text += `ꕥ Grupo: *${groupName}*\n`;
    text += `ꕥ ID: ${groupId.split("@")[0]}\n`;
    text += `ꕥ Duración: *${formatDuration(durationStr)}*\n`;
    text += `ꕥ Expira: *${expiredStr}*\n\n`;

    const joinResult = await tryJoinGroup(sock, inviteCode, groupId);

    if (joinResult.joined) {
      text += `✅ ${joinResult.reason}`;
      try {
        await new Promise((r) => setTimeout(r, 2000));
        await sock.sendText(
          groupId,
          `👋 *¡Hola a todos!* soy ${config.bot?.name} 𓈒 ◌\n\nꕥ Periodo de alquiler: *${formatDuration(durationStr)}*\nꕥ Saldré el: *${expiredStr}*\n\n🌸 Escribe *${m.prefix}menu* para ver mis funciones ( ᴗ͈ˬᴗ͈ )`,
          null,
          {
            contextInfo: saluranCtx(),
          },
        );
      } catch {}
    } else {
      text += `⚠️ Auto-join falló: ${joinResult.reason}\nꕥ Añade el bot al grupo manualmente ( ᴗ͈ˬᴗ͈ )`;
    }

    await m.react("✅");
    return m.reply(text);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
