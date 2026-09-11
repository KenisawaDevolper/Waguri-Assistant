let handler = async (m, { conn, args, usedPrefix, command }) => {
    const from = m.chat

    try {
        await conn.sendRich(from, [
          {
            text: '# ✨ @itsliaaa/starcore\n\n---\n',
          }, 
          {
            language: 'javascript',
            code: `console.log("Hello World")`
          }, 
          {
            title: 'The Table',
            table: [
              {
                isHeading: true,
                items: ['', 'Node.js', 'Bun', 'Deno']
              }, 
              {
                isHeading: false,
                items: ['Engine', 'V8 (C++)', 'JavaScriptCore (C++)', 'V8 (C++)']
              }, 
              {
                isHeading: false,
                items: ['Performance', '4/5', '5/5', '4/5']
              }
            ]
          }, 
          {
            extWidget: [
              {
                title: '📋 Section 1',
                buttons: ['menu', 'label', 'infos']
              }, 
              {
                title: '📄 Section 2',
                buttons: ['gif', 'runtime', 'order']
              }
            ],
            canScroll: false
          }, 
          {
            htmlPayload: `<h1>✨ @itsliaaa/starcore</h1><p>A lightweight Baileys wrapper designed to make WhatsApp bot development simpler, cleaner, and more flexible.</p>`,
            trustedSources: ['https://github.com/itsliaaa/starcore']
          }, 
          {
            video: 'https://path-to-video.com/',
            thumbnailUrl: 'https://path-to-tiny-image.com/',
            mime: 'video/mp4',
            fileLength: 13603,
            duration: 60
          }, 
          {
            image: 'https://path-to-image.com/',
            mime: 'image/jpeg'
          }, 
          {
            imagine: 'https://path-to-image.com/',
            mime: 'image/jpeg'
          }, 
          {
            reels: [
              {
                reelUrl: 'https://path-to-web.com/',
                thumbnailUrl: 'https://path-to-image.com/',
                creator: 'Lia Wynn',
                avatarUrl: 'https://path-to-tiny-image.com/',
                title: 'Simple Baileys Wrapper',
                likesCount: 1,
                sharesCount: 1,
                viewCount: 1,
                source: 'https://path-to-web.com/',
                isVerified: true
              }
            ]
          }, 
          {
            posts: [
              {
                caption: 'Lightweight Baileys Wrapper',
                title: '',
                subtitle: '',
                creator: 'Lia Wynn',
                avatarUrl: 'https://path-to-tiny-image.com/',
                thumbnailUrl: 'https://path-to-image.com/',
                likesCount: 1,
                commentsCount: 1,
                sharesCount: 1,
                postUrl: 'https://path-to-web.com/',
                deepLink: '',
                footerLabel: '',
                footerIcon: '',
                sourceApp: 'FACEBOOK',
                orientation: 'LANDSCAPE',
                type: 'IMAGE',
                isVerified: true,
                isCarousel: false
              }
            ]
          }, 
          {
            title: 'Starseed Premium Script',
            brand: 'Starseed',
            price: 'Rp 150.000',
            salePrice: 'Rp 75.000',
            productUrl: 'https://path-to-web.com/',
            imageUrl: 'https://path-to-image.com/',
            additionalImages: [{ url: 'https://path-to-tiny-image.com/' }]
          }, 
          {
            products: [
              {
                title: 'Starseed Premium Script',
                brand: 'Starseed',
                price: 'Rp 150.000',
                salePrice: 'Rp 75.000',
                productUrl: 'https://path-to-web.com/',
                imageUrl: 'https://path-to-image.com/'
              }, 
              {
                title: 'Self-Bot Script',
                brand: 'Starseed',
                price: 'Rp 50.000',
                productUrl: 'https://path-to-web.com/',
                imageUrl: 'https://path-to-image.com/',
                additionalImages: [{ url: 'https://path-to-tiny-image.com/' }]
              }
            ]
          }, 
          {
            latex: 'https://quicklatex.com/cache3/82/ql_0676ade0cd04eda37aeb3d0bcd427682_l3.png',
            expression: 'x^2 + 2x + 1',
            mime: 'image/png',
            width: 603,
            height: 111,
            fontHeight: 83.5,
            padding: 15
          }, 
          {
            text: '- Citation:',
            entities: [
              {
                title: 'Example of Citation',
                citationUrl: 'https://wa.me/0',
                displayName: '@itsliaaa/starcore'
              }
            ]
          }, 
          {
            text: '- Inline Link:',
            entities: [
              {
                inlineUrl: 'https://wa.me/0',
                displayName: '@itsliaaa/starcore',
                isTrusted: true
              }
            ]
          }, 
          {
            text: '- LaTeX:',
            entities: [
              {
                expression: 'x^2 + 2x + 1',
                latex: 'https://quicklatex.com/cache3/82/ql_0676ade0cd04eda37aeb3d0bcd427682_l3.png',
                width: 603,
                height: 111,
                fontHeight: 83.5,
                padding: 15
              }
            ]
          }, 
          {
            suggestion: '@itsliaaa/starcore'
          }, 
          {
            suggestions: ['@itsliaaa/starcore', 'Baileys Wrapper', 'Baileys']
          }, 
          {
            suggestions: ['@itsliaaa/starcore', 'Rich Response', 'Scroll Layout'],
            canScroll: true
          }, 
          {
            tip: '@itsliaaa/starcore'
          }, 
          {
            foaText: '# 🔥 LARGE Text'
          }, 
          {
            actionUrls: [
              {
                text: '💰 Donate Me!',
                url: 'https://saweria.co/itsliaaa'
              }, 
              {
                text: '🌐 Google',
                url: 'https://www.google.com/'
              }
            ]
          }, 
          {
            searchResults: [
              {
                displayName: 'Simple Baileys Wrapper',
                sourceUrl: 'https://path-to-web.com/',
                faviconUrl: 'https://path-to-tiny-image.com/',
                mime: 'image/jpeg' 
              }
            ]
          }
        ], m, {
          notify: false, 
          disclaimerText: 'Example Usage of sendRich()',
          streamText: false
        })

    } catch (e) {
        console.error('Error enviando mensaje Rich:', e)
        await conn.reply(from, `❌ Error: ${e.message || e}`, m)
    }
}

handler.help = ['rich', 'richmsg', 'testrich']
handler.tags = ['owner']
handler.command = /^(rich|richmsg|testrich)$/i
handler.rowner = true

export default handler
