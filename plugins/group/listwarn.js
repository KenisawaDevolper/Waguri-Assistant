import { getDatabase } from '../../src/lib/rimuru-database.js'
import * as timeHelper from '../../src/lib/rimuru-time.js'

const pluginConfig = {
  name: "listwarn",
  alias: ["warnings", "cekwarn", "warnlist"],
  category: "group",
  description: "Muestra el registro y detalle de las advertencias (warnings) de un miembro o de todo el grupo.",
  usage: ".listwarn o .listwarn @user",
  example: ".listwarn @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  let groupData = db.getGroup(m.chat) || {};
  let warnings = groupData.warnings || {};
  const maxWarns = groupData.maxWarnings || 3;

  let targetUser = null;
  if (m.quoted) {
    targetUser = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    targetUser = m.mentionedJid[0];
  }

  if (targetUser) {
    const userWarnings = warnings[targetUser] || [];
    const targetName = targetUser.split("@")[0];

    if (userWarnings.length === 0) {
      return m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖠𝖣𝖵𝖤𝖱𝖳𝖤𝖭𝖢𝖨𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Usuario :: *@${targetName}*\n` +
        `      • Estado :: *0 advertencias registradas*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El miembro seleccionado no posee ningún registro de warns en este chat grupal. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        { mentions: [targetUser] }
      );
    }

    let txt = `ꕥ 𝖧𝖨𝖲𝖳𝖮𝖱𝖨𝖠𝖫 𝖣𝖤 𝖶𝖠𝖱𝖭𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      • Objetivo :: *@${targetName}*\n` +
              `      • Conteo actual :: *${userWarnings.length}/${maxWarns} advertencias*\n\n` +
              `      𓈒 ◌ㅤ──    *📝 𝖣𝖤𝖳𝖠𝖫𝖫𝖤 𝖣𝖤 𝖨𝖭𝖥𝖱𝖠𝖢𝖢𝖨𝖮𝖭𝖤𝖲*\n`

    userWarnings.forEach((w, i) => {
      const date = timeHelper.fromTimestamp(w.time, "DD/MM/YYYY");
      txt += `      • ${i + 1}. \`${w.reason}\`\n        └ _Fecha: ${date}_\n`;
    });

    txt += `\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Historial detallado de infracciones recopiladas del usuario. »\n\n` +
           `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    return m.reply(txt, { mentions: [targetUser] });
  } else {
    const usersWithWarnings = Object.keys(warnings).filter(
      (u) => warnings[u].length > 0,
    );

    if (usersWithWarnings.length === 0) {
      return m.reply(
        `ꕥ 𝖲𝖨𝖭 𝖨𝖭𝖥𝖱𝖠𝖢𝖢𝖨𝖮𝖭𝖤𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Excelente noticia: No hay ningún miembro con advertencias activas en este grupo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
      );
    }

    let txt = `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖦𝖤𝖭𝖤𝖱𝖠𝖫 𝖣𝖤 𝖶𝖠𝖱𝖭𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      𓈒 ◌ㅤ──    *⚠️ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮𝖲 𝖢𝖮𝖭 𝖶𝖠𝖱𝖭𝖲*\n`

    usersWithWarnings.forEach((user, i) => {
      const count = warnings[user].length;
      const name = user.split("@")[0];
      txt += `      • ${i + 1}. @${name} — *${count}/${maxWarns} advertencias*\n`;
    });

    txt += `\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tip: Utiliza \`${m.prefix}listwarn @user\` para ver el motivo detallado de cada infracción. »\n\n` +
           `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    return m.reply(txt, { mentions: usersWithWarnings });
  }
}

export { pluginConfig as config, handler }
