const fs = require("fs")
const Prism = require("prismjs")
require("prismjs/components/prism-jsx")
require("prismjs/components/prism-tsx")

for (const dir of fs.readdirSync("docs")) {
    try {
        const filenameIn = `docs/${dir}/index.tsx`
        const filenameOut = `docs/${dir}/index.source.ts`
        const source = fs
            .readFileSync(filenameIn)
            .toString()
            .replace(/\s*import\s+{\s+code\s+}.*/, "")
            .replace(/\s*{code}\s*/, "")

        const highlight = Prism
            .highlight(source, Prism.languages.tsx, 'tsx')
            .replace(/\n/g, "\\n")
            .replace(/"/g, "\\\"")
        fs.writeFileSync(filenameOut,
            `export const code = document.createElement("pre")
code.className = "language-tsx"
code.innerHTML = "${highlight}"`)
    }
    catch (e) { }
}

// for (const filename of ["docs/00_introduction/index.tsx"]) {
//     const source = fs
//         .readFileSync(filename)
//         .toString()
//         .replace(/\s*import\s+{\s+code\s+}.*/, "")
//         .replace(/\s*{code}\s*/, "")

//     const highlight = Prism
//         .highlight(source, Prism.languages.tsx, 'tsx')
//         .replace(/\n/g, "\\n")
//         .replace(/"/g, "\\\"")
//     fs.writeFileSync(filename.replace(/\.ts[|x]$/, ".source.ts"),
//         `export const code = document.createElement("pre")
// code.className = "language-tsx"
// code.innerHTML = "${highlight}"`)
// }
