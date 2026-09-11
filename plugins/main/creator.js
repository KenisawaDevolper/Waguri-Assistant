import { generateWAMessageFromContent } from 'ourin'

let handler = async (m, { conn }) => {
  const msg = generateWAMessageFromContent(
    m.chat,
    {
      interactiveMessage: {
        header: {
          title: '𝖢𝖱𝖤𝖠𝖣𝖮𝖱 / 𝖮𝖶𝖭𝖤𝖱',
          subtitle: 'Información y Contacto'
        },
        body: {
          text: `ꕥ 𝖢𝖱𝖤𝖠𝖣𝖮𝖱 𝖣𝖤𝖫 𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Hola, si tienes alguna pregunta, reporte de errores o necesitas ayuda adicional, puedes comunicarte directamente con el propietario usando los botones de abajo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        },
        footer: {
          text: '𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ'
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_call',
              buttonParamsJson: JSON.stringify({
                display_text: 'Llamar al Creador',
                phone_number: global.nomorown
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Chat de WhatsApp',
                url: `https://wa.me/${global.nomorown}`
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Canal de WhatsApp',
                url: global.linkch
              })
            },
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: 'Copiar Número',
                copy_code: global.nomorown
              })
            },
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: 'Navegación Rápida',
                sections: [
                  {
                    title: 'Comandos del Bot',
                    rows: [
                      {
                        title: 'Menú Principal',
                        description: 'Muestra el menú general del bot',
                        id: '.menu'
                      },
                      {
                        title: 'Estado (Ping)',
                        description: 'Revisa la velocidad de respuesta',
                        id: '.ping'
                      }
                    ]
                  }
                ]
              })
            }
          ]
        }
      }
    },
    {
      quoted: m
    }
  )

  await conn.relayMessage(
    m.chat,
    msg.message,
    { messageId: msg.key.id }
  )
}

handler.help = ['owner']
handler.tags = ['main']
handler.command = /^(owner|creator)$/i

export default handler
