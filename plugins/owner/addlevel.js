import { getDatabase } from '../../src/lib/rimuru-database.js'
import { calculateLevel, getRole, checkAndNotifyLevelUp } from './../../src/lib/rimuru-level.js'

const pluginConfig = {
    name: 'addlevel',
    alias: ['tambahlevel', 'givelevel', 'addlvl'],
    category: 'owner',
    description: 'Añade niveles a un usuario vía EXP con la estética Waguri Assistant',
    usage: '.addlevel <cantidad> @user',
    example: '.addlevel 5 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let levels = parseInt(numArg) || 0
    
    let targetJid = extractTarget(m)
    
    if (!targetJid && levels > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || levels <= 0) {
        return m.reply(
            `ꕥ 𝖠𝖣𝖣 𝖫𝖤𝖵𝖤𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • \`${m.prefix}addlevel <cantidad>\` — Para ti mism@\n` +
            `      • \`${m.prefix}addlevel <cantidad> @user\` — Para otro usuario\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}addlevel 5\`\n` +
            `      • \`${m.prefix}addlevel 10 @user\` ( ᴗ͈ˬᴗ͈ )\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    await m.react('🕕')
    
    const user = db.getUser(targetJid) || db.setUser(targetJid, {})
    if (!user.rpg) user.rpg = {}
    
    const expToAdd = levels * 10000
    
    const oldExp = user.exp || 0
    const newExp = db.updateExp(targetJid, expToAdd)
    user.exp = newExp
    
    const mockM = { ...m, sender: targetJid, pushName: m.pushName }
    const addResult = await checkAndNotifyLevelUp(sock, mockM, db, user, oldExp, newExp)
    
    db.setUser(targetJid, user)
    
    await m.react('✅')
    
    const finalLevel = addResult.newLevel || calculateLevel(user.exp)
    
    await m.reply(
        `ꕥ 𝖫𝖤𝖵𝖤𝖫 𝖠𝖭̃𝖠𝖣𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
        `      • Usuario :: @${targetJid.split('@')[0]}\n` +
        `      • Añadido :: *${levels} niveles* ✨\n` +
        `      • Nivel actual :: *${finalLevel}* 🌸\n` +
        `      • Rol :: *${getRole(finalLevel)}*\n` +
        `      • XP total :: *${user.exp.toLocaleString()}* XP\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }