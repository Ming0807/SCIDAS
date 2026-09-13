import fs from "fs"
import path from "path"
import { describe, it, expect } from "vitest"

function getAllSourceFiles(dir: string, extensions = [".tsx", ".ts"]): string[] {
  let files: string[] = []
  if (!fs.existsSync(dir)) return files

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(getAllSourceFiles(fullPath, extensions))
    } else if (
      extensions.some((ext) => entry.name.endsWith(ext)) &&
      !entry.name.endsWith(".test.tsx") &&
      !entry.name.endsWith(".test.ts")
    ) {
      files.push(fullPath)
    }
  }
  return files
}

describe("UI Design System Token Guardrails", () => {
  const rootDir = process.cwd()
  const scanDirs = [
    path.join(rootDir, "src", "app"),
    path.join(rootDir, "src", "components"),
  ]

  const sourceFiles = scanDirs.flatMap((dir) => getAllSourceFiles(dir))

  it("should find source files to scan", () => {
    expect(sourceFiles.length).toBeGreaterThan(0)
  })

  it("should never use arbitrary pixel or rem font sizes (e.g. text-[10px], text-[11px], text-[0.8rem])", () => {
    const violations: { file: string; line: number; match: string }[] = []
    const arbitraryFontSizeRegex = /\btext-\[(\d+px|\d+(\.\d+)?rem)\]/g

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf8")
      const lines = content.split("\n")

      lines.forEach((line, index) => {
        const matches = line.match(arbitraryFontSizeRegex)
        if (matches) {
          matches.forEach((match) => {
            violations.push({
              file: path.relative(rootDir, filePath).replace(/\\/g, "/"),
              line: index + 1,
              match,
            })
          })
        }
      })
    }

    expect(
      violations,
      `Found arbitrary font size anti-patterns:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([])
  })

  it("should never use banned rounded-3xl in app or components", () => {
    const violations: { file: string; line: number }[] = []
    const rounded3xlRegex = /\brounded-3xl\b/g

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf8")
      const lines = content.split("\n")

      lines.forEach((line, index) => {
        if (rounded3xlRegex.test(line)) {
          violations.push({
            file: path.relative(rootDir, filePath).replace(/\\/g, "/"),
            line: index + 1,
          })
        }
      })
    }

    expect(
      violations,
      `Found banned rounded-3xl anti-patterns:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([])
  })

  it("should never use hardcoded legacy hex backgrounds (bg-[#f8fafc] or bg-[#4f46e5])", () => {
    const violations: { file: string; line: number; match: string }[] = []
    const hardcodedHexRegex = /\bbg-\[#(f8fafc|4f46e5)\]/gi

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf8")
      const lines = content.split("\n")

      lines.forEach((line, index) => {
        const matches = line.match(hardcodedHexRegex)
        if (matches) {
          matches.forEach((match) => {
            violations.push({
              file: path.relative(rootDir, filePath).replace(/\\/g, "/"),
              line: index + 1,
              match,
            })
          })
        }
      })
    }

    expect(
      violations,
      `Found hardcoded legacy hex backgrounds:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([])
  })
})
