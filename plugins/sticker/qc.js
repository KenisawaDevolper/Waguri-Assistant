import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'qc',
    alias: ['qcstc', 'stcqc', 'qcstic', 'qcstick', 'quotesticker'],
    category: 'sticker',
    description: '𝖢𝗋ᧉ⍺ 𝗎𝗇 𝗌ƚı𝖼𝗄ᧉ𝗋 𝖽ᧉ 𝖼𝗎𝗈ƚᧉ 𝖽ᧉ 𝖼һ⍺ƚ 𝖼𝗈𝗇 𝖼𝗈𝗅𝗈𝗋 𝗉ᧉ𝗋𝗌𝗈𝗇⍺𝗅ı𝗓⍺𝖽𝗈',
    usage: '.qc <𝖼𝗈𝗅𝗈𝗋> <ƚᧉ𝗑ƚ𝗈>',
    example: '.qc 𝗉ı𝗇𝗄 𝖧⍺ı 𝗌ᧉ𝗆𝗎⍺𝗇𝗒⍺!',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const COLORS = {
    pink: '#f68ac9',
    blue: '#6cace4',
    red: '#f44336',
    green: '#4caf50',
    yellow: '#ffeb3b',
    purple: '#9c27b0',
    darkblue: '#0d47a1',
    lightblue: '#03a9f4',
    ash: '#9e9e9e',
    orange: '#ff9800',
    black: '#000000',
    white: '#ffffff',
    teal: '#008080',
    lightpink: '#FFC0CB',
    chocolate: '#A52A2A',
    salmon: '#FFA07A',
    magenta: '#FF00FF',
    tan: '#D2B48C',
    wheat: '#F5DEB3',
    deeppink: '#FF1493',
    fire: '#B22222',
    skyblue: '#00BFFF',
    brightskyblue: '#1E90FF',
    hotpink: '#FF69B4',
    lightskyblue: '#87CEEB',
    seagreen: '#20B2AA',
    darkred: '#8B0000',
    orangered: '#FF4500',
    cyan: '#48D1CC',
    violet: '#BA55D3',
    mossgreen: '#00FF7F',
    darkgreen: '#008000',
    navyblue: '#191970',
    darkorange: '#FF8C00',
    darkpurple: '#9400D3',
    fuchsia: '#FF00FF',
    darkmagenta: '#8B008B',
    darkgray: '#2F4F4F',
    peachpuff: '#FFDAB9',
    darkishgreen: '#BDB76B',
    darkishred: '#DC143C',
    goldenrod: '#DAA520',
    darkishgray: '#696969',
    darkishpurple: '#483D8B',
    gold: '#FFD700',
    silver: '#C0C0C0'
}

const DEFAULT_PP = 'https://files.catbox.moe/nwvkbt.png'

async function getProfilePicture(sock, jid) {
    try {
        return await sock.profilePictureUrl(jid, 'image')
    } catch {
        return DEFAULT_PP
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    
    if (args.length < 2) {
        const colorList = Object.keys(COLORS).join(', ')
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖰𝖴𝖮𝖳𝖤 𝖲𝖳𝖨𝖢𝖪𝖤𝖱* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      🌸   𓈒 ◌ㅤ──    *𝗎𝗌𝗈* : \`${m.prefix}qc <𝖼𝗈𝗅𝗈𝗋> <ƚᧉ𝗑ƚ𝗈>\`\n` +
            `      ✨   𓈒 ◌ㅤ──    _𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ 𝗎𝗇⍺ 𝗉ᧉ𝗌⍺𝗇 + \`${m.prefix}qc <𝖼𝗈𝗅𝗈𝗋>\`_\n\n` +
            `> 𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: \`${m.prefix}qc 𝗉ı𝗇𝗄 𝖧⍺ı 𝗌ᧉ𝗆𝗎⍺𝗇𝗒⍺!\`\n\n` +
            `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖢𝖮𝖫𝖮𝖱𝖤𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲* 🌸\n` +
            `      🎨   𓈒 ◌ㅤ──    ${colorList}\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    const color = args[0].toLowerCase()
    const backgroundColor = COLORS[color]
    
    if (!backgroundColor) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    𝖶⍺𝗋𝗇⍺ \`${color}\` 𝗇𝗈 𝗌ᧉ ᧉ𝗇𝖼𝗈𝗇ƚ𝗋ó\n` +
            `      💡   𓈒 ◌ㅤ──    _𝖴𝗌⍺ 𝗎𝗇𝗈 𝖽ᧉ 𝗅𝗈𝗌 𝖼𝗈𝗅𝗈𝗋𝧉𝗌 𝗏á𝗅ı𝖽𝗈𝗌_\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    let message = args.slice(1).join(' ')
    
    if (m.quoted && !message) {
        message = m.quoted.text || m.quoted.body || ''
    }
    
    if (!message) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    ¡𝖬⍺𝗌𝗎𝗄𝗄⍺𝗇 ƚᧉ𝗑ƚ𝗈 𝗉⍺𝗋⍺ 𝗊𝗎𝗈ƚᧉ!\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    if (message.length > 80) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    ¡𝖬⍺𝗄𝗌ı𝗆⍺𝗅 80 𝖼⍺𝗋⍺𝗄ƚᧉ𝗋ᧉ𝗌! (𝖲⍺⍺ƚ ı𝗇ı: ${message.length})\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
    
    m.react('🕕')
    
    try {
        const username = m.pushName || 'Usuario'
        const avatar = await getProfilePicture(sock, m.sender)
        
        const json = {
        "messages": [
            {
            "from": {
                "id": Math.floor(Math.random() * 10),
                "first_name": username,
                "last_name": "",
                "name": "",
                "photo": {
                "url": avatar
                }
            },
            "text": message,
            "entities": [],
            "avatar": true,
            "media": {
                "url": ""
            },
            "mediaType": "",
            "replyMessage": {
                "name": "",
                "text": "",
                "entities": [],
                "chatId": Math.floor(Math.random() * 10)
            }
            }
        ],
        "backgroundColor": backgroundColor,
        "width": 512,
        "height": 512,
        "scale": 2,
        "type": "quote",
        "format": "png",
        "emojiStyle": "apple"
        }
        
        const response = await axios.post('https://brat.siputzx.my.id/quoted', json, {
            timeout: 60000,
            responseType: 'arraybuffer'
        })
        
        const buffer = Buffer.from(response.data, 'base64')
        
        await sock.sendImageAsSticker(m.chat, buffer, m, {
            packname: config.sticker?.packname || 'rimuru-AI',
            author: config.sticker?.author || 'Bot'
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
