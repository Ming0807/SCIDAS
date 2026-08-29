import fs from "fs"
import path from "path"

let cachedFontBuffer: Buffer | null = null

export function getThaiFontBuffer(): Buffer {
  if (cachedFontBuffer) {
    return cachedFontBuffer
  }

  const candidatePaths = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src", "lib", "fonts", "tahoma.ttf"),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "fonts", "tahoma.ttf"),
    "C:\\Windows\\Fonts\\tahoma.ttf",
    "C:\\Windows\\Fonts\\leelawad.ttf",
  ]

  for (const fontPath of candidatePaths) {
    try {
      if (fs.existsSync(fontPath)) {
        cachedFontBuffer = fs.readFileSync(fontPath)
        return cachedFontBuffer
      }
    } catch {
      // Continue to next candidate
    }
  }

  throw new Error("Thai font file not found for PDF generation")
}
