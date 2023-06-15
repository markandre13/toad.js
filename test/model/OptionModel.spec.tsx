import { expect } from "@esm-bundle/chai"
import { EnumModel } from "@toad/model/EnumModel"
import { OptionModel } from "@toad/model/OptionModel"

describe("OptionModel", function () {
    describe("forEach(callback: (value: V, key: string, label: any) => void): void", function () {
        it(`[ "Up", ...]`, function () {
            const model = new OptionModel("Down", [
                "Up",
                "Down",
                "Left",
                "Right"
            ])
            expect(model.value).equals("Down")

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                ["Up", "Up", "Up"],
                ["Down", "Down", "Down"],
                ["Left", "Left", "Left"],
                ["Right", "Right", "Right"]
            ])
        })
        it(`[ [0, "Up"], ...]`, function () {
            enum A { UP, DOWN, LEFT, RIGHT }
            const model = new OptionModel<A>(A.DOWN, [
                [A.UP, "Up"],
                [A.DOWN, "Down"],
                [A.LEFT, "Left"],
                [A.RIGHT, "Right"]
            ])
            expect(model.value).equals(A.DOWN)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "0", "Up"],
                [A.DOWN, "1", "Down"],
                [A.LEFT, "2", "Left"],
                [A.RIGHT, "3", "Right"]
            ])
        })
        it("[ [0, <>Up</>], ...]", function () {
            enum A { UP, DOWN, LEFT, RIGHT }
            const model = new OptionModel<A>(A.DOWN, [
                [A.UP, <i>Up</i>],
                [A.DOWN, <i>Down</i>],
                [A.LEFT, <i>Left</i>],
                [A.RIGHT, <i>Right</i>]
            ])
            expect(model.value).equals(A.DOWN)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "0", <i>Up</i>],
                [A.DOWN, "1", <i>Down</i>],
                [A.LEFT, "2", <i>Left</i>],
                [A.RIGHT, "3", <i>Right</i>]
            ])
        })
    })
})

describe("EnumModel automatically maps all the value in an enum to the UI", function () {
    describe("forEach(callbackfn: (value, label) => void)", function () {
        it("enum Direction { UP, ... }", function () {
            enum A { UP, DOWN, LEFT, RIGHT }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", "UP"],
                [A.DOWN, "DOWN", "DOWN"],
                [A.LEFT, "LEFT", "LEFT"],
                [A.RIGHT, "RIGHT", "RIGHT"]
            ])
        })
        it("enum Direction { UP = 100, ... }", function () {
            enum A {
                UP = 100,
                DOWN = 101,
                LEFT = 102,
                RIGHT = 103
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", "UP"],
                [A.DOWN, "DOWN", "DOWN"],
                [A.LEFT, "LEFT", "LEFT"],
                [A.RIGHT, "RIGHT", "RIGHT"]
            ])
        })
        it("enum Direction { UP = \"Up\", ... }", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right"
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", "Up"],
                [A.DOWN, "DOWN", "Down"],
                [A.LEFT, "LEFT", "Left"],
                [A.RIGHT, "RIGHT", "Right"]
            ])
        })
        it("enum Direction { UP = <>Up</>, ... }", function () {
            enum A {
                UP = <i>Up</i>,
                DOWN = <i>Down</i>,
                LEFT = <i>Left</i>,
                RIGHT = <i>Right</i>
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, key, label) => {
                out.push([value, key, label])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", <i>Up</i>],
                [A.DOWN, "DOWN", <i>Down</i>],
                [A.LEFT, "LEFT", <i>Left</i>],
                [A.RIGHT, "RIGHT", <i>Right</i>]
            ])
        })
    })
    describe("map<R>(callback: (value: V, label: any) => R): R[]", function () {
        it("enum Direction { UP = \"Up\", ... }", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right"
            }
            const model = new EnumModel(A.UP, A)

            const out = model.map((value, key, label) => {
                return <option value={key}>{label}</option>
            })

            expect(out).to.deep.equal([
                <option value="UP">Up</option>,
                <option value="DOWN">Down</option>,
                <option value="LEFT">Left</option>,
                <option value="RIGHT">Right</option>
            ])
        })
    })
    describe.only("index", function() {
        it("get index()", function() {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right"
            }
            const model = new EnumModel(A.LEFT, A)

            expect(model.index).equals(2)
        })
        it("set index()", function() {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right"
            }
            const model = new EnumModel(A.UP, A)

            model.index = 2

            expect(model.value).equals(A.LEFT)
        })
        it("next()", function() {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right"
            }
            const model = new EnumModel(A.LEFT, A)

            model.next()
            expect(model.value).equals(A.RIGHT)

            model.next()
            expect(model.value).equals(A.RIGHT)
        })
        it("prev()", function() {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right"
            }
            const model = new EnumModel(A.DOWN, A)
            model.prev()
            expect(model.value).equals(A.UP)

            model.prev()
            expect(model.value).equals(A.UP)
        })
    })
})
