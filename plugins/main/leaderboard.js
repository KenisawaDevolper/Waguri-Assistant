import { getDatabase } from '../../src/lib/rimuru-database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'

const pluginConfig = {
    name: 'leaderboard',
    alias: [
        'lb', 'top', 'leaderboard', 'ranking', 'rank', 'topglobal',
        'topbalance', 'topbal', 'topkoin', 'topcoin', 'topmoney',
        'toplimit', 'topexp', 'topxp', 'toplevel',
        'topenergi', 'topenergy'
    ],
    category: 'main',
    description: 'Muestra la tabla de clasificación global (monedas, experiencia, energía) estilo Waguri',
    usage: '.leaderboard',
    example: '.topkoin',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const MEDALS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const args = m.args || []
    
    let type = 'overview'
    
    if (cmd.includes('koin') || cmd.includes('coin') || cmd.includes('bal') || cmd.includes('money')) {
        type = 'koin'
    } else if (cmd.includes('exp') || cmd.includes('xp') || cmd.includes('level')) {
        type = 'exp'
    } else if (cmd.includes('energi') || cmd.includes('energy')) {
        type = 'energi'
    } else if (args[0]) {
        const argType = args[0].toLowerCase()
        if (['koin', 'coin', 'bal', 'balance', 'money'].includes(argType)) type = 'koin'
        else if (['exp', 'xp', 'level'].includes(argType)) type = 'exp'
        else if (['energi', 'energy'].includes(argType)) type = 'energi'
    }
    
    const dbData = db.data?.users || db.getAllUsuarios?.() || {}
    const users = []
    
    for (const [jid, userData] of Object.entries(dbData)) {
        if (!jid || jid === 'undefined') continue
        if (jid.length > 15 || jid.startsWith('120')) continue
        
        users.push({
            jid,
            koin: userData.koin || 0,
            exp: userData.rpg?.exp || userData.exp || 0,
            energi: userData.energi || 0,
            level: userData.rpg?.level || userData.level || 1,
            name: userData.name || jid.split('@')[0]
        })
    }
    
    if (users.length === 0) {
        return m.reply(
            `ꕥ 𝖢𝖫𝖠𝖲𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖮𝖭 𝖦𝖫𝖮𝖡𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aún no hay usuarios registrados en la base de datos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    const senderJid = m.sender.replace('@s.whatsapp.net', '')
    
    if (type === 'overview') {
        const maxBalUsuario = users.reduce((a, b) => a.koin > b.koin ? a : b, users[0])
        const maxExpUsuario = users.reduce((a, b) => a.exp > b.exp ? a : b, users[0])
        const maxEnergiUsuario = users.reduce((a, b) => a.energi > b.energi ? a : b, users[0])
        
        const mentions = [
            maxBalUsuario.jid.includes('@') ? maxBalUsuario.jid : maxBalUsuario.jid + "@s.whatsapp.net",
            maxExpUsuario.jid.includes('@') ? maxExpUsuario.jid : maxExpUsuario.jid + "@s.whatsapp.net",
            maxEnergiUsuario.jid.includes('@') ? maxEnergiUsuario.jid : maxEnergiUsuario.jid + "@s.whatsapp.net"
        ]
        
        const overviewText = 
            `ꕥ 𝖢𝖫𝖠𝖲𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖮𝖭 𝖦𝖫𝖮𝖡𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖤 𝖱𝖠𝖭𝖪𝖨𝖭𝖦*\n` +
            `      • Monedas :: .topkoin\n` +
            `      • Experiencia :: .topexp\n` +
            `      • Energía :: .topenergi\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Selecciona una categoría para ver el ranking detallado »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

        try {
            await sock.sendButton(
                m.chat, 
                fs.readFileSync(path.join(process.cwd(), 'assets', 'images', 'rimuru.jpg')), 
                overviewText, 
                m, 
                {
                    buttons: [
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Top Monedas',
                                id: `${m.prefix}topkoin`
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Top Experiencia',
                                id: `${m.prefix}topexp`
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Top Energía',
                                id: `${m.prefix}topenergi`
                            })
                        }
                    ],
                }
            )
            return
        } catch (e) {
            return m.reply(overviewText, { mentions })
        }
    }
    
    let title, field, formatValue
    
    if (type === 'koin') {
        title = '𝖳𝖮𝖯 𝖦𝖫𝖮𝖡𝖠𝖫 𝖬𝖮𝖭𝖤𝖣𝖠𝖲'
        field = 'koin'
        formatValue = (u) => `${formatNumber(u.koin)} Monedas`
    } else if (type === 'exp') {
        title = '𝖳𝖮𝖯 𝖦𝖫𝖮𝖡𝖠𝖫 𝖤𝖷𝖯𝖤𝖱𝖨𝖤𝖭𝖢𝖨𝖠'
        field = 'exp'
        formatValue = (u) => `Nivel ${u.level} (${formatNumber(u.exp)} XP)`
    } else if (type === 'energi') {
        title = '𝖳𝖮𝖯 𝖦𝖫𝖮𝖡𝖠𝖫 𝖤𝖭𝖤𝖱𝖦𝖨𝖠'
        field = 'energi'
        formatValue = (u) => `${formatNumber(u.energi)} Energía`
    }
    
    users.sort((a, b) => b[field] - a[field])
    
    const top10 = users.slice(0, 10)
    const totalField = users.reduce((sum, u) => sum + (u[field] || 0), 0)
    
    let text = `ꕥ ${title} ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n`
    text += `      𓈒 ◌ㅤ──    *𝖢𝖫𝖠𝖲𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖮𝖭*\n`
    
    const mentions = []
    
    top10.forEach((u, i) => {
        const medal = MEDALS[i] || `${i + 1}`
        const pct = totalField > 0 ? ((u[field] / totalField) * 100).toFixed(1) : 0
        const isMe = u.jid === senderJid ? " *(Tú)*" : ""
        
        text += `      • ${medal} :: @${u.jid.split('@')[0]}${isMe}\n`
        text += `         └ ${formatValue(u)} (${pct}%)\n`
        
        mentions.push(u.jid.includes('@') ? u.jid : u.jid + "@s.whatsapp.net")
    })
    
    text += `\n`
    
    const myRankIndex = users.findIndex(u => u.jid === senderJid)
    if (myRankIndex !== -1) {
        text += `gh៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tu posición: *#${myRankIndex + 1}* de *${formatNumber(users.length)}* usuarios. »\n\n`
    } else {
        text += `gh៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aún no estás registrado en la base de datos. »\n\n`
    }
    
    text += `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    
    await m.reply(text, { mentions })
}

export { pluginConfig as config, handler }
