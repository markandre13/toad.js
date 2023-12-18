import { expect } from "@esm-bundle/chai"
import { ModelReason } from "@toad/model/Model"
import { OptionModel } from "@toad/model/OptionModel"
import { ValueModelReason } from "@toad/model/ValueModel"

describe("OptionModel", function () {
    describe("value", function () {
        it("can be set to a value not in the list", function () {
            const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
            expect(model.value).equals("Down")

            model.value = "NIL"

            expect(model.value).equals("NIL")
        })
        it("value change triggers ModelReason.VALUE signal", function () {
            const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
            let reason: void | ValueModelReason | ModelReason | undefined
            model.modified.add((a) => (reason = a))

            model.value = "Left"
            expect(reason).to.equal(ModelReason.VALUE)
        })
    })
    describe("setMapping()", function () {
        it("sets a new mapping and triggers ModelReason.ALL", function () {
            const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
            let reason: void | ValueModelReason | ModelReason | undefined
            model.modified.add((a) => (reason = a))
            expect(model.index).to.equal(1)

            model.setMapping(["Left", "Right", "Up", "Down"])

            expect(reason).to.equal(ModelReason.ALL)
            expect(model.index).to.equal(3)
        })
        describe("does not signal a change when the new mapping equals the current one", function () {
            it("mapping is same instance of object", function () {
                // const mapping = [[false, "false"], [true, "true"]]
                const mapping = [
                    [0, "false"],
                    [1, "true"],
                ]

                const model = new OptionModel(1, mapping as any) // FIXME: WTF?

                let reason: void | ValueModelReason | ModelReason | undefined
                model.modified.add((a) => (reason = a))
                expect(model.index).to.equal(1)

                model.setMapping(mapping as any)

                expect(reason).to.equal(undefined)
                expect(model.index).to.equal(1)
            })
            it("mapping has same values (list of strings)", function () {
                const model = new OptionModel("Down", ["Up", "Down"])

                let reason: void | ValueModelReason | ModelReason | undefined
                model.modified.add((a) => (reason = a))
                expect(model.index).to.equal(1)

                model.setMapping(["Up", "Down"])

                expect(reason).to.equal(undefined)
                expect(model.index).to.equal(1)
            })

            it("mapping has same values (list of int to string)", function () {
                const model = new OptionModel(1, [
                    [0, "false"],
                    [1, "true"],
                ])

                let reason: void | ValueModelReason | ModelReason | undefined
                model.modified.add((a) => (reason = a))
                expect(model.index).to.equal(1)

                model.setMapping([
                    [0, "false"],
                    [1, "true"],
                ])

                expect(reason).to.equal(undefined)
                expect(model.index).to.equal(1)
            })
        })
    })
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
