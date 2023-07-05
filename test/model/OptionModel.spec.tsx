import { expect } from "@esm-bundle/chai"
import { span, text } from "@toad/util/lsx"
import { EnumModel } from "@toad/model/EnumModel"
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
            const model = new OptionModel<A>(A.DOWN, [
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

// FIXME: separate file
describe("EnumModel automatically maps all the value in an enum to the UI", function () {
    describe("forEach(callbackfn: (value, label) => void)", function () {
        it("enum Direction { UP, ... }", function () {
            enum A {
                UP,
                DOWN,
                LEFT,
                RIGHT,
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, label, index) => {
                out.push([value, label, index])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", 0],
                [A.DOWN, "DOWN", 1],
                [A.LEFT, "LEFT", 2],
                [A.RIGHT, "RIGHT", 3],
            ])
        })
        it("enum Direction { UP = 100, ... }", function () {
            enum A {
                UP = 100,
                DOWN = 101,
                LEFT = 102,
                RIGHT = 103,
            }
            const model = new EnumModel(A.UP, A)

            const out: any[][] = []
            model.forEach((value, label, index) => {
                out.push([value, label, index])
            })

            expect(out).to.deep.equal([
                [A.UP, "UP", 0],
                [A.DOWN, "DOWN", 1],
                [A.LEFT, "LEFT", 2],
                [A.RIGHT, "RIGHT", 3],
            ])
        })
        it('enum Direction { UP = "Up", ... }', function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.UP, A)

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
        it("enum Direction { UP = <>Up</>, ... }", function () {
            enum A {
                UP = (<i>Up</i>),
                DOWN = (<i>Down</i>),
                LEFT = (<i>Left</i>),
                RIGHT = (<i>Right</i>),
            }
            const model = new EnumModel(A.UP, A)

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
    describe("map<R>(callback: (value: V, label: any) => R): R[]", function () {
        it('enum Direction { UP = "Up", ... }', function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.UP, A)

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
    })
    describe("index", function () {
        it("get index()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.LEFT, A)

            expect(model.index).equals(2)
        })
        it("set index()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.UP, A)

            model.index = 2

            expect(model.value).equals(A.LEFT)
        })
        it("next()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.LEFT, A)

            model.next()
            expect(model.value).equals(A.RIGHT)

            model.next()
            expect(model.value).equals(A.RIGHT)
        })
        it("prev()", function () {
            enum A {
                UP = "Up",
                DOWN = "Down",
                LEFT = "Left",
                RIGHT = "Right",
            }
            const model = new EnumModel(A.DOWN, A)
            model.prev()
            expect(model.value).equals(A.UP)

            model.prev()
            expect(model.value).equals(A.UP)
        })
    })
})
