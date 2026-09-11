import { getDatabase } from "../../src/lib/rimuru-database.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";
const pluginConfig = {
  name: "delsewa",
  alias: ["sewadel", "hapussewa", "removesewa"],
  category: "owner",
  description: "Elimina un grupo de la lista de alquiler con la estética Waguri Assistant 🗑️",
  usage: ".delsewa <link/id grup>",
  example: ".delsewa https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = input.split("chat.whatsapp.com/")[1]?.split(/[\s?]/)[0];
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      if (metadata?.id) return { id: metadata.id, name: metadata.subject };
    } catch {}
    return null;
  }
  return { id: input.includes("@g.us") ? input : input + "@g.us", name: null };
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const input = m.text?.trim();

  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  let groupId = null;
  let groupName = null;

  if (!input) {
    if (!m.isGroup) {
      return m.reply(
        `📝 *HAPUS SEWA*\n\n` +
          `Dari private: *${m.prefix}delsewa <link/id>*\n` +
          `Dari grup: ketik *${m.prefix}delsewa* langsung di grup\n\n` +
          `Ejemplo:\n` +
          `• ${m.prefix}delsewa https://chat.whatsapp.com/xxx\n` +
          `• ${m.prefix}delsewa 120363xxx\n\n` +
          `⚠️ Jika sewabot aktif, bot akan otomatis keluar dari grup yang eliminado`,
      );
    }
    groupId = m.chat;
  } else {
    const result = await resolveGroupId(sock, input);
    if (!result)
      return m.reply(`❌ Link no valid atau grup no encontrado`);
    groupId = result.id;
    groupName = result.name;
  }

  if (!groupId) return m.reply(`❌ No dapat menentukan grup`);

  const sewaData = db.db.data.sewa.groups[groupId];
  if (!sewaData)
    return m.reply(
      `❌ Grupo no terdaftar dalam sistem sewa\n\nLihat daftar: *${m.prefix}listsewa*`,
    );

  groupName = groupName || sewaData.name || groupId.split("@")[0];

  delete db.db.data.sewa.groups[groupId];
  db.db.write();

  await m.react("✅");
  await m.reply(
    `✅ *SEWA DIHAPUS*\n\nGrupo: *${groupName}*\nID: ${groupId.split("@")[0]}`,
  );

  if (db.db.data.sewa.enabled) {
    try {
      await sock.sendText(
        groupId,
        `⛔ Este grupo telah eliminado dari whitelist sewa.\nBot akan meninggalkan grup.\n\nHubungi owner untuk sewa ulang.`,
        null,
        {
          contextInfo: saluranCtx(),
        },
      );
      await new Promise((r) => setTimeout(r, 2000));
      await sock.groupLeave(groupId);
    } catch {}
  }
}

export { pluginConfig as config, handler };
