import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { basename, dirname } from "path"

declare global {
    namespace Chai {
        interface Assertion {
            toMatchImageSnapshot(expected: Mocha.Context): Assertion
        }
        interface Assert {
            toMatchImageSnapshot(val: Buffer, exp: Mocha.Context, msg?: string): void
        }
    }
}
export function chaiMatchImageSnapshot(chai: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
    var Assertion = chai.Assertion
    var assertionPrototype = Assertion.prototype
    Assertion.addMethod('toMatchImageSnapshot', function (expected) {
        var actual = utils.flag(this, 'object')
        var showDiff = chai.config.showDiff

        assertionPrototype.assert.call(this,
            compare(expected, actual),
            'expected snapshot to match image',
            'expected snapshot not to match image',
            // 'expected #{act} to match image #{exp}',
            // 'expected #{act} to not match image #{exp}',
            expected,
            actual,
            showDiff
        )
    })

    chai.assert.toMatchImageSnapshot = function (val, exp, msg) {
        new chai.Assertion(val, msg).to.be.toMatchImageSnapshot(exp)
    }

    function compare(expected: Mocha.Context, actual: Buffer): boolean {
        const testFile = expected.test!.file!

        let dirName = dirname(testFile)
        dirName += `/__image_snapshots__`

        let imageFile = dirName
        imageFile += `/`
        imageFile += `${basename(testFile)}-${fullTestName(expected.test!)}`.replaceAll(/[^0-9a-zA-Z]/g, "-")
        imageFile += "-1-snap.png"

        if (!existsSync(imageFile)) {
            if (!existsSync(dirName)) {
                mkdirSync(dirName)
            }
            writeFileSync(imageFile, actual)
            return true
        }

        const expectedImg = PNG.sync.read(readFileSync(imageFile))
        const actualImg = PNG.sync.read(actual)
        const { width, height } = actualImg
        const diff = new PNG({ width, height })
        const numberOfMismatchedPixels = pixelmatch(expectedImg.data, actualImg.data, diff.data, width, height, { threshold: 0.1 })

        return numberOfMismatchedPixels === 0
    }

    function fullTestName(t: Mocha.Runnable | Mocha.Suite | undefined): string {
        if (t === undefined) {
            return ""
        }
        const pt = fullTestName(t.parent)
        if (pt.length === 0) {
            return t.title
        }
        return pt + "-" + t.title
    }
}