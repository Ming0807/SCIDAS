import { describe, it, expect } from "vitest"
import { compressImageFile } from "./image-compressor"

describe("compressImageFile", () => {
  it("passes non-image files through untouched", async () => {
    const pdfBlob = new Blob(["dummy pdf content"], { type: "application/pdf" })
    const pdfFile = new File([pdfBlob], "document.pdf", { type: "application/pdf" })

    const result = await compressImageFile(pdfFile)
    expect(result).toBe(pdfFile)
    expect(result.name).toBe("document.pdf")
  })

  it("passes already small image files (under 250KB) through untouched", async () => {
    const smallContent = new Uint8Array(100 * 1024) // 100KB
    const smallFile = new File([smallContent], "small.jpg", { type: "image/jpeg" })

    const result = await compressImageFile(smallFile)
    expect(result).toBe(smallFile)
    expect(result.size).toBe(100 * 1024)
  })
})
