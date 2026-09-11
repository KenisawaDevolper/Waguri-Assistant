import { createCanvas } from "@napi-rs/canvas"
import { performance } from "perf_hooks"
import os from "os"
import config from "../../config.js"
import te from "../../src/lib/rimuru-error.js"

const pluginConfig = {
  name: "ping",
  alias: ["speed", "p", "latency", "sys", "status"],
  category: "main",
  description: "Muestra el rendimiento y estado del sistema en tiempo real con estilo Waguri",
  usage: ".ping",
  example: ".ping",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
}

const fmtSize = (b) => {
  if (!b || b === 0) return "0 B"
  const u = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return (b / Math.pow(1024, i)).toFixed(2) + " " + u[i]
}

const fmtUp = (s) => {
  s = Number(s)
  const d = Math.floor(s / 86400),
    h = Math.floor((s % 86400) / 3600),
    m = Math.floor((s % 3600) / 60),
    sc = Math.floor(s % 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${sc}s`
  return `${m}m ${sc}s`
}

function drawWaguriBox(ctx, x, y, w, h, r, title, color) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()

    const boxGradient = ctx.createLinearGradient(x, y, x, y + h)
    boxGradient.addColorStop(0, 'rgba(42, 28, 48, 0.85)')
    boxGradient.addColorStop(1, 'rgba(22, 16, 28, 0.75)')
    
    ctx.fillStyle = boxGradient
    ctx.fill()
    
    ctx.lineWidth = 1.5
    ctx.strokeStyle = color
    ctx.shadowBlur = 12
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.fillStyle = color
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText(`✿  ${title.toUpperCase()}`, x + 20, y + 35)
    ctx.restore()
}

function drawGauge(ctx, x, y, radius, percentage, color, label) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, radius, 0.75 * Math.PI, 2.25 * Math.PI)
    ctx.lineWidth = 26
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(x, y, radius, 0.75 * Math.PI, 0.75 * Math.PI + (1.5 * Math.PI * (percentage / 100)))
    ctx.lineWidth = 26
    
    const grad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius)
    grad.addColorStop(0, color)
    grad.addColorStop(1, '#ffd6e7')

    ctx.strokeStyle = grad
    ctx.shadowBlur = 20
    ctx.shadowColor = color
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.shadowBlur = 0
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 65px sans-serif'
    ctx.textAlign = 'center'
    
    ctx.shadowBlur = 12
    ctx.shadowColor = color
    ctx.fillText(`${percentage}%`, x, y + 15)
    ctx.shadowBlur = 0
    
    ctx.fillStyle = color
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(label, x, y + 55)
    ctx.textAlign = 'left'
    ctx.restore()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ')
    let line = ''
    let currentY = y
    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY)
        line = words[n] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
}

async function createWaguriPingCanvas(data) {
    const width = 1200
    const height = 800
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Fondo degradado suave estilo Waguri
    const bgGrad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width)
    bgGrad.addColorStop(0, '#241a2c')
    bgGrad.addColorStop(1, '#110c17')
    
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // Detalle decorativo de círculos difuminados
    ctx.beginPath()
    ctx.arc(150, 150, 350, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 182, 193, 0.08)'
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(1050, 650, 320, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(192, 132, 252, 0.08)'
    ctx.fill()

    // Puntos decorativos estéticos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    for(let i = 40; i < width; i += 50) {
        for(let j = 40; j < height; j += 50) {
            ctx.beginPath()
            ctx.arc(i, j, 1.5, 0, 2 * Math.PI)
            ctx.fill()
        }
    }

    // Encabezado
    ctx.fillStyle = '#ffb7c5'
    ctx.font = 'bold 44px sans-serif'
    ctx.shadowBlur = 15
    ctx.shadowColor = '#ffb7c5'
    ctx.fillText('WAGURI SYSTEM MONITOR', 50, 70)
    ctx.shadowBlur = 0
    
    ctx.fillStyle = '#e2d4f0'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(`ESTADO: ACTIVO | SERVIDOR: Waguri Assistant`, 50, 110)
    
    // Línea divisoria
    ctx.beginPath()
    ctx.moveTo(50, 130)
    ctx.lineTo(width - 50, 130)
    ctx.lineWidth = 3
    const lineGrad = ctx.createLinearGradient(50, 130, width - 50, 130)
    lineGrad.addColorStop(0, '#ffb7c5')
    lineGrad.addColorStop(0.5, '#c084fc')
    lineGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = lineGrad
    ctx.stroke()

    const radius = 18

    // Columna 1
    const col1X = 50, colWidth = 330

    drawWaguriBox(ctx, col1X, 160, colWidth, 180, radius, 'LATENCIA PING', '#ff9eb5')
    const pingColor = data.ping < 100 ? '#a7f3d0' : (data.ping < 500 ? '#fde047' : '#fca5a5')
    ctx.fillStyle = pingColor
    ctx.font = 'bold 68px sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowBlur = 15
    ctx.shadowColor = pingColor
    ctx.fillText(`${data.ping}`, col1X + colWidth/2 - 20, 260)
    ctx.shadowBlur = 0
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(`ms`, col1X + colWidth/2 + ctx.measureText(`${data.ping}`).width/2 + 10, 260)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#e2d4f0'
    ctx.font = 'bold 18px sans-serif'
    let pStatus = data.ping < 100 ? 'EXCELENTE' : (data.ping < 500 ? 'MODERADA' : 'LENTA')
    ctx.fillText(`CONEXION: ${pStatus}`, col1X + 20, 310)

    drawWaguriBox(ctx, col1X, 360, colWidth, 230, radius, 'PROCESADOR CPU', '#fde047')
    ctx.fillStyle = '#f8fafc'
    ctx.font = '20px sans-serif'
    wrapText(ctx, data.cpuModel, col1X + 20, 425, colWidth - 40, 28)
    ctx.fillStyle = '#c084fc'
    ctx.font = 'bold 19px sans-serif'
    ctx.fillText(`Nucleos:`, col1X + 20, 520)
    ctx.fillStyle = '#fde047'
    ctx.fillText(`${data.cpuCores} Hilos`, col1X + 110, 520)
    ctx.fillStyle = '#c084fc'
    ctx.fillText(`Velocidad:`, col1X + 20, 555)
    ctx.fillStyle = '#fde047'
    ctx.fillText(`${data.cpuSpeed} MHz`, col1X + 120, 555)

    drawWaguriBox(ctx, col1X, 610, colWidth, 140, radius, 'CARGA DEL SISTEMA', '#ff70a6')
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(`1m:  ${data.load[0]}`, col1X + 20, 680)
    ctx.fillText(`5m:  ${data.load[1]}`, col1X + 20, 710)
    ctx.fillText(`15m: ${data.load[2]}`, col1X + 180, 680)

    // Columna 2
    const col2X = 410, col2Width = 380
    const gaugeX = col2X + col2Width/2
    const gaugeY = 380
    
    ctx.fillStyle = '#ffb7c5'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowBlur = 10
    ctx.shadowColor = '#ffb7c5'
    ctx.fillText('USO DE MEMORIA', gaugeX, 200)
    ctx.shadowBlur = 0
    ctx.textAlign = 'left'

    drawGauge(ctx, gaugeX, gaugeY, 140, data.memPct, '#ff9eb5', 'RAM USADA')

    ctx.fillStyle = '#e2d4f0'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Usada: ${fmtSize(data.usedMem)}`, gaugeX, 580)
    ctx.fillText(`Libre: ${fmtSize(data.freeMem)}`, gaugeX, 615)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText(`TOTAL: ${fmtSize(data.totalMem)}`, gaugeX, 660)
    ctx.textAlign = 'left'

    // Columna 3
    const col3X = 820, col3Width = 330

    drawWaguriBox(ctx, col3X, 160, col3Width, 230, radius, 'MOTOR NODE.JS', '#93c5fd')
    const nY = 220
    const nColor = '#93c5fd'
    ctx.fillStyle = '#e2d4f0'; ctx.font = 'bold 19px sans-serif'
    ctx.fillText(`RSS:`, col3X + 20, nY);       ctx.fillStyle = nColor; ctx.fillText(fmtSize(data.memNode.rss), col3X + 140, nY)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Heap Usado:`, col3X + 20, nY+35); ctx.fillStyle = nColor; ctx.fillText(fmtSize(data.memNode.heapUsed), col3X + 140, nY+35)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Heap Total:`, col3X + 20, nY+70); ctx.fillStyle = nColor; ctx.fillText(fmtSize(data.memNode.heapTotal), col3X + 140, nY+70)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Externo:`, col3X + 20, nY+105); ctx.fillStyle = nColor; ctx.fillText(fmtSize(data.memNode.external), col3X + 140, nY+105)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Motor V8:`, col3X + 20, nY+140); ctx.fillStyle = '#f8fafc'; ctx.fillText(data.v8, col3X + 140, nY+140)

    drawWaguriBox(ctx, col3X, 410, col3Width, 180, radius, 'DETALLES OS', '#c084fc')
    const osY = 470
    ctx.fillStyle = '#e2d4f0'; ctx.font = 'bold 19px sans-serif'
    ctx.fillText(`SO:`, col3X + 20, osY);      ctx.fillStyle = '#f8fafc'; ctx.fillText(`${data.osType} ${data.osRel}`, col3X + 80, osY)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Arch:`, col3X + 20, osY+35);    ctx.fillStyle = '#f8fafc'; ctx.fillText(`${data.osPlatform} (${data.osArch})`, col3X + 80, osY+35)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Host:`, col3X + 20, osY+70);    ctx.fillStyle = '#f8fafc'; ctx.fillText(`${data.osHost}`, col3X + 80, osY+70)
    ctx.fillStyle = '#e2d4f0'; ctx.fillText(`Node:`, col3X + 20, osY+105);   ctx.fillStyle = '#f8fafc'; ctx.fillText(`${data.nodeVer}`, col3X + 80, osY+105)

    drawWaguriBox(ctx, col3X, 610, col3Width, 140, radius, 'TIEMPO ACTIVO', '#f472b6')
    ctx.fillStyle = '#e2d4f0'; ctx.font = 'bold 19px sans-serif'
    ctx.fillText(`Servidor:`, col3X + 20, 670); ctx.fillStyle = '#f472b6'; ctx.font = 'bold 21px sans-serif'; ctx.fillText(data.upOS, col3X + 110, 670)
    ctx.fillStyle = '#e2d4f0'; ctx.font = 'bold 19px sans-serif'
    ctx.fillText(`Bot:`, col3X + 20, 715);    ctx.fillStyle = '#f472b6'; ctx.font = 'bold 21px sans-serif'; ctx.fillText(data.upBot, col3X + 110, 715)

    return canvas.toBuffer('image/png')
}

async function handler(m, { sock }) {
  try {
    const tStart = performance.now()

    const cpus = os.cpus()
    const loadAvg = os.loadavg()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memPct = ((usedMem / totalMem) * 100).toFixed(1)

    const tEnd = performance.now()
    const execTime = (tEnd - tStart).toFixed(0)

    const data = {
        ping: execTime,
        cpuModel: cpus[0]?.model || "Procesador Desconocido",
        cpuSpeed: cpus[0]?.speed || 0,
        cpuCores: cpus.length,
        load: [loadAvg[0].toFixed(2), loadAvg[1].toFixed(2), loadAvg[2].toFixed(2)],
        totalMem, freeMem, usedMem, memPct,
        memNode: process.memoryUsage(),
        osType: os.type(),
        osRel: os.release(),
        osPlatform: os.platform(),
        osArch: os.arch(),
        osHost: os.hostname(),
        nodeVer: process.version,
        v8: process.versions.v8,
        upOS: fmtUp(os.uptime()),
        upBot: fmtUp(process.uptime())
    }

    const imageBuffer = await createWaguriPingCanvas(data)

    const caption = 
      `ꕥ 𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗅⍺ƚᧉ𝗇𝖼ɩ⍺ :: *${data.ping}ms* »\n\n` +
      `      𓈒 ◌ㅤ──    *𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖮𝖯𝖤𝖱𝖠𝖳𝖨𝖵𝖮*\n` +
      `      • SO :: ${data.osType} (${data.osRel})\n` +
      `      • Arquitectura :: ${data.osPlatform} (${data.osArch})\n` +
      `      • Hostname :: ${data.osHost}\n` +
      `      • NodeJS :: ${data.nodeVer}\n` +
      `      • Motor V8 :: ${data.v8}\n\n` +
      `      𓈒 ◌ㅤ──    *𝖯𝖱𝖮𝖢𝖤𝖲𝖠𝖣𝖮𝖱 𝖢𝖯𝖴*\n` +
      `      • Modelo :: ${data.cpuModel.trim()}\n` +
      `      • Núcleos :: ${data.cpuCores} Core(s)\n` +
      `      • Velocidad :: ${data.cpuSpeed} MHz\n` +
      `      • Carga Media :: ${data.load[0]} (1m), ${data.load[1]} (5m), ${data.load[2]} (15m)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖤𝖬𝖮𝖱𝖨𝖠 𝖱𝖠𝖬*\n` +
      `      • Total RAM :: ${fmtSize(data.totalMem)}\n` +
      `      • Usada :: ${fmtSize(data.usedMem)} (${data.memPct}%)\n` +
      `      • Libre :: ${fmtSize(data.freeMem)}\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖤𝖬𝖮𝖱𝖨𝖠 𝖭𝖮𝖣𝖤𝖵𝖲*\n` +
      `      • RSS :: ${fmtSize(data.memNode.rss)}\n` +
      `      • Heap Total :: ${fmtSize(data.memNode.heapTotal)}\n` +
      `      • Heap Usado :: ${fmtSize(data.memNode.heapUsed)}\n` +
      `      • Externo :: ${fmtSize(data.memNode.external)}\n\n` +
      `      𓈒 ◌ㅤ──    *𝖳𝖨𝖤𝖬𝖯𝖮 𝖣𝖤 𝖠𝖢𝖳𝖨𝖵𝖨𝖣𝖠𝖣*\n` +
      `      • Uptime Servidor :: ${data.upOS}\n` +
      `      • Uptime Bot :: ${data.upBot}\n\n` +
      `· ⛁ :: *Cálculo completado en ${data.ping}ms*\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

    await sock.sendMessage(m.chat, { image: imageBuffer, caption: caption }, { quoted: m })

  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
