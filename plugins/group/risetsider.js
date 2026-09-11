import { resetSider } from '../../src/lib/listsider.js';

const pluginConfig = {
name: 'risetsider',
alias: [],
category: 'group',
isGroup: true,
isAdmin: true,
cooldown: 10,
isEnabled: true
}

async function handler(m){

resetSider(m.chat);

try { await m.react("✅"); } catch {}

return m.reply(
    `ꕥ 𝖲𝖨𝖳𝖤𝖱𝖲 𝖱𝖤𝖲𝖳𝖠𝖴𝖱𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La lista de miembros inactivos (siders) en este grupo ha sido restablecida correctamente. »\n\n` +
    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
);

}

export { pluginConfig as config, handler };
