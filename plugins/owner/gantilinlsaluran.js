import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require("fs")
const path = require("path")

const pluginConfig = {
    name: 'gantilinksaluran',
    alias: ['setlinksaluran'],
    category: 'owner',
    description: 'Mengganti semua link saluran di SC',
    usage: '.gantilinksaluran|link',
    example: '.gantilinksaluran|https://whatsapp.com/channel/0029VbAh3OwGOj9nf1CHs23U',
    isOwner: true,
    cooldown: 3,
    isEnabled: true
}

async function handler(m) {

    let msg = m.text || ""
    let input = msg.split("|")[1]

    if (!input) {
        return m.reply(`Contoh:
.gantilinksaluran|https://whatsapp.com/channel/0029VbAh3OwGOj9nf1CHs23U`)
    }

    const newLink = input.trim()

    function scan(dir){
        const files = fs.readdirSync(dir)

        for (let file of files){
            const full = path.join(dir, file)
            const stat = fs.statSync(full)

            if (stat.isDirectory()){
                scan(full)
            } else if (file.endsWith(".js")){
                let data = fs.readFileSync(full, "utf8")

                // regex ganti semua link channel WA
                let replaced = data.replace(/https:\/\/whatsapp\.com\/channel\/[a-zA-Z0-9]+/g, newLink)

                fs.writeFileSync(full, replaced)
            }
        }
    }

    scan("./")

    await m.reply(`╭━━〔 💗 ZERO TWO SYSTEM 💗 〕━━⬣
┃ ✅ Link saluran berhasil diganti
┃
┃ 🔗 Link Baru :
┃ ${newLink}
┃
┃ 🔄 Bot akan restart dalam 5 detik...
╰━━━━━━━━━━━━━━━━⬣`)

    setTimeout(() => {
        process.exit()
    }, 5000)
}

export { pluginConfig as config, handler };
