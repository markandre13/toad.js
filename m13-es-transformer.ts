import * as typescript from 'typescript'
import * as path from 'path'
import { existsSync, readFileSync } from 'fs'
import { normalize } from 'path'

// How TypeScript's rootDirs, baseUrl & paths work is documented in the TypeScript
// source in src/compiler/moduleNameResolver.ts

// * if a baseUrl is given, then absolute paths will be prefixed with the baseUrl
// * "paths": { PATTERN: [SUBSTITUTION, ...], ...  }
// * PATTERN and SUBSTITUTION can have 0-1 '*' (which means that we can just split at '*')
// * if multiple patterns match, match with the longest prefix is choosen
// * the * in PATTERN is to be replaced with the * in SUBSTITUTION

// precedende: package or file?
// const packageName = moduleName.split("/")[0]
// if (existsSync(`node_modules/${packageName}`)) {
//     console.log(`${moduleName} IS A PACKAGE`)
//     return
// }

let previousFilename: string | undefined

type ImportOrExportDeclaration = (typescript.ImportDeclaration | typescript.ExportDeclaration) & { moduleSpecifier: typescript.StringLiteral }

const transformer = (program: typescript.Program) => (transformationContext: typescript.TransformationContext) => (sourceFile: typescript.SourceFile) => {

    function transformAST(node: typescript.Node): typescript.VisitResult<typescript.Node> {

        if (isImportExportDeclaration(node)) {

            // TODO 1
            // WHEN LOOKING INTO THE PRE-COMPILED TOAD.JS IN FRETBOARD
            // IMPORTS INTO MODULES ARE NOT TRANSLATED BY THE CODE
            // TODO 2
            // npm run dev:test -- lib/test/table/ColAnimation.spec.js
            // IN lib/src/table/adapter/GridAdapter.js NOT ALL IMPORTS WHERE ADJUSTED

            const compilerOptions = program.getCompilerOptions()

            if (compilerOptions.baseUrl &&
                !node.moduleSpecifier.text.startsWith('.')
            ) {
                let newModuleName =
                    // resolveModuleToFilename(program, node) ??
                    // resolveFileInsideModuleToFilename(program, node) ??
                    resolveBaseUrlAndPath(program, node)

                if (newModuleName !== undefined) {
                    if (!newModuleName.endsWith(".js")) {
                        newModuleName += ".js"
                    }
                    // console.log(`CHANGE '${moduleName}' TO '${newModuleName}'`)
                    const newModuleSpecifier = typescript.factory.createStringLiteral(newModuleName)
                    if (typescript.isImportDeclaration(node)) {
                        return typescript.factory.updateImportDeclaration(node, node.modifiers, node.importClause, newModuleSpecifier, node.assertClause)
                    } else if (typescript.isExportDeclaration(node)) {
                        return typescript.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, newModuleSpecifier, node.assertClause)
                    }
                }
                // console.log(`FAILED TO TRANSFORM ABSOLUTE IMPORT/EXPORT OF ${moduleName}`)
            }

            if (shouldMutateModuleSpecifier(node)) {
                const newModuleSpecifier = typescript.factory.createStringLiteral(`${node.moduleSpecifier.text}.js`)
                if (typescript.isImportDeclaration(node)) {
                    return typescript.factory.updateImportDeclaration(node, node.modifiers, node.importClause, newModuleSpecifier, node.assertClause)
                } else if (typescript.isExportDeclaration(node)) {
                    return typescript.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, newModuleSpecifier, node.assertClause)
                }
            }
        }

        return typescript.visitEachChild(node, transformAST, transformationContext)
    }

    function isImportExportDeclaration(node: typescript.Node): node is ImportOrExportDeclaration {
        return (typescript.isImportDeclaration(node) || typescript.isExportDeclaration(node))
            && node.moduleSpecifier !== undefined
            && typescript.isStringLiteral(node.moduleSpecifier)
    }

    function shouldMutateModuleSpecifier(node: ImportOrExportDeclaration) {
        // only when path is relative
        if (!node.moduleSpecifier.text.startsWith('./') &&
            !node.moduleSpecifier.text.startsWith('../')) {
            return false
        }
        // only when module specifier has no extension
        if (path.extname(node.moduleSpecifier.text) !== '') {
            return false
        }
        return true
    }

    return typescript.visitNode(sourceFile, transformAST)
}

export default transformer

function resolveModuleToFilename(program: typescript.Program, node: ImportOrExportDeclaration): string | undefined {

    let moduleName = node.moduleSpecifier.text

    if (existsSync(`node_modules/${moduleName}`) && existsSync(`node_modules/${moduleName}/package.json`)) {
        const pkg = JSON.parse(
            readFileSync(`node_modules/${moduleName}/package.json`, 'utf8')
        )
        if ("module" in pkg) {
            const resolved = `node_modules/${moduleName}/${pkg["module"]}`
            let filename = ((node as any)?.parent?.fileName) ?? (node as any)?.original?.parent?.fileName
            const compilerOptions = program.getCompilerOptions()
            filename = filename.substring(compilerOptions.baseUrl!.length + 1)
            const relative = fromToFile(filename, resolved)
            // console.log(`FILENAME: ${filename}`)
            // console.log(`RESOLVED: ${resolved}`)
            // console.log(`RELATIVE: ${relative}`)
            // console.log("-----------------------------------")
            return relative
        }
    }
    return undefined
}

function resolveFileInsideModuleToFilename(program: typescript.Program, node: ImportOrExportDeclaration): string | undefined {
    let moduleName = node.moduleSpecifier.text
    if (!existsSync(`node_modules/${moduleName}.js`)) {
        return undefined
    }
    const resolved = `node_modules/${moduleName}.js`
    // console.log(`FOUND ${filename}`)
    let filename = ((node as any)?.parent?.fileName) ?? (node as any)?.original?.parent?.fileName
    // console.log(`MODULE  : ${moduleName}`)
    // console.log(`FILENAME: ${filename}`)
    if (filename === undefined) {
        // console.log(`NO FILENAME FOR FILE WITHIN MODULE ${moduleName} (USUALLY GENERATED BY JSX PARSER)`)
        // // console.log(program.getCurrentDirectory())
        // console.log("program ------------------")
        // console.log(program)
        // console.log("node ------------------")
        // console.log(node)
        // if (typescript.isImportDeclaration(node)) {
        //     console.log("importClause ------------------")
        //     console.log(node.importClause)
        // }
        // console.log("moduleSpecifier -----------------")
        // console.log(node.moduleSpecifier)
        // return `NO-FILENAME-${moduleName}`
        return undefined
    }
    // console.log(node)
    const compilerOptions = program.getCompilerOptions()
    filename = filename.substring(compilerOptions.baseUrl!.length + 1)
    const relative = fromToFile(filename, resolved)
    // console.log(`RESOLVED: ${resolved}`)
    // console.log(`RELATIVE: ${relative}`)
    // console.log("-----------------------------------")
    return relative
}

function resolveBaseUrlAndPath(program: typescript.Program, node: ImportOrExportDeclaration): string | undefined {
    let moduleName = node.moduleSpecifier.text
    const compilerOptions = program.getCompilerOptions()
    if (compilerOptions?.baseUrl == undefined) {
        return undefined
    }

    let filename = ((node as any)?.parent?.fileName) ?? (node as any)?.original?.parent?.fileName
    if (filename === undefined) {
        // console.log(`FAILED TO FIND FILENAME FOR IMPORT/EXPORT OF ${moduleName}`)
        return
    }
    console.log(filename)

    if (filename.startsWith(compilerOptions.baseUrl)) {
        const fromFile = filename.substring(compilerOptions.baseUrl.length + 1).split("/")
        for (let adjustedModuleName of tsPathResolver(compilerOptions, moduleName)) {
            // ts,tsx,js,jsx,...
            let found = false
            for (let ext of ["ts", "tsx", "js", "jsx"]) {
                const absoluteModuleName = normalize(`${compilerOptions.baseUrl}/${adjustedModuleName}.${ext}`)
                // console.log(`baseUrl           : ${compilerOptions.baseUrl}`)
                // console.log(`filename          : ${filename}`)
                // console.log(`moduleName        : ${moduleName}`)
                // console.log(`adjustedModuleName: ${adjustedModuleName}`)
                // console.log(`absoluteModuleName: ${absoluteModuleName}`)
                if (existsSync(`${absoluteModuleName}`)) {
                    found = true
                    break
                }
            }
            if (!found) {
                // console.log(`FAILED TO FIND ${compilerOptions.baseUrl}/${adjustedModuleName}.(t|j)s[x] FOR ${moduleName}`)
                // console.log("-------------------------------------------------")
                continue
            }

            const toFile = adjustedModuleName.split("/")

            const maxDepth = Math.min(fromFile.length, toFile.length)
            let equalUntilDepth = 0
            let x = ""
            while (equalUntilDepth < maxDepth && fromFile[equalUntilDepth] == toFile[equalUntilDepth]) {
                x += `${toFile[equalUntilDepth]}/`
                ++equalUntilDepth
            }
            // console.log(`x                 : ${x}`)

            let relativeModuleName = "../".repeat(fromFile.length - equalUntilDepth - 1) // -1 is the file itself
            if (relativeModuleName.length === 0) {
                relativeModuleName = "./"
            }

            for (; equalUntilDepth < toFile.length; ++equalUntilDepth) {
                relativeModuleName += toFile[equalUntilDepth] + "/"
            }
            relativeModuleName = relativeModuleName.substring(0, relativeModuleName.length - 1) // strip last "/"
            // console.log(`relativeModuleName: ${relativeModuleName}`)
            console.log(`CHANGE IMPORT/EXPORT FROM "${moduleName}" TO "${relativeModuleName}.js AT ${filename}"`)
            return relativeModuleName
        }
    }
}

interface TsPathResolverConfig {
    baseUrl?: string
    paths?: { [key: string]: string[] }
}

function tsPathResolver(
    config: TsPathResolverConfig,
    moduleName: string
): Array<string> {
    if (config.baseUrl === undefined || config.paths === undefined) {
        return [moduleName]
    }
    if (moduleName.charAt(0) == ".") {
        return [moduleName]
    }

    // find the best pattern
    let bestPattern: string | undefined
    let bestPatternsHeadLength = 0

    for (let pattern in config.paths) {
        const asterisk = pattern.indexOf("*")
        if (asterisk !== -1) {
            const pathHead = pattern.substring(0, asterisk)
            const pathTail = pattern.substring(asterisk + 1)
            if (pathHead.length > bestPatternsHeadLength &&
                moduleName.startsWith(pathHead) &&
                moduleName.endsWith(pathTail)
            ) {
                bestPatternsHeadLength = pathHead.length
                bestPattern = pattern
            }
        } else {
            if (pattern.length >= bestPatternsHeadLength &&
                pattern === moduleName
            ) {
                bestPatternsHeadLength = pattern.length
                bestPattern = moduleName
            }
        }
    }

    // apply the best pattern's substitutions
    if (bestPattern !== undefined) {
        const asterisk = bestPattern.indexOf("*")
        if (asterisk !== -1) {
            const pathTail = bestPattern.substring(asterisk + 1)
            const middle = moduleName.substring(asterisk, moduleName.length - pathTail.length)
            const substitutions = config.paths[bestPattern]
            return substitutions.map(substitution => {
                const subAsterisk = substitution.indexOf("*")
                const subHead = substitution.substring(0, subAsterisk)
                const subTail = substitution.substring(subAsterisk + 1)
                return `${subHead}${middle}${subTail}`
            })
        } else {
            return config.paths[bestPattern]
        }
    }
    return [moduleName]
}

function fromToFile(fromFile: string, toFile: string) {
    const fromFileParts = fromFile.split("/")
    const toFileParts = toFile.split("/")

    const maxDepth = Math.min(fromFileParts.length, toFileParts.length)
    let equalUntilDepth = 0
    let x = ""
    while (equalUntilDepth < maxDepth && fromFileParts[equalUntilDepth] == toFileParts[equalUntilDepth]) {
        x += `${toFileParts[equalUntilDepth]}/`
        ++equalUntilDepth
    }

    let relativeModuleName = "../".repeat(fromFileParts.length - equalUntilDepth - 1) // -1 is the file itself
    // if (relativeModuleName.length == 0) {
    //     relativeModuleName = "./"
    // }

    for (; equalUntilDepth < toFileParts.length; ++equalUntilDepth) {
        relativeModuleName += toFileParts[equalUntilDepth] + "/"
    }
    return relativeModuleName = relativeModuleName.substring(0, relativeModuleName.length - 1) // strip last "/"
}
