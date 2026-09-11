import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require("fs")
const path = require("path")

const pluginConfig = {
    name: "ambilfile",
    alias: ["getfile","downloadfile"],
    category: "owner",
    description: "Obtiene un archivo del proyecto del bot sin necesidad de .js con la estética Waguri Assistant 📁",
    usage: ".ambilfile <nombre_archivo>",
    example: ".ambilfile config",
    isOwner: true,
    cooldown: 5,
    isEnabled: true
}

// scan todos folder
function findFile(dir, name){
    const files = fs.readdirSync(dir)

    for(const file of files){

        const full = path.join(dir,file)
        const stat = fs.statSync(full)

        if(stat.isDirectory()){
            const result = findFile(full,name)
            if(result) return result
        }else{

            const base = file.replace(/\.[^/.]+$/,"")

            if(base.toLowerCase() === name.toLowerCase()){
                return full
            }
        }
    }

    return null
}

async function handler(m,{ sock }){

    let input = m.text?.trim()

    if(!input){
        return m.reply(
`╭━━〔 💖 ZERO TWO AMBIL FILE 💖 〕━━⬣
┃ Cariño masukkan nama file~
┃
┃ Ejemplo:
┃ .ambilfile config
┃ .ambilfile handler
┃ .ambilfile gpt
╰━━━━━━━━━━━━━━━━⬣`
        )
    }

    m.react("⏳")

    try{

        const root = process.cwd()

        const found = findFile(root,input)

        if(!found){
            m.react("❌")
            return m.reply(`❌ File *${input}* no encontrado 🗿`)
        }

        const fileName = path.basename(found)
        const time = new Date().toLocaleTimeString()

        const ui =
`╭━━〔 💖 ZERO TWO DOWNLOAD FILE 💖 〕━━⬣
┃ ¡Cariño, encontré el archivo~ ✨
┃
┃ 📦 Nama : ${fileName}
┃ 📂 Path : ${found.replace(root,"")}
┃ ⏰ Hora : ${time}
╰━━━━━━━━━━━━━━━━⬣`

        await m.reply(ui)

        await sock.sendMessage(
            m.chat,
            {
                document: fs.readFileSync(found),
                fileName: fileName,
                mimetype: "application/octet-stream"
            }
        )

        m.react("✅")

    }catch(e){

        console.log(e)

        m.react("❌")

        return m.reply(
`╭━━〔 ❌ ZERO TWO SYSTEM ❌ 〕━━⬣
┃
┃ ${e.message}
╰━━━━━━━━━━━━━━━━⬣`
        )
    }
}

export { pluginConfig as config, handler };
