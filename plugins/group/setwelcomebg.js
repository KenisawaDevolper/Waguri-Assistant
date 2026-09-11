import fs from 'fs';
import path from 'path';

const pluginConfig = {
    name: 'setwelcomebg',
    alias: ['setbgwelcome'],
    category: 'owner',
    description: 'Establece y guarda una nueva imagen de fondo para los mensajes de bienvenida del grupo.',
    usage: '.setwelcomebg (respondiendo a una imagen)',
    example: '.setwelcomebg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

const handler = async (m, { usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime.startsWith('image/')) {
    return m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖬𝖴𝖫𝖳𝖨𝖬𝖤𝖣𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Uso correcto :: Responde o envía una imagen con la descripción:\n` +
        `      • Comando :: \`${usedPrefix + command}\`\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes adjuntar o responder a una fotografía para establecerla como fondo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  const dir = '/home/container/src/Aesthetic';
  const file = path.join(dir, 'welcome-bg.jpg');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const buffer = await q.download();
    fs.writeFileSync(file, buffer);
    try { await m.react('✅'); } catch {}

    await m.reply(
        `ꕥ 𝖥𝖮𝖭𝖣𝖮 𝖣𝖤 𝖡𝖨𝖤𝖭𝖵𝖤𝖭𝖨𝖣𝖠 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲 𝖣𝖤𝖫 𝖠𝖱𝖢𝖧𝖨𝖵𝖮*\n` +
        `      • Estado :: Guardado exitosamente ✅\n` +
        `      • Ruta de destino :: \`${file}\`\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El nuevo fondo ha sido aplicado para los saludos del sistema. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  } catch (err) {
    console.error('Error al guardar el fondo de bienvenida:', err);
    return m.reply(
        `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo descargar o almacenar la imagen en el servidor.\nDetalle: _${err.message}_ »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }
};

export { pluginConfig as config, handler };
