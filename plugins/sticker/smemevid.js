import fs from 'fs'
import path from 'path'
import os from 'os'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { createCanvas } from '@napi-rs/canvas'
import config from '../../config.js'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const pluginConfig = {
    name: 'smemevid',
    alias: ['smemevideo', 'memevid'],
    category: 'sticker',
    description: '𝖢𝗋ᧉ⍺ 𝗎𝗇 𝗌ƚı𝖼𝗄ᧉ𝗋 𝖽ᧉ 𝗆ᧉ𝗆ᧉ ⍺ 𝗉⍺𝗋ƚı𝗋 𝖽ᧉ 𝗎𝗇 𝗏ı𝖽ᧉ𝗈',
    usage: '.smemevid <⍺𝗋𝗋ı𝖻⍺>|<⍺𝖻⍺𝗃𝗈>',
    example: '.smemevid 𝖡𝖮𝖭𝖨𝖳𝖮|¿𝖯𝖮𝖱 𝖰𝖴É 𝖭𝖮 𝖠𝖬𝖡𝖮𝖲?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isVideo = m.isVideo || (m.quoted && m.quoted.isVideo) || (m.quoted && m.quoted.type === 'videoMessage')
    if (!isVideo) {
        return m.reply(`*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n> _¿Buscas un bot para tu comunidad? ≽^• ˕ • ྀི≼_\n\n## ꕥ *ꜱᴛᴇʟʟᴀʀ ᴡᴀ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n🎬 *ʍᴇᴍᴇ ᴠɪᴅᴇᴏ*\n\n> 𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ 𝗈 ᧉ𝗇𝗏í⍺ 𝗎𝗇 𝗏ı𝖽ᧉ𝗈 𝖼𝗈𝗇 𝗎𝗇 𝗍ᧉ𝗑ƚ𝗈\n\n\`𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: ${m.prefix}smemevid 𝖡𝗈𝗇ıƚ𝗈|𝖠𝖻⍺𝗃𝗈\`\n\n> ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ツ`)
    }

    const input = m.args.join(' ')
    if (!input || !input.includes('|')) {
        return m.reply(`*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n> _¿Buscas un bot para tu comunidad? ≽^• ˕ • ྀི≼_\n\n## ꕥ *ꜱᴛᴇʟʟᴀʀ ᴡᴀ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n🎬 *ʍᴇᴍᴇ ᴠɪᴅᴇᴏ*\n\n> 𝖥𝗈𝗋𝗆⍺ƚ𝗈: ⍺𝗋𝗋ı𝖻⍺|⍺𝖻⍺𝗃𝗈\n\n\`𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: ${m.prefix}smemevid 𝖠𝖭𝖢𝖧𝖮 𝖮 𝖠𝖫𝖳𝖮|¿𝖯𝖮𝖱 𝖰𝖴É 𝖭𝖮 𝖠𝖬𝖡𝖮𝖲?\`\n\n> ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ツ`)
    }

    const [top, bottom] = input.split('|').map(s => s.trim().toUpperCase())

    m.react('🕕')

    try {
        let mediaBuffer
        if (m.quoted) {
            mediaBuffer = await m.quoted.download()
        } else if (m.download) {
            mediaBuffer = await m.download()
        }

        if (!mediaBuffer) {
            m.react('❌')
            return m.reply(`❌ *ᧉ𝗋𝗋𝗈𝗋*\n\n> 𝖭𝗈 𝗌ᧉ 𝗉𝗎𝖽𝗈 𝖽𝖾𝗌𝖼⍺𝗋𝗀⍺𝗋 ᧉ𝗅 𝗏ı𝖽ᧉ𝗈`)
        }

        const tempId = Date.now()
        const inputVideo = path.join(os.tmpdir(), `vid-${tempId}.mp4`)
        const outputVideo = path.join(os.tmpdir(), `vid-out-${tempId}.mp4`)
        const overlayImage = path.join(os.tmpdir(), `overlay-${tempId}.png`)

        fs.writeFileSync(inputVideo, mediaBuffer)

        const getMetadata = (file) => {
            return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(file, (err, metadata) => {
                    if (err) reject(err)
                    else resolve(metadata)
                })
            })
        }

        const metadata = await getMetadata(inputVideo)
        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        if (!videoStream) throw new Error('𝖭𝗈 𝗌ᧉ ᧉ𝗇𝖼𝗈𝗇ƚ𝗋ó ᧉ𝗅 𝖿𝗅𝗎𝗃𝗈 𝖽ᧉ 𝗏ı𝖽ᧉ𝗈')

        const size = 512

        const canvas = createCanvas(size, size)
        const ctx = canvas.getContext('2d')

        const drawMemeText = (ctx, text, x, y, width, isBottom) => {
            if (!text) return

            ctx.fillStyle = 'white'
            ctx.strokeStyle = 'black'
            ctx.textAlign = 'center'
            ctx.textBaseline = isBottom ? 'bottom' : 'top'
            ctx.lineJoin = 'round'

            let fontSize = Math.floor(width / 8)
            ctx.font = `bold ${fontSize}px Impact, Arial`

            while (ctx.measureText(text).width > width - 20) {
                fontSize -= 2
                ctx.font = `bold ${fontSize}px Impact, Arial`
                if (fontSize < 10) break
            }

            ctx.lineWidth = Math.floor(fontSize / 6)
            ctx.strokeText(text, x, y)
            ctx.fillText(text, x, y)
        }

        drawMemeText(ctx, top, size / 2, 10, size, false)
        drawMemeText(ctx, bottom, size / 2, size - 10, size, true)

        const bufferImage = canvas.toBuffer('image/png')
        fs.writeFileSync(overlayImage, bufferImage)

        await new Promise((resolve, reject) => {
            ffmpeg(inputVideo)
                .input(overlayImage)
                .complexFilter([
                    `[0:v]crop='min(iw,ih)':'min(iw,ih)',scale=${size}:${size},fps=8[vid]`,
                    `[vid][1:v]overlay=0:0[out]`
                ])
                .outputOptions([
                    '-map [out]',
                    '-an',
                    '-c:v libx264',
                    '-preset fast',
                    '-crf 26',
                    '-t 4'
                ])
                .save(outputVideo)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
        })

        const stickerConfig = config.sticker || { packname: 'rimuru-AI', author: 'Bot' }

        await sock.sendVideoAsSticker(m.chat, outputVideo, m, {
            packname: stickerConfig.packname,
            author: stickerConfig.author
        })

        m.react('✅')

        try {
            fs.unlinkSync(inputVideo)
            fs.unlinkSync(outputVideo)
            fs.unlinkSync(overlayImage)
        } catch (e) { }

    } catch (error) {
        m.react('☢')
        m.reply(`❌ *ᧉ𝗋𝗋𝗈𝗋*\n\n> 𝖮𝖼𝗎𝗋𝗋ıó 𝗎𝗇 ᧉ𝗋𝗋𝗈𝗋 ⍺𝗅 𝗉𝗋𝗈𝖼ᧉ𝗌⍺𝗋 ᧉ𝗅 𝗏ı𝖽ᧉ𝗈`)
    }
}

export { pluginConfig as config, handler }
