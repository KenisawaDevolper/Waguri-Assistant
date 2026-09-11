import axios from 'axios'

let handler = async (m, { conn, participants, groupMetadata }) => {
  const ppUrls = [
    'https://i.ibb.co/VVXTRv0/f8323e88975b4e8c15580fbb8daed698.jpg',
    'https://i.ibb.co/mvt0NPZ/31889221389613dd440c9909cd27771a.jpg',
    'https://i.ibb.co/jhCy322/f272360445283d8385c35afa697bdf43.jpg',
  ];
  let ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null);

  if (!ppUrl) {
    ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
  }

  const ppBuffer = await axios.get(ppUrl, { responseType: 'arraybuffer' }).then(res => res.data).catch(_ => null);

  const { isBanned, welcome, detect, sBienvenida, sBye, sPromociona, sDegrada, antiLink, delete: del } = global.db.data.chats[m.chat] || {};
  const groupAdmins = participants.filter(p => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `      • ${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  
  let text = `ꕥ 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖀́𝖭 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
             `      𓈒 ◌ㅤ──    *𝖣A𝖳𝖮𝖲 𝖦𝖤𝖭𝖤𝖱𝖠𝖫𝖤𝖲*\n` +
             `      • ID del chat :: \`${groupMetadata.id}\`\n` +
             `      • Nombre :: *${groupMetadata.subject}*\n` +
             `      • Descripción :: ${groupMetadata.desc?.toString() || 'Sin descripción'}\n` +
             `      • Total de miembros :: *${participants.length} integrantes*\n` +
             `      • Propietario :: @${owner.split('@')[0]}\n\n` +

             `      𓈒 ◌ㅤ──    *👑 𝖠𝖣𝖬𝖨𝖭𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖱𝖤𝖲*\n` +
             `${listAdmin || '      • No hay administradores registrados'}\n\n` +

             `      𓈒 ◌ㅤ──    *⚙️ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨O𝖭 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯O*\n` +
             `      • Banned :: ${isBanned ? '✅' : '❌'}\n` +
             `      • Bienvenida :: ${welcome ? '✅' : '❌'}\n` +
             `      • Detect :: ${detect ? '✅' : '❌'}\n` +
             `      • Anti Delete :: ${del ? '❌' : '✅'}\n` +
             `      • Anti Link :: ${antiLink ? '✅' : '❌'}\n\n` +

             `      𓈒 ◌ㅤ──    *💬 𝖬𝖤𝖲𝖠𝖩𝖤𝖲 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖣𝖮𝖲*\n` +
             `      • Bienvenida :: \`${sBienvenida || 'Por defecto'}\`\n` +
             `      • Bye :: \`${sBye || 'Por defecto'}\`\n` +
             `      • Promociona :: \`${sPromociona || 'Por defecto'}\`\n` +
             `      • Degrada :: \`${sDegrada || 'Por defecto'}\`\n\n` +
             `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

  const mentionsList = [...groupAdmins.map(v => v.id), owner];

  if (ppBuffer) {
      conn.sendFile(m.chat, Buffer.from(ppBuffer), 'pp.jpg', text, m, false, { mentions: mentionsList });
  } else {
      conn.reply(m.chat, text, m, false, { mentions: mentionsList });
  }
}

handler.help = ['infogc']
handler.tags = ['group']
handler.command = /^(gro?upinfo|info(gro?up|gc))$/i
handler.group = true

export default handler
