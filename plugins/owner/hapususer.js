import { getDatabase } from '../../src/lib/rimuru-database.js';
const pluginConfig = {
    name: 'hapususer',
    alias: ['deluser','deleteuser'],
    category: 'owner',
    description: 'Elimina usuario de la base de datos con la estética Waguri Assistant 🗑️',
    usage: '.hapususer',
    isOwner: true,
    cooldown: 5,
    isEnabled: true
}

async function handler(m, { sock }) {

    const db = getDatabase()
    const args = m.args || []

    // ✅ CONFIRM HAPUS
    if (args[0] === '--confirm' && args[1]) {

        const target = args[1]
        const user = db.data.users[target]

        if (!user) {
            return m.reply(`❌ User no encontrado.`)
        }

        delete db.data.users[target]
        db.save()

        return m.reply(
`╭━━━〔 💔 ZERO TWO DELETE 💔 〕━━━⬣
┃
┃ Ara ara~ user berhasil eliminado 😈
┃
┃ 👤 Target : ${target}
┃ 💣 Status : *Terhapus*
┃
┃ ¡No te portes mal de nuevo, cariño... ✨
┃ o serás el siguiente 😏
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        )
    }

    // 📋 AMBIL USER LIST
    const users = Object.entries(db.data.users || {})

    if (users.length === 0) {
        return m.reply(`❌ No ada user di database.`)
    }

    // 🔽 FORMAT LIST
    const rows = users.slice(0, 50).map(([jid, user]) => ({
        title: user.name || 'No Name',
        description: `💰 Koin: ${user.koin || 0}`,
        id: `${m.prefix}hapususer --confirm ${jid}`
    }))

    // 💗 UI ZERO TWO
    await sock.sendMessage(m.chat, {
        text:
`╭━━━〔 💗 ZERO TWO SYSTEM 💗 〕━━━⬣
┃
┃ Hai ${m.pushName || 'Cariño'} 😋
┃ Mau hapus siapa nih?
┃
┃ Pilih user di bawah ya~
┃ Jangan salah pilih 😈
┃
╰━━━━━━━━━━━━━━━━━━⬣`,
        footer: 'Zero Two AI 💗',
        interactiveButtons: [
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '💀 Pilih Target',
                    sections: [
                        {
                            title: 'Daftar User',
                            rows
                        }
                    ]
                })
            }
        ]
    }, { quoted: m })
}

export { pluginConfig as config, handler };
