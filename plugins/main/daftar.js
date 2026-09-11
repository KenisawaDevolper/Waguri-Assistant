import fs from 'fs'
import { createHash } from 'crypto'
import moment from 'moment-timezone'

let Reg = /^([\w\s]+)\s*,\s*(\d{1,3})$/i

let handler = async (m, { text, usedPrefix, command, conn }) => {
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) {
    return m.reply(
      `ꕥ 𝖸𝖠 𝖤𝖲𝖳𝖠𝖲 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Estado :: Ya te encuentras en la base de datos.\n` +
      `      • Anular :: Para eliminar tu registro usa:\n` +
      `        \`${usedPrefix}unreg ${sn}\`\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  if (!Reg.test(text)) {
    return m.reply(
      `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖢𝖮𝖱𝖱𝖤𝖢𝖳𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      • Ejemplo :: *${usedPrefix + command} Waguri,18*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Recuerda ingresar tu nombre y edad separados por una coma. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  let [_, name, ageStr] = text.match(Reg)
  name = name.trim()
  let age = parseInt(ageStr)

  if (!name || !age) {
    return m.reply(
      `ꕥ Nombre o edad no válidos.\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }
  
  if (name.length > 100) {
    return m.reply(
      `ꕥ El nombre no puede superar los 100 caracteres.\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }
  
  if (age < 5 || age > 100) {
    return m.reply(
      `ꕥ La edad ingresada debe estar entre 5 y 100 años.\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    )
  }

  let d = new Date()
  let week = d.toLocaleDateString('es-ES', { weekday: 'long' })
  let date = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  let time = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss')

  user.name = name
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let caption = `
ꕥ 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)

      𓈒 ◌ㅤ──    *𝖣𝖠𝖳𝖮𝖲 𝖣𝖤𝖫 𝖴𝖲𝖴𝖠𝖱𝖨𝖮*
      • Nombre :: ${name}
      • Edad :: ${age} años
      • Código SN :: ${sn}

      𓈒 ◌ㅤ──    *𝖥𝖤𝖢𝖧𝖠 𝖸 𝖧𝖮𝖱𝖠*
      • Fecha :: ${week}, ${date}
      • Hora :: ${time}

ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Tus datos han sido guardados exitosamente en la base de datos. »

> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`.trim()

  const thumbnail = fs.readFileSync('../../media/ryo1.jpg')

  await conn.sendMessage(m.chat, {
    image: thumbnail,
    caption,
    footer: '𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ',

    optionText: 'Opciones de navegación',
    optionTitle: 'Registro exitoso',

    nativeFlow: [
      {
        text: 'Menú Principal',
        sections: [
          {
            title: 'Navegación',
            rows: [
              {
                title: 'Ver Menú de Comandos',
                id: '.menu'
              }
            ]
          }
        ]
      },
      {
        text: 'Copiar SN',
        copy: sn
      }
    ]
  }, { quoted: m })
}

handler.help = ['reg']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler
