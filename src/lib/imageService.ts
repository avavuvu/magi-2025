import type { LocalImageService } from "astro"
import sharp from "sharp"
import defaultImageService from "../../node_modules/astro/dist/assets/services/sharp"

const service: LocalImageService = {
    getURL(options) {
        const searchParams = new URLSearchParams();
        searchParams.append('href', typeof options.src === "string" ? options.src : options.src.src);
        if(options.width) {
            searchParams.append("width", String(options.width))
        }

        if(options.quality) {
            searchParams.append("quality", String(options.quality))
        }

        
        return `/_image?${searchParams}`;
    },
    parseURL(url) {
        const params = url.searchParams;

        return {
            src: params.get('href')!,
            width: params.get('width')!,
            quality: params.get('quality') || params.get("origFormat"),
        };
    },

   
    transform: async (inputBuffer, transform, imageConfig) => {
        if(transform.quality !== "dither") {
            return defaultImageService.transform(inputBuffer, transform, imageConfig)
        }

        const image =  sharp(inputBuffer).resize(200).grayscale().gamma(3)
        const buffer = await image.raw().toBuffer({ resolveWithObject: true,})
        const { width, height } = buffer.info
        const { data } = buffer

        const outputWidth = transform.width as string | undefined

        let svg = `<?xml version="1.0" encoding="UTF-8"?>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
            <defs>
            ${levels.map((level, index) => `
                <circle id="i${index}"
                    r=".5"
                    fill="${level}"
                />
            `).join("\n")}
            </defs>
            <rect x="0" y="0" width="${width}" height="${height}"/>
            `

        let uses: string[] = []

        for(let i = 0; i < data.length; i += 1) {
            const x = i % width
            const y = Math.floor(i / width)
            const v = transformPixel(data[i], i, width)
            
            uses.push(`
                <use href="#i${v}"
                        x="${x + 0.5}"
                        y="${y + 0.5}"
                    />
                `)
        }

        svg += uses.join("\n")

        svg += "</svg>"

        const encoder = new TextEncoder()
        const svgBuffer = encoder.encode(svg)

        const svgSharp = sharp(svgBuffer)
        const webpBuffer = await svgSharp.resize(outputWidth ? parseInt(outputWidth) : 1024).webp().toBuffer()

        return new Promise(resolve => resolve({
            data: webpBuffer,
            format: "webp"
        }))
    },
}

export default service

const M = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
]

const levels: string[] = [
    "#000000",
    "#000066",
    "#0000ff",
    "#ffffff",
]

const n = 4

const transformPixel = (color: number, index: number, width: number) => {
    const x = index % width
    const y = Math.floor(index / width)

    const threshold = (M[x % n][y % n] + 0.5) / 16
    const value = color / 255

    const level = Math.floor(value * levels.length + threshold)

    const clamped = Math.min(levels.length - 1, Math.max(0, level))

    return clamped
}

const bayer = (pixels: Buffer<ArrayBufferLike>, width: number) => {
    return pixels.map((color, index) => transformPixel(color, index, width))
}

function minifySvg(svg: string) {
  const rules = [
    { re: /^\s*<\?xml[^>]*>\s*/i,          rep: '' },
    { re: /<!--[\s\S]*?-->/g,             rep: '' },
    { re: /^\s+|\s+$/g,                   rep: '' },
    { re: />\s+</g,                       rep: '><' },
    { re: /\s*=\s*/g,                     rep: '=' },
    { re: / {2,}/g,                       rep: ' ' },
    { re: /\s+\/>/g,                      rep: '/>' },
    { re: /\s+>/g,                        rep: '>' },
    { re: /#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, rep: '#$1$2$3' },
    { re: /(<(?:script|style)[^>]*?)\s+type=(["'])(?:text\/(?:javascript|css))\2/gi, rep: '$1' },
    { re: /\s+\w+=\"\"/g,                 rep: '' },
  ]

  let out = svg
  for (const { re, rep } of rules) out = out.replace(re, rep)
  return out
}
