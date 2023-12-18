import { expect } from "@esm-bundle/chai"
import { OptionModel } from "@toad/model/OptionModel"

describe("OptionModel", function () {
    describe("forEach(callback: (value: V, label: number | string | HtmlElement, label: any) => void): void", function () {
        it(`[ "Up", ...]`, function () {
            const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
            expect(model.value).equals("Down")

            const out: any[][] = []
            model.forEach((value, label, index) => {
                out.push([value, label, index])
            })

            expect(out).to.deep.equal([
                ["Up", "Up", 0],
                ["Down", "Down", 1],
                ["Left", "Left", 2],
                ["Right", "Right", 3],
            ])
        })
        it(`[ [0, "Up"], ...]`, function () {
            enum A {
                UP,
                DOWN,
                LEFT,
                RIGHT,
            }
            const model = new OptionModel(A.DOWN, [
                [A.UP, "Up"],
                [A.DOWN, "Down"],
                [A.LEFT, "Left"],
                [A.RIGHT, "Right"],
            ])
            expect(model.value).equals(A.DOWN)

            const out: any[][] = []
            model.forEach((value, label, index) => {
                out.push([value, label, index])
            })

            expect(out).to.deep.equal([
                [A.UP, "Up", 0],
                [A.DOWN, "Down", 1],
                [A.LEFT, "Left", 2],
                [A.RIGHT, "Right", 3],
            ])
        })
        it("[ [0, <>Up</>], ...]", function () {
            enum A {
                UP,
                DOWN,
                LEFT,
                RIGHT,
            }
            const model = new OptionModel<A>(A.DOWN, [
                [A.UP, <i>Up</i>],
                [A.DOWN, <i>Down</i>],
                [A.LEFT, <i>Left</i>],
                [A.RIGHT, <i>Right</i>],
            ])
            expect(model.value).equals(A.DOWN)

            const out: any[][] = []
            model.forEach((value, label, index) => {
                out.push([value, label, index])
            })

            expect(out).to.deep.equal([
                [A.UP, <i>Up</i>, 0],
                [A.DOWN, <i>Down</i>, 1],
                [A.LEFT, <i>Left</i>, 2],
                [A.RIGHT, <i>Right</i>, 3],
            ])
        })
    })
})


