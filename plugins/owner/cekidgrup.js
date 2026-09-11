import { generateWAMessageFromContent, proto } from 'ourin'

const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa dipakai di grup.')

  try {
    await m.react('🆔')

    const id = m.chat
    const teks = `
📌 *CEK ID GRUP*

🆔 ID Grup:
${id}
`

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: teks
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ"
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copy ID Grup",
                    copy_code: id
                  })
                }
              ]
            })
          })
        }
      }
    }, {})

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.log(e)
    m.reply('❌ Error mengambil ID grup.')
  }
}

handler.help = ['cekidgc']
handler.tags = ['tools']
handler.command = /^cekid(gc|grup)?$/i
handler.owner = true

export default handler