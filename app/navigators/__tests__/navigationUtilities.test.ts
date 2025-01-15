import fs from "fs"
import path from "path"

describe("Check for console logs in files", () => {
  // Recursive function to find all .ts and .tsx files
  function findFiles(dir: string): string[] {
    const files = fs.readdirSync(dir)
    let allFiles: string[] = []

    files.forEach((file) => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !fullPath.includes("node_modules")) {
        // Recursively search subdirectories, excluding node_modules
        allFiles = allFiles.concat(findFiles(fullPath))
      } else if (
        stat.isFile() &&
        (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) &&
        !fullPath.endsWith(".test.ts") && // Exclude test files
        !fullPath.endsWith(".test.tsx")
      ) {
        allFiles.push(fullPath)
      }
    })

    return allFiles
  }

  // Find all files starting from /app folder
  const appPath = path.join(__dirname, "..", "..")
  const appFiles = findFiles(appPath)

  // Test each found file
  appFiles.forEach((filePath) => {
    it(`should not have console.log outside __DEV__ blocks in ${path.relative(appPath, filePath)}`, () => {
      const fileContent = fs.readFileSync(filePath, "utf8")
      const lines = fileContent.split("\n")

      let insideDevBlock = false
      let lineNumber = 0

      lines.forEach((line, index) => {
        lineNumber = index + 1

        // Check if entering a block containing __DEV__
        if (line.includes("if") && line.includes("__DEV__")) {
          insideDevBlock = true
        }

        // Check if exiting a block (found '}')
        if (insideDevBlock && line.trim() === "}") {
          insideDevBlock = false
        }

        // Look for console.log, .warn, or .error outside __DEV__ blocks
        if (!insideDevBlock) {
          const hasConsoleLog = line.includes("console.log(")
          const hasConsoleWarn = line.includes("console.warn(")
          const hasConsoleError = line.includes("console.error(")

          if (hasConsoleLog || hasConsoleWarn || hasConsoleError) {
            throw new Error(
              `Console statement found outside __DEV__ block in ${path.relative(appPath, filePath)}:${lineNumber}: ${line.trim()}`,
            )
          }
        }
      })
    })
  })
})
