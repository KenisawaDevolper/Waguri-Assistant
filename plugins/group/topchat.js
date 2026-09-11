import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "topchat",
  alias: ["chatstat", "chatstats", "totalchat", "leaderboard"],
  category: 'group',
  description: 'Muestra las estadísticas y el ranking de mensajes de los miembros en el grupo.',
  usage: '.topchat',
  example: '.topchat',
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const group = db.getGroup(m.chat) || {};
  const chatStats = group.chatStats || {};
  
  const sorted = Object.entries(chatStats)
    .map(([jid, data]) => ({
      jid,
      count: data.count || 0,
      lastChat: data.lastChat || 0,
    }))
    .sort((a, b) => b.count - a.count);

  if (sorted.length === 0) {
    return m.reply(
      `ꕥ 𝖤𝖲𝖳𝖠𝖣𝖨𝖲𝖳𝖨𝖢𝖠𝖲 𝖵𝖠𝖢𝖨𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aún no hay registros de chat en este grupo.\n` +
      `Los datos comenzarán a guardarse automáticamente conforme los miembros envíen mensajes. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  let txt = '';
  for (let i = 0; i < sorted.length; i++) {
    const { jid, count } = sorted[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
    txt += `      ${medal} @${jid.split("@")[0]} — *${count.toLocaleString("id-ID")}* mensajes\n`;
  }

  const totalMessages = sorted.reduce((a, b) => a + b.count, 0).toLocaleString("id-ID");

  const replyText = 
    `ꕥ 𝖱𝖠𝖭𝖪𝖨𝖭𝖦 𝖣𝖤 𝖢𝖧𝖠𝖳𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      𓈒 ◌ㅤ──    *𝖬𝖨𝖤𝖬𝖡𝖱𝖮𝖲 𝖬𝖠𝖲 𝖠𝖢𝖳𝖨𝖵𝖮𝖲*\n` +
    `${txt}\n` +
    `      • Total global de mensajes :: *${totalMessages}*\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Sigan participando en el grupo para subir en el ranking! »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

  const mentions = sorted.map((u) => u.jid);
  await sock.sendMessage(m.chat, { text: replyText, mentions }, { quoted: m });
}

function incrementChatCount(chatId, senderJid, db, pushName) {
  if (!chatId || !senderJid) return;
  const group = db.getGroup(chatId) || {};
  if (!group.chatStats) group.chatStats = {};
  if (!group.chatStats[senderJid]) {
    group.chatStats[senderJid] = {
      count: 0,
      lastChat: 0,
      name: pushName || null,
    };
  }

  group.chatStats[senderJid].count++;
  group.chatStats[senderJid].lastChat = Date.now();
  if (pushName) group.chatStats[senderJid].name = pushName;

  db.setGroup(chatId, group);
}

export { pluginConfig as config, handler, incrementChatCount };
