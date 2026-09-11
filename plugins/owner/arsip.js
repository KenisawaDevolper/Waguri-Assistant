const pluginConfig = {
  name: ["arsip", "archive"],
  alias: [],
  category: "owner",
  description: "Archivar/desarchivar chats con la estética Waguri Assistant 🗂️",
  usage: ".arsip <nomor/reply> atau .arsip buka <nomor>",
  example: ".arsip 628xxx",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const action = m.args[0]?.toLowerCase();
  let targetJid = null;
  let archive = true;

  if (action === "buka" || action === "unarchive") {
    archive = false;
    const num = (m.args[1] || "").replace(/[^0-9]/g, "");
    if (num) {
      targetJid = num + "@s.whatsapp.net";
    } else if (m.quoted) {
      targetJid = m.quoted.sender || m.quoted.participant;
    } else if (!m.isGroup) {
      targetJid = m.chat;
    }
  } else if (action === "semua") {
    try {
      await m.react("🕕");
      global.isFetchingGroups = true;
      const groups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const jid of groupIds) {
        try {
          await sock.chatModify({ archive: true, lastMessages: [] }, jid);
          count++;
        } catch {}
      }
      await m.react("✅");
      return m.reply(
        `📁 *${count} grup diarsipkan*\n\n> Private chat no bisa diarsipkan una vezgus (no ada daftar chat)`,
      );
    } catch (err) {
      global.isFetchingGroups = false;
      return m.reply(`❌ Error: ${err.message}`);
    }
  } else {
    if (m.mentionedJid?.length > 0) {
      targetJid = m.mentionedJid[0];
    } else if (m.quoted) {
      targetJid = m.quoted.sender || m.quoted.participant;
    } else if (m.args[0]) {
      const num = m.args[0].replace(/[^0-9]/g, "");
      if (num) targetJid = num + "@s.whatsapp.net";
    } else if (!m.isGroup) {
      targetJid = m.chat;
    }
  }

  if (!targetJid) {
    return m.reply(
      "📁 *ᴀʀsɪᴘ ᴄʜᴀᴛ*\n\n" +
        "> `.arsip 628xxx` — Archivar chat\n" +
        "> `.arsip` (en chat privado) — Archivar chat ini\n" +
        "> `.arsip` (reply pesan) — Archivar chat pengirim\n" +
        "> `.arsip buka 628xxx` — Buka arsip chat\n" +
        "> `.arsip semua` — Archivar todos los chats",
    );
  }

  try {
    await sock.chatModify({ archive, lastMessages: [] }, targetJid);
    await m.react("✅");
    const target = targetJid.split("@")[0];
    return m.reply(
      archive
        ? `📁 *ᴄʜᴀᴛ ᴅɪᴀʀsɪᴘᴋᴀɴ*\n\n> Target: ${target}\n> Gunakan \`.arsip buka ${target}\` untuk membuka`
        : `📂 *ᴀʀsɪᴘ ᴅɪʙᴜᴋᴀ*\n\n> Target: ${target}`,
    );
  } catch (err) {
    return m.reply(`❌ Error: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
