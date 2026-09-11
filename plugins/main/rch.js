/**
 * WhatsApp Channel Reactor
 * Author: Omegatech
 * Version: 1.1 (Updated Jwt)
 */

import axios from 'axios'

class ReactChannel {
  constructor(config) {
    this.userJwt = config.userJwt
    this.siteKey = '6LemKk8sAAAAAH5PB3f1EspbMlXjtwv5C8tiMHSm'
    this.backendUrl = 'https://back.asitha.top/api'

    this.http = axios.create({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.userJwt}`
      },
      timeout: 30000
    })
  }

  async getRecaptchaToken() {
    const { data } = await axios.get(
      'https://omegatech-api.dixonomega.tech/api/tools/recaptcha-v3',
      {
        params: {
          sitekey: this.siteKey,
          url: 'https://back.asitha.top/api',
          use_enterprise: 'false'
        }
      }
    )

    if (!data?.success || !data?.token) {
      throw new Error('Fallo en bypass de Recaptcha: ' + (data?.message || 'Sin token devuelto'))
    }

    return data.token
  }

  async getTempApiKey(token) {
    const { data } = await this.http.post(
      `${this.backendUrl}/user/get-temp-token`,
      { recaptcha_token: token }
    )

    if (!data?.token) throw new Error('Fallo al obtener la API key temporal')

    return data.token
  }

  async reactToPost(postLink, reacts) {
    const recaptcha = await this.getRecaptchaToken()
    const tempKey = await this.getTempApiKey(recaptcha)

    const { data } = await this.http.post(
      `${this.backendUrl}/channel/react-to-post?apiKey=${tempKey}`,
      {
        post_link: postLink,
        reacts
      }
    )

    return data
  }
}

let handler = async (m, { args, usedPrefix, command }) => {

  if (!args[0]) {
    const usageText = 
      `ꕥ 𝖱𝖤𝖠𝖢𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖤 𝖢𝖠𝖭𝖠𝖫 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗎𝗌𝗈 ᑯᧉ𝗅 𝖼𝗈𝗆⍺𝗇ᑯ𝗈 »\n\n` +
      `      𓈒 ◌ㅤ──    𝗎𝗌𝗈 :: *${usedPrefix + command} <enlace> <emojis>*\n` +
      `      𓈒 ◌ㅤ──    ᧉ𝗹ᧉ𝗆𝗉𝗅𝗈 :: *${usedPrefix + command} https://whatsapp.com/channel/xxx 👍,❤️*\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    return m.reply(usageText)
  }

  try {
    const input = args.join(' ')
    const [postLink, ...emojiParts] = input.split(' ')
    const reactsRaw = emojiParts.join(' ')

    if (!postLink || !reactsRaw)
      return m.reply('✐ Formato inválido ! ୧ ֹ ִ')

    if (!postLink.includes('whatsapp.com/channel/'))
      return m.reply('✐ Enlace de canal de WhatsApp no válido ! ୧ ֹ ִ')

    const emojis = reactsRaw
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)

    if (!emojis.length)
      return m.reply('✐ No se proporcionaron emojis ! ୧ ֹ ִ')

    if (emojis.length > 4)
      return m.reply('✐ Máximo 4 emojis permitidos ! ୧ ֹ ִ')

    const client = new ReactChannel({
      userJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NTZmMzhjOTllNGEzOTVlOWM0ZTc3NSIsImlhdCI6MTc3NzE2NjQ0MiwiZXhwIjoxNzc3NzcxMjQyfQ.V3yZRhC5aVoFX7rwRwjIUGLH9Ly8mz4BsqgRA8ZOcH0'
    })

    await client.reactToPost(postLink, emojis.join(','))

    const successCaption = 
      `ꕥ 𝖱𝖤𝖠𝖢𝖢𝖨𝖮𝖭𝖤𝖲 𝖤𝖭𝖵𝖨𝖠𝖣𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗋ᧉ𝗌𝗎𝗅ƚ⍺ᑯ𝗈 »\n\n` +
      `      𓈒 ◌ㅤ──    ᧉ𝗌ƚ⍺ᑯ𝗈 :: *Reacciones enviadas correctamente*\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    m.reply(successCaption)

  } catch (e) {
    console.error('React Error:', e.response?.data || e.message)
    m.reply(`✐ Error al enviar las reacciones: ${e.response?.data?.message || e.message} ! ୧ ֹ ִ`)
  }
}

handler.help = ['rch <enlace> <emojis>']
handler.tags = ['tools']
handler.command = /^(rch|reactch)$/i

export default handler
