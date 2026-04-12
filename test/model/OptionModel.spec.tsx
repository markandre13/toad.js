import { expect } from "chai"
import { OptionModel } from "@toad/model/OptionModel"
import { VALUE } from "@toad/model/ValueModel"
import { ALL } from "@toad/model/Model"
import { makeOptionMapping } from "@toad/model/OptionModelBase"

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
            let reason: any
            model.signal.add((a) => (reason = a))

            model.value = "Left"
            expect(reason.type).to.equal(VALUE)
        })
    })
    describe("setMapping()", function () {
        it("sets a new mapping and triggers ModelReason.ALL", function () {
            const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
            let reason: any
            model.signal.add((a) => (reason = a))
            expect(model.index).to.equal(1)

            model.setMapping(["Left", "Right", "Up", "Down"])

            expect(reason.type).to.equal(ALL)
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

                let reason: any
                model.signal.add((a) => (reason = a))
                expect(model.index).to.equal(1)

                model.setMapping(mapping as any)

                expect(reason).to.equal(undefined)
                expect(model.index).to.equal(1)
            })
            it("mapping has same values (list of strings)", function () {
                const model = new OptionModel("Down", ["Up", "Down"])

                let reason: any
                model.signal.add((a) => (reason = a))
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

                let reason: any
                model.signal.add((a) => (reason = a))
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
    describe("id and mapping function", () => {
        interface Camera {
            id: string,
            name: string
        }
        const cameras: Camera[] = [
            { id: "B0B255DB-22AC-4826-B8B6-ACA5F9CAC646", name: "sony pcr101" },
            { id: "924580AC-7ECA-4497-8603-29B30E78342A", name: "canon xm-1" },
            { id: "1C9AEF84-B37A-49A9-8045-982F0A3D506D", name: "olympus d-600l" }
        ]
        const activeCamera = new OptionModel(
            undefined,
            cameras,
            v => makeOptionMapping(
                v?.id ? v.id : "null",
                v?.name ? v.name : "none"
            ), { label: "camera" })

        it("set id", () => {
            activeCamera.id = cameras[1].id
            expect(activeCamera.html.childNodes[0].textContent).to.equal(cameras[1].name)
        })
        it("get id", () => {
            activeCamera.value = cameras[2]
            expect(activeCamera.id).to.equal(cameras[2].id)
        })
    })
})
