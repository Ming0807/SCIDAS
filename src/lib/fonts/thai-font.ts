import fs from "node:fs"

let cachedFontBuffer: Buffer | null = null

export function getThaiFontBuffer(): Buffer {
  if (cachedFontBuffer) {
    return cachedFontBuffer
  }

  try {
    const fontUrl = new URL("./Sarabun-Regular.ttf", import.meta.url)
    cachedFontBuffer = fs.readFileSync(fontUrl)
    return cachedFontBuffer
  } catch {
    const fallbackPath = process.cwd() + "/src/lib/fonts/Sarabun-Regular.ttf"
    if (fs.existsSync(fallbackPath)) {
      cachedFontBuffer = fs.readFileSync(fallbackPath)
      return cachedFontBuffer
    }
  }

  throw new Error("Thai font file not found for PDF generation")
}
